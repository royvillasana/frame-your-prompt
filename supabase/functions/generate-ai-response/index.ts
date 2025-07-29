import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API configurations for different AI models
const AI_CONFIGS = {
  'llama-3.1-8b': {
    provider: 'free',
    systemPrompt: `You are an expert UX Designer specialized in generating detailed and practical content based on UX framework prompts.

Your objective is to provide structured, specific, and actionable responses that help UX designers at each stage of their projects.

IMPORTANT INSTRUCTIONS:
1. Always respond in English
2. Structure your response clearly and organized
3. Provide specific examples when relevant
4. Ensure all recommendations are practical and applicable
5. Maintain a professional but accessible tone
6. If the prompt includes numbered sections, respond following that exact structure
7. Do not include any commentary, explanations, or formatting. Just return the prompt only
8. Do not explain what the prompt does—just return the full prompt ready to copy and paste
9. Do not use markdown, bullets, or titles. Just raw prompt content
10. Your only job is to generate a prompt to be used in another AI. Return only the raw prompt text. No commentary, no explanation, no headers, no markdown formatting. The output should be a single block of plain text that I can copy and paste directly`
  },
  'gpt-4o-mini': {
    provider: 'openai',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    maxTokens: 2000,
    temperature: 0.7,
    systemPrompt: `You are an expert UX Designer specialized in generating detailed and practical content based on UX framework prompts.

Your objective is to provide structured, specific, and actionable responses that help UX designers at each stage of their projects.

IMPORTANT INSTRUCTIONS:
1. Always respond in English
2. Structure your response clearly and organized
3. Provide specific examples when relevant
4. Ensure all recommendations are practical and applicable
5. Maintain a professional but accessible tone
6. If the prompt includes numbered sections, respond following that exact structure
7. Do not include any commentary, explanations, or formatting. Just return the prompt only
8. Do not explain what the prompt does—just return the full prompt ready to copy and paste
9. Do not use markdown, bullets, or titles. Just raw prompt content
10. Your only job is to generate a prompt to be used in another AI. Return only the raw prompt text. No commentary, no explanation, no headers, no markdown formatting. The output should be a single block of plain text that I can copy and paste directly`
  },
  'llama-3.1-sonar-small-128k-online': {
    provider: 'perplexity',
    apiUrl: 'https://api.perplexity.ai/chat/completions',
    model: 'llama-3.1-sonar-small-128k-online',
    maxTokens: 2000,
    temperature: 0.2,
    systemPrompt: `You are an expert UX Designer specialized in generating detailed and practical content based on UX framework prompts.

Your objective is to provide structured, specific, and actionable responses that help UX designers at each stage of their projects.

IMPORTANT INSTRUCTIONS:
1. Always respond in English
2. Structure your response clearly and organized
3. Provide specific examples when relevant
4. Ensure all recommendations are practical and applicable
5. Maintain a professional but accessible tone
6. If the prompt includes numbered sections, respond following that exact structure
7. Do not include any commentary, explanations, or formatting. Just return the prompt only
8. Do not explain what the prompt does—just return the full prompt ready to copy and paste
9. Do not use markdown, bullets, or titles. Just raw prompt content
10. Your only job is to generate a prompt to be used in another AI. Return only the raw prompt text. No commentary, no explanation, no headers, no markdown formatting. The output should be a single block of plain text that I can copy and paste directly`
  }
};

// Add validation for both input and output
function validatePromptFormat(prompt: string): { isValid: boolean; error?: string } {
  // Check for markdown formatting
  if (prompt.includes('```') || prompt.includes('###') || prompt.includes('---')) {
    return { isValid: false, error: 'Response contains markdown formatting' };
  }

  // Check for explanatory text or commentary
  if (prompt.toLowerCase().includes('here\'s') || 
      prompt.toLowerCase().includes('note:') ||
      prompt.toLowerCase().includes('explanation:')) {
    return { isValid: false, error: 'Response contains commentary or explanations' };
  }

  // Check for bullet points or numbered lists that aren't part of the content
  const bulletRegex = /^\s*[-•*]\s/m;
  const numberedListRegex = /^\s*\d+\.\s/m;
  if (bulletRegex.test(prompt) || numberedListRegex.test(prompt)) {
    return { isValid: false, error: 'Response contains bullet points or numbered lists' };
  }

  // Check for headers or titles
  const headerRegex = /^\s*[A-Z][^\n.!?]*:\s*$/m;
  if (headerRegex.test(prompt)) {
    return { isValid: false, error: 'Response contains headers or titles' };
  }

  return { isValid: true };
}

function validateAIResponse(response: string): { isValid: boolean; error?: string } {
  // Check for markdown formatting
  if (response.includes('```') || response.includes('###') || response.includes('---')) {
    return { isValid: false, error: 'Response contains markdown formatting' };
  }

  // Check for explanatory text or commentary
  if (response.toLowerCase().includes('here\'s') || 
      response.toLowerCase().includes('note:') ||
      response.toLowerCase().includes('explanation:')) {
    return { isValid: false, error: 'Response contains commentary or explanations' };
  }

  // Check for bullet points or numbered lists that aren't part of the content
  const bulletRegex = /^\s*[-•*]\s/m;
  const numberedListRegex = /^\s*\d+\.\s/m;
  if (bulletRegex.test(response) || numberedListRegex.test(response)) {
    return { isValid: false, error: 'Response contains bullet points or numbered lists' };
  }

  // Check for headers or titles
  const headerRegex = /^\s*[A-Z][^\n.!?]*:\s*$/m;
  if (headerRegex.test(response)) {
    return { isValid: false, error: 'Response contains headers or titles' };
  }

  return { isValid: true };
}

// Modify the AI call functions to include validation
async function callOpenAI(prompt: string, apiKey: string, maxTokens: number = 2000): Promise<string> {
  const config = AI_CONFIGS['gpt-4o-mini'];
  
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
      max_tokens: Math.min(maxTokens, config.maxTokens),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error de OpenAI: ${errorData.error?.message || 'Error desconocido'}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;

  // Validate the response
  const validation = validateAIResponse(aiResponse);
  if (!validation.isValid) {
    throw new Error(`Invalid AI response format: ${validation.error}. Please try again.`);
  }

  return aiResponse;
}

async function callPerplexity(prompt: string, apiKey: string, modelId: string): Promise<string> {
  const config = AI_CONFIGS[modelId as keyof typeof AI_CONFIGS];
  
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error de Perplexity AI: ${errorData.error?.message || 'Error desconocido'}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;

  // Validate the response
  const validation = validateAIResponse(aiResponse);
  if (!validation.isValid) {
    throw new Error(`Invalid AI response format: ${validation.error}. Please try again.`);
  }

  return aiResponse;
}

async function serve(req) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Edge function started');
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    console.log('User authenticated:', user.id);

    // Get request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      throw new Error('Invalid request body');
    }
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const { prompt, projectContext, selectedFramework, frameworkStage, selectedTool, aiModel = 'llama-3.1-8b' } = requestBody;

    // Log received context
    console.log('Received prompt:', prompt ? 'Present' : 'Missing');
    console.log('Received projectContext:', projectContext ? 'Present' : 'Missing');
    console.log('Received selectedFramework:', selectedFramework ? 'Present' : 'Missing');
    console.log('Received frameworkStage:', frameworkStage ? 'Present' : 'Missing');
    console.log('Received selectedTool:', selectedTool ? 'Present' : 'Missing');

    if (!prompt || !projectContext) {
      throw new Error('Missing required context to generate a new prompt.');
    }

    console.log('Using AI model:', aiModel);

    if (!AI_CONFIGS[aiModel as keyof typeof AI_CONFIGS]) {
      throw new Error('Modelo de IA no soportado');
    }

    // Get API keys for checking user type
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('openai_api_key, perplexity_api_key')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error getting profile:', profileError);
    }

    // Determine user type and limits
    const hasApiKey = !!(profile?.openai_api_key || profile?.perplexity_api_key);
    const isRegistered = true; // User is authenticated, so registered

    // Check usage limits using the updated database function
    const { data: usageCheck, error: usageError } = await supabaseClient.rpc(
      'check_and_update_ai_usage',
      {
        p_user_id: user.id,
        p_ai_model: aiModel,
        p_is_registered: isRegistered,
        p_has_api_key: hasApiKey
      }
    );

    if (usageError) {
      throw new Error(`Error checking usage: ${usageError.message}`);
    }

    if (!usageCheck?.can_use) {
      const userType = usageCheck?.user_type || 'registered_free';
      let limitMessage = '';
      
      if (userType === 'registered_free') {
        limitMessage = `Has alcanzado tu límite mensual de ${usageCheck?.monthly_limit || 6} prompts. Configura una API key en tu perfil para obtener acceso ilimitado.`;
      } else if (userType === 'guest') {
        limitMessage = `Has alcanzado tu límite mensual de ${usageCheck?.monthly_limit || 2} prompts. Regístrate para obtener más prompts gratuitos.`;
      } else {
        limitMessage = `Has alcanzado el límite mensual para ${aiModel}.`;
      }
      
      throw new Error(limitMessage);
    }

    // Determine token limits based on user type
    let maxTokens = 2000; // Default for users with API keys
    if (!hasApiKey) {
      maxTokens = isRegistered ? 800 : 400; // Registered without API: 800, Guest: 400
    }

    // Check if model is free (doesn't require API key)
    const isFreeModel = aiModel === 'llama-3.1-8b';
    let aiResponse: string;

    if (isFreeModel) {
      // Call free model (will throw error to show alert)
      aiResponse = await callFreeModel(prompt, aiModel);
    } else {
      // For premium models, use the profile we already loaded
      if (!profile) {
        throw new Error('Error al obtener el perfil del usuario.');
      }

      const config = AI_CONFIGS[aiModel as keyof typeof AI_CONFIGS];
      let apiKey: string;

      if (config.provider === 'perplexity') {
        if (!profile?.perplexity_api_key) {
          throw new Error('API key de Perplexity no configurada. Ve a tu perfil para configurarla.');
        }
        apiKey = profile.perplexity_api_key;
        aiResponse = await callPerplexity(prompt, apiKey, aiModel);
      } else if (config.provider === 'openai') {
        // Try user's API key first, then fall back to Supabase key for registered users
        if (profile?.openai_api_key) {
          apiKey = profile.openai_api_key;
        } else if (isRegistered) {
          // Use Supabase OpenAI API key for registered users without their own key
          const supabaseOpenAIKey = Deno.env.get('OPENAI_API_KEY');
          if (!supabaseOpenAIKey) {
            throw new Error('Servicio de IA temporalmente no disponible. Intenta más tarde o configura tu propia API key.');
          }
          apiKey = supabaseOpenAIKey;
        } else {
          throw new Error('API key de OpenAI no configurada. Regístrate o configura tu propia API key en tu perfil.');
        }
        aiResponse = await callOpenAI(prompt, apiKey, maxTokens);
      } else {
        throw new Error('Proveedor de IA no soportado');
      }
    }

    // Save the generated prompt and response to database
    const { error: saveError } = await supabaseClient
      .from('generated_prompts')
      .insert({
        user_id: user.id,
        project_context: projectContext,
        selected_framework: selectedFramework,
        framework_stage: frameworkStage,
        selected_tool: selectedTool,
        original_prompt: prompt,
        ai_response: aiResponse,
      });

    if (saveError) {
      console.error('Error saving to database:', saveError);
    }

    // Validate the input prompt format
    const validation = validatePromptFormat(prompt);
    if (!validation.isValid) {
      throw new Error(`Invalid prompt format: ${validation.error}`);
    }

    return new Response(JSON.stringify({ 
      aiResponse,
      usage: usageCheck
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in generate-ai-response function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Error interno del servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}