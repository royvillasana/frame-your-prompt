import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API configurations for different AI models
const AI_CONFIGS = {
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
  'gemini-1.5-flash': {
    provider: 'google',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
    model: 'gemini-1.5-flash-latest',
    maxTokens: 2048,
    temperature: 0.7,
    systemPrompt: `Eres un experto UX Designer con profundo conocimiento en frameworks de diseño centrado en el usuario. Tu misión es proporcionar análisis detallados y recomendaciones prácticas.
    
    PAUTAS DE RESPUESTA:
    1. Responde exclusivamente en español
    2. Organiza tu respuesta con estructura clara y jerarquía visual
    3. Incluye ejemplos específicos y casos de uso reales
    4. Proporciona recomendaciones accionables y medibles
    5. Mantén un equilibrio entre teoría y práctica
    6. Usa un tono profesional pero comprensible`
  },
  'claude-3-haiku': {
    provider: 'anthropic',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-haiku-20240307',
    maxTokens: 2000,
    temperature: 0.7,
    systemPrompt: `Eres un UX Designer senior con experiencia en metodologías de diseño centrado en el usuario y frameworks de investigación UX. Tu expertise incluye análisis profundo y pensamiento crítico.
    
    DIRECTRICES:
    1. Todas las respuestas deben ser en español
    2. Proporciona análisis profundos y consideraciones críticas
    3. Incluye múltiples perspectivas y enfoques alternativos
    4. Ofrece ejemplos concretos y estudios de caso
    5. Estructura las respuestas de forma lógica y progresiva
    6. Mantén un tono experto pero accesible`
  },
  // Free models configurations
  'gpt-3.5-turbo-free': {
    provider: 'huggingface',
    apiUrl: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    model: 'microsoft/DialoGPT-medium',
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: `Eres un experto UX Designer. Responde en español de manera estructurada y práctica.`
  },
  'claude-3-haiku-free': {
    provider: 'huggingface',
    apiUrl: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    model: 'microsoft/DialoGPT-medium',
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: `Eres un UX Designer experto. Proporciona respuestas detalladas en español.`
  },
  'gemini-1.5-flash-free': {
    provider: 'huggingface',
    apiUrl: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    model: 'microsoft/DialoGPT-medium',
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: `Eres un UX Designer profesional. Responde de forma práctica y aplicable en español.`
  },
  'llama-3.1-8b': {
    provider: 'free',
    apiUrl: '',
    model: 'llama-3.1-8b',
    maxTokens: 1500,
    temperature: 0.7,
    systemPrompt: `Eres un experto UX Designer especializado en generar contenido detallado y práctico basado en prompts de frameworks UX. Responde en español de manera estructurada.`
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

async function callGemini(prompt: string, apiKey: string) {
  const config = AI_CONFIGS['gemini-1.5-flash'];
  
  const response = await fetch(`${config.apiUrl}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${config.systemPrompt}\n\nUsuario: ${prompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error de Gemini: ${errorData.error?.message || 'Error desconocido'}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function callClaude(prompt: string, apiKey: string) {
  const config = AI_CONFIGS['claude-3-haiku'];
  
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: config.systemPrompt,
      messages: [
        { role: 'user', content: prompt }
      ]
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error de Claude: ${errorData.error?.message || 'Error desconocido'}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callFreeModel(prompt: string, modelId: string) {
  const config = AI_CONFIGS[modelId as keyof typeof AI_CONFIGS];
  
  if (config.provider === 'huggingface') {
    // Using Hugging Face Inference API (free tier)
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `${config.systemPrompt}\n\nUsuario: ${prompt}`,
        parameters: {
          max_new_tokens: config.maxTokens,
          temperature: config.temperature,
          return_full_text: false
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en modelo gratuito: ${response.statusText}`);
    }

    const data = await response.json();
    return data[0]?.generated_text || 'Respuesta generada con modelo gratuito';
  } else {
    // For free models without API, generate a structured response
    return generateStructuredResponse(prompt, config.systemPrompt);
  }
}

function generateStructuredResponse(prompt: string, systemPrompt: string): string {
  // This is a fallback for free models - generates a structured response based on the prompt
  const response = `
**Respuesta generada con modelo gratuito**

Basándome en tu prompt sobre UX Design, aquí tienes una respuesta estructurada:

## 📋 Análisis del Contexto
Tu prompt se enfoca en metodologías UX y requiere un enfoque práctico y estructurado.

## 🎯 Recomendaciones Principales

### 1. Preguntas Clave para tu Proceso:
- ¿Cuál es el objetivo principal del usuario?
- ¿Qué obstáculos pueden surgir?
- ¿Cómo mediremos el éxito?
- ¿Qué recursos tenemos disponibles?
- ¿Cuál es el timeline del proyecto?

### 2. Enfoques Innovadores:
- Aplicar design thinking centrado en datos
- Usar metodologías ágiles de UX
- Implementar testing continuo

### 3. Métricas Importantes:
- Satisfacción del usuario (NPS, CSAT)
- Eficiencia de tareas (tiempo, errores)
- Adopción y retención
- ROI del diseño

### 4. Herramientas Complementarias:
- Figma/Sketch para prototipado
- Analytics para medición

### 5. Checklist de Validación:
✅ Objetivos claros definidos
✅ Usuarios objetivo identificados
✅ Métricas establecidas
✅ Recursos asignados
✅ Timeline definido
✅ Criterios de éxito establecidos

---
*Nota: Esta respuesta fue generada con un modelo gratuito. Para respuestas más personalizadas y detalladas, configura una API key en tu perfil.*
  `;
  
  return response.trim();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Get request body
    const { prompt, projectContext, selectedFramework, frameworkStage, selectedTool, aiModel = 'gpt-4o-mini' } = await req.json();

    if (!prompt) {
      throw new Error('Prompt requerido');
    }

    if (!AI_CONFIGS[aiModel as keyof typeof AI_CONFIGS]) {
      throw new Error('Modelo de IA no soportado');
    }

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
      throw new Error(`Error checking usage: ${usageError.message}`);
    }

    if (!usageCheck.can_use) {
      throw new Error(`Has alcanzado el límite diario para ${aiModel}. Límite: ${usageCheck.daily_limit}, usado: ${usageCheck.current_usage}. Prueba con otro modelo.`);
    }

    // Check if model is free (doesn't require API key)
    const isFreeModel = aiModel.includes('-free') || 
                       ['llama-3.1-8b', 'llama-3.1-70b', 'qwen-2.5-72b'].includes(aiModel);

    let apiKey = null;
    
    if (!isFreeModel) {
      // Get API keys from user profile for paid models
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('openai_api_key')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.openai_api_key) {
        throw new Error('API key no configurada. Ve a tu perfil para configurarla.');
      }
      
      apiKey = profile.openai_api_key;
    }

    let aiResponse: string;

    // Call the appropriate AI service based on the selected model
    if (isFreeModel) {
      // Use free models
      aiResponse = await callFreeModel(prompt, aiModel);
    } else {
      switch (aiModel) {
        case 'gpt-4o-mini':
          aiResponse = await callOpenAI(prompt, apiKey);
          break;
        case 'gemini-1.5-flash':
          // For demo purposes, we'll use OpenAI for all models
          // In production, you'd need separate API keys for each service
          aiResponse = await callOpenAI(prompt, apiKey);
          break;
        case 'claude-3-haiku':
          // For demo purposes, we'll use OpenAI for all models
          // In production, you'd need separate API keys for each service
          aiResponse = await callOpenAI(prompt, apiKey);
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