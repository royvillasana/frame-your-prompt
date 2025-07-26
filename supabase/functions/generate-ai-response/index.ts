import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API configurations for different AI models
const AI_CONFIGS = {
  // Free model that works
  'llama-3.1-8b': {
    provider: 'free',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama3-8b-8192',
    maxTokens: 2000,
    temperature: 0.7,
    systemPrompt: `Eres un experto UX Designer especializado en generar contenido detallado y práctico basado en prompts de frameworks UX. 
    
    Tu objetivo es proporcionar respuestas estructuradas, específicas y accionables que ayuden a los diseñadores UX en cada etapa de sus proyectos.
    
    INSTRUCCIONES IMPORTANTES:
    1. Siempre responde en español
    2. Estructura tu respuesta de manera clara y organizada
    3. Proporciona ejemplos específicos cuando sea relevante
    4. Asegúrate de que todas las recomendaciones sean prácticas y aplicables
    5. Mantén un tono profesional pero accesible
    6. Si el prompt incluye secciones numeradas, responde siguiendo esa estructura exacta`
  },
  // Premium models
  'gpt-4o-mini': {
    provider: 'openai',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    maxTokens: 2000,
    temperature: 0.7,
    systemPrompt: `Eres un experto UX Designer especializado en generar contenido detallado y práctico basado en prompts de frameworks UX. 
    
    Tu objetivo es proporcionar respuestas estructuradas, específicas y accionables que ayuden a los diseñadores UX en cada etapa de sus proyectos.
    
    INSTRUCCIONES IMPORTANTES:
    1. Siempre responde en español
    2. Estructura tu respuesta de manera clara y organizada
    3. Proporciona ejemplos específicos cuando sea relevante
    4. Asegúrate de que todas las recomendaciones sean prácticas y aplicables
    5. Mantén un tono profesional pero accesible
    6. Si el prompt incluye secciones numeradas, responde siguiendo esa estructura exacta`
  },
  'llama-3.1-sonar-small-128k-online': {
    provider: 'perplexity',
    apiUrl: 'https://api.perplexity.ai/chat/completions',
    model: 'llama-3.1-sonar-small-128k-online',
    maxTokens: 2000,
    temperature: 0.2,
    systemPrompt: `Eres un experto UX Designer con acceso a información actualizada. Proporciona respuestas detalladas, estructuradas y basadas en las mejores prácticas actuales. Responde siempre en español de manera profesional y práctica.`
  }
};

async function callOpenAI(prompt: string, apiKey: string) {
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
      max_tokens: config.maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error de OpenAI: ${errorData.error?.message || 'Error desconocido'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callPerplexity(prompt: string, apiKey: string, modelId: string) {
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
      top_p: 0.9,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'month',
      frequency_penalty: 1,
      presence_penalty: 0
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error de Perplexity AI: ${errorData.error?.message || 'Error desconocido'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callFreeModel(prompt: string, modelId: string) {
  const config = AI_CONFIGS[modelId as keyof typeof AI_CONFIGS];
  
  console.log(`Attempting to use real AI API for free model: ${modelId}`);
  
  // Try multiple free AI APIs
  const apis = [
    {
      name: 'Groq',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer gsk_DEMO_KEY'
      },
      body: {
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: config.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature,
        max_tokens: Math.min(config.maxTokens, 1000)
      }
    },
    {
      name: 'Hugging Face',
      url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        inputs: `${config.systemPrompt}\n\nUsuario: ${prompt}\nAsistente:`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false
        }
      }
    }
  ];

  for (const api of apis) {
    try {
      console.log(`Trying ${api.name} API...`);
      
      const response = await fetch(api.url, {
        method: 'POST',
        headers: api.headers,
        body: JSON.stringify(api.body),
      });

      console.log(`${api.name} API Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        
        let generatedText = '';
        
        // Handle different response formats
        if (api.name === 'Groq' && data.choices && data.choices[0]?.message?.content) {
          generatedText = data.choices[0].message.content;
        } else if (api.name === 'Hugging Face' && Array.isArray(data) && data[0]?.generated_text) {
          generatedText = data[0].generated_text.replace(prompt, '').trim();
        }
        
        // Validate response quality
        if (generatedText && generatedText.length > 50) {
          console.log(`Using real AI response from ${api.name}`);
          return generatedText;
        }
      }
    } catch (error) {
      console.error(`Error with ${api.name} API:`, error);
      continue;
    }
  }
  
  // If all APIs failed, throw error instead of using fallback
  throw new Error('No se pudo generar respuesta con IA. Todos los servicios gratuitos están temporalmente no disponibles. Intenta usar un modelo premium con API key.');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Edge function started');
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
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
      console.error('User authentication failed:', userError);
      throw new Error('Usuario no autenticado');
    }

    console.log('User authenticated:', user.id);

    // Get request body
    const requestBody = await req.json();
    console.log('Request body received');
    
    const { prompt, projectContext, selectedFramework, frameworkStage, selectedTool, aiModel = 'llama-3.1-8b' } = requestBody;

    if (!prompt) {
      console.error('No prompt provided');
      throw new Error('Prompt requerido');
    }

    console.log('Using AI model:', aiModel);

    if (!AI_CONFIGS[aiModel as keyof typeof AI_CONFIGS]) {
      console.error('Unsupported AI model:', aiModel);
      throw new Error('Modelo de IA no soportado');
    }

    console.log('Checking AI usage limits...');

    // Check usage limits using the database function
    const { data: usageCheck, error: usageError } = await supabaseClient.rpc(
      'check_and_update_ai_usage',
      {
        p_user_id: user.id,
        p_ai_model: aiModel,
        p_is_registered: true // All authenticated users are considered registered
      }
    );

    if (usageError) {
      console.error('Usage check failed:', usageError);
      throw new Error(`Error checking usage: ${usageError.message}`);
    }

    if (!usageCheck.can_use) {
      console.error('Usage limit exceeded:', usageCheck);
      throw new Error(`Has alcanzado el límite diario para ${aiModel}. Límite: ${usageCheck.daily_limit}, usado: ${usageCheck.current_usage}. Prueba con otro modelo.`);
    }

    console.log('Usage check passed, proceeding with AI call');

    // Check if model is free (doesn't require API key)
    const isFreeModel = aiModel === 'llama-3.1-8b';

    let apiKey = null;
    
    if (!isFreeModel) {
      const config = AI_CONFIGS[aiModel as keyof typeof AI_CONFIGS];
      
      // Get appropriate API key based on provider
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('openai_api_key, perplexity_api_key')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        throw new Error('Error al obtener el perfil del usuario.');
      }

      if (config.provider === 'perplexity') {
        if (!profile?.perplexity_api_key) {
          throw new Error('API key de Perplexity no configurada. Ve a tu perfil para configurarla.');
        }
        apiKey = profile.perplexity_api_key;
      } else {
        if (!profile?.openai_api_key) {
          throw new Error('API key de OpenAI no configurada. Ve a tu perfil para configurarla.');
        }
        apiKey = profile.openai_api_key;
      }
    }

    let aiResponse: string;

    // Call the appropriate AI service based on the selected model
    if (isFreeModel) {
      // Use free models
      aiResponse = await callFreeModel(prompt, aiModel);
    } else {
      switch (aiModel) {
        case 'gpt-4o-mini':
          if (!apiKey) throw new Error('API key requerida para este modelo');
          aiResponse = await callOpenAI(prompt, apiKey);
          break;
        case 'llama-3.1-sonar-small-128k-online':
          if (!apiKey) throw new Error('API key de Perplexity requerida para este modelo');
          aiResponse = await callPerplexity(prompt, apiKey, aiModel);
          break;
        default:
          throw new Error('Modelo de IA no soportado');
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
      // Don't throw error here, just log it
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
});