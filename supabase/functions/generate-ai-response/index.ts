import { createClient } from '@supabase/supabase-js';

// Shared headers for CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Type definitions for AI configurations
type AIConfigBase = { systemPrompt: string; };
type FreeAIConfig = AIConfigBase & { provider: 'free'; };
type PremiumAIConfig = AIConfigBase & {
  provider: 'openai' | 'perplexity';
  apiUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
};
type AIConfig = FreeAIConfig | PremiumAIConfig;

// API configurations for different AI models
const AI_CONFIGS: { [key: string]: AIConfig } = {
  'llama-3.1-8b': {
    provider: 'free',
    systemPrompt: `You are an expert UX Designer...` // Truncated
  },
  'gpt-4o-mini': {
    provider: 'openai',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    maxTokens: 2000,
    temperature: 0.7,
    systemPrompt: `You are an expert UX Designer...` // Truncated
  },
  'llama-3.1-sonar-small-128k-online': {
    provider: 'perplexity',
    apiUrl: 'https://api.perplexity.ai/chat/completions',
    model: 'llama-3.1-sonar-small-128k-online',
    maxTokens: 2000,
    temperature: 0.2,
    systemPrompt: `You are an expert UX Designer...` // Truncated
  }
};

// Helper function to call the free model
async function callFreeModel(prompt: string, modelId: string): Promise<string> {
  throw new Error('The Llama 3.1 8B model is not available yet. Please select another model.');
}

// Helper function to call premium models (OpenAI, Perplexity)
async function callPremiumModel(prompt: string, apiKey: string, config: PremiumAIConfig): Promise<string> {
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'system', content: config.systemPrompt }, { role: 'user', content: prompt }],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`${config.provider} API Error: ${errorData.error?.message || 'Unknown error'}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

// Main Deno server
Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');
  const corsHeadersWithOrigin = {
    ...corsHeaders,
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeadersWithOrigin });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { prompt, aiModel } = await req.json();
    if (!prompt || !aiModel) throw new Error('Missing required fields: prompt and aiModel');

    const config = AI_CONFIGS[aiModel];
    if (!config) throw new Error('Unsupported AI model');

    const { data: profile } = await supabaseClient.from('profiles').select('openai_api_key, perplexity_api_key').eq('user_id', user.id).single();

    let aiResponse: string;
    if (config.provider === 'free') {
      aiResponse = await callFreeModel(prompt, aiModel);
    } else {
      const apiKey = config.provider === 'openai' 
        ? profile?.openai_api_key || Deno.env.get('OPENAI_API_KEY') 
        : profile?.perplexity_api_key;

      if (!apiKey) throw new Error(`API key for ${config.provider} not configured.`);
      
      aiResponse = await callPremiumModel(prompt, apiKey, config);
    }

    return Response.json({ aiResponse }, {
      headers: { ...corsHeadersWithOrigin, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return Response.json({ error: error.message }, {
      status: 500,
      headers: { ...corsHeadersWithOrigin, 'Content-Type': 'application/json' },
    });
  }
});