import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenAI function para modelos premium
async function callOpenAI(prompt: string, apiKey: string, model: string) {
  console.log('Calling OpenAI with model:', model);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { 
          role: 'system', 
          content: 'Eres un asistente especializado en UX que genera prompts contextualizados y específicos para ayudar a diseñadores y equipos de producto en cada etapa de diferentes marcos de trabajo de UX.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  console.log('OpenAI response status:', response.status);

  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI error response:', errorData);
    
    if (response.status === 429) {
      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error?.code === 'insufficient_quota') {
          throw new Error(`La IA ${model} ha agotado sus créditos disponibles. Puedes intentar con otra IA o configurar una API key propia en tu perfil.`);
        }
        throw new Error(`La IA ${model} está temporalmente no disponible (límite de tasa). Intenta nuevamente en unos minutos o usa otra IA.`);
      } catch (parseError) {
        throw new Error(`La IA ${model} está temporalmente no disponible. Intenta con otra IA.`);
      }
    } else if (response.status === 401) {
      throw new Error(`API key inválida para ${model}. Por favor verifica tu configuración en el perfil.`);
    } else if (response.status === 403) {
      throw new Error(`Acceso denegado para ${model}. Verifica los permisos de tu API key.`);
    } else {
      throw new Error(`Error en ${model} (${response.status}): Intenta con otra IA o revisa tu configuración.`);
    }
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// HuggingFace function para modelos gratuitos
async function callHuggingFace(prompt: string, model: string) {
  console.log('Calling HuggingFace with model:', model);
  
  const huggingFaceApiKey = Deno.env.get('HUGGINGFACE_API_KEY');
  if (!huggingFaceApiKey) {
    throw new Error('Los modelos gratuitos están temporalmente no disponibles. Intenta con un modelo premium configurando tu API key en el perfil.');
  }
  
  // Mapear modelos a URLs de HuggingFace
  const modelUrls: { [key: string]: string } = {
    'llama-3.1-8b': 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    'llama-3.1-70b': 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    'qwen-2.5-72b': 'Qwen/Qwen2.5-72B-Instruct'
  };
  
  const modelUrl = modelUrls[model] || modelUrls['llama-3.1-8b'];
  
  const response = await fetch(`https://api-inference.huggingface.co/models/${modelUrl}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${huggingFaceApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

Eres un asistente especializado en UX que genera prompts contextualizados y específicos para ayudar a diseñadores y equipos de producto en cada etapa de diferentes marcos de trabajo de UX.<|eot_id|><|start_header_id|>user<|end_header_id|>

${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

`,
      parameters: {
        max_new_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false
      }
    }),
  });

  console.log('HuggingFace response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.text();
    console.error('HuggingFace error response:', errorData);
    
    if (response.status === 429) {
      throw new Error(`El modelo gratuito ${model} está temporalmente sobrecargado. Intenta con otro modelo gratuito o espera unos minutos.`);
    } else if (response.status === 503) {
      throw new Error(`El modelo gratuito ${model} se está cargando. Intenta nuevamente en 20-30 segundos o usa otro modelo.`);
    } else {
      throw new Error(`Error en modelo gratuito ${model}: Intenta con otro modelo o espera unos minutos.`);
    }
  }

  const data = await response.json();
  console.log('HuggingFace response received');
  
  if (Array.isArray(data) && data[0] && data[0].generated_text) {
    return data[0].generated_text;
  } else {
    console.error('Unexpected HuggingFace response structure:', data);
    throw new Error('Respuesta inesperada del modelo gratuito. Intenta con otro modelo.');
  }
}

// Función para determinar si un modelo es gratuito
function isFreeModel(model: string): boolean {
  const freeModels = ['llama-3.1-8b', 'llama-3.1-70b', 'qwen-2.5-72b'];
  return freeModels.includes(model);
}

// Función para obtener la API key según el proveedor
async function getAPIKeyForModel(supabaseClient: any, userId: string, model: string) {
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('openai_api_key, gemini_api_key, claude_api_key')
    .eq('user_id', userId)
    .single();

  if (profileError) {
    console.error('Profile error:', profileError);
    throw new Error(`Error al obtener el perfil del usuario: ${profileError.message}`);
  }

  // Determinar qué API key necesitamos
  if (model.startsWith('gpt-')) {
    return profile?.openai_api_key;
  } else if (model.startsWith('gemini-')) {
    return profile?.gemini_api_key;
  } else if (model.startsWith('claude-')) {
    return profile?.claude_api_key;
  }
  
  return null;
}

serve(async (req) => {
  console.log('=== AI RESPONSE FUNCTION START ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('1. Getting auth header...');
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    console.log('2. Initializing Supabase client...');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    console.log('3. Getting user...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('User error:', userError);
      throw new Error('Usuario no autenticado');
    }
    console.log('User ID:', user.id);

    console.log('4. Parsing request body...');
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      throw new Error('Invalid JSON in request body');
    }
    
    const { prompt, aiModel = 'llama-3.1-8b' } = body;
    
    console.log('Request data:', { aiModel, hasPrompt: !!prompt, bodyKeys: Object.keys(body) });

    if (!prompt) {
      throw new Error('Prompt requerido');
    }

    let aiResponse: string;

    // Verificar si es un modelo gratuito
    if (isFreeModel(aiModel)) {
      console.log('5. Using free model with HuggingFace...');
      
      // Verificar límite de uso para modelos gratuitos
      console.log('5.1. Checking usage limit for free model...');
      const { data: usageResult, error: usageError } = await supabaseClient
        .rpc('check_and_update_ai_usage', {
          p_user_id: user.id,
          p_ai_model: aiModel,
          p_is_registered: true
        });

      if (usageError) {
        console.error('Usage check error:', usageError);
        throw new Error('Error verificando límites de uso');
      }

      if (!usageResult.can_use) {
        throw new Error(`Has alcanzado el límite diario para ${aiModel}. Intenta con otro modelo gratuito o configura una API key premium en tu perfil.`);
      }

      aiResponse = await callHuggingFace(prompt, aiModel);
    } else {
      console.log('5. Using premium model...');
      
      // Para modelos premium, necesitamos API key
      const apiKey = await getAPIKeyForModel(supabaseClient, user.id, aiModel);
      
      if (!apiKey) {
        throw new Error(`Para usar ${aiModel}, necesitas configurar tu API key en tu perfil. También puedes probar con los modelos gratuitos disponibles.`);
      }

      console.log('5.1. Calling premium AI with user API key...');
      aiResponse = await callOpenAI(prompt, apiKey, aiModel);
    }
    
    console.log('6. AI response received, length:', aiResponse.length);

    console.log('7. Returning successful response...');
    return new Response(JSON.stringify({ 
      aiResponse,
      usage: { can_use: true, remaining: "unlimited", daily_limit: "unlimited", current_usage: 0 }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('=== ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Error interno del servidor',
      details: error.stack || 'No stack trace',
      type: error.name || 'Unknown error type'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});