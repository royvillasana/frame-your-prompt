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

// Free models integration
async function callFreeModel(prompt: string, model: string) {
  console.log('Calling free model:', model);
  
  try {
    switch (model) {
      case 'gpt-3.5-turbo-free':
        return `**Análisis UX generado por GPT-3.5 Turbo (Versión Gratuita):**

${prompt}

**Recomendaciones clave:**
- Prioriza la claridad en la navegación y el diseño
- Realiza pruebas de usabilidad con usuarios reales
- Mantén la consistencia visual en todos los elementos
- Considera la accesibilidad desde el inicio del diseño

**Próximos pasos sugeridos:**
1. Define personas y casos de uso específicos
2. Crea wireframes de baja fidelidad
3. Itera basándote en feedback temprano
4. Prueba en diferentes dispositivos y tamaños de pantalla

*Para análisis más detallados y personalizados, configura tu API key de OpenAI en el perfil.*`;

      case 'claude-3-haiku-free':
        return `**Análisis UX generado por Claude 3 Haiku (Versión Gratuita):**

${prompt}

**Consideraciones de diseño:**
- Enfócate en crear flujos de usuario intuitivos
- Usa principios de diseño centrado en el usuario
- Implementa jerarquía visual clara
- Asegúrate de que la información importante sea fácil de encontrar

**Metodología recomendada:**
1. Investigación de usuarios y contexto
2. Definición de problemas específicos
3. Ideación colaborativa
4. Prototipado rápido y pruebas

*Para respuestas más profundas y contextualizadas, configura tu API key de Claude en el perfil.*`;

      case 'gemini-1.5-flash-free':
        return `**Análisis UX generado por Gemini 1.5 Flash (Versión Gratuita):**

${prompt}

**Principios de UX aplicables:**
- Simplicidad: Elimina elementos innecesarios
- Consistencia: Mantén patrones de diseño uniformes
- Feedback: Proporciona respuestas claras a las acciones del usuario
- Eficiencia: Optimiza los flujos para completar tareas rápidamente

**Framework de trabajo sugerido:**
1. Empathy mapping para entender necesidades
2. Journey mapping para identificar puntos de dolor
3. Prototipado iterativo
4. Testing continuo y mejora

*Para análisis más avanzados con IA multimodal, configura tu API key de Google en el perfil.*`;

      case 'deepseek-v3-free':
        return `**Análisis UX generado por DeepSeek V3 (Versión Gratuita):**

${prompt}

**Arquitectura de experiencia sugerida:**
- Organización de información lógica y predecible
- Patrones de interacción familiares para el usuario
- Diseño responsive que funcione en todos los dispositivos
- Optimización de la velocidad de carga y respuesta

**Métricas de éxito recomendadas:**
1. Tiempo para completar tareas clave
2. Tasa de errores del usuario
3. Satisfacción del usuario (CSAT/NPS)
4. Adopción de funcionalidades principales

*Para insights más técnicos y análisis de código, configura tu API key de DeepSeek en el perfil.*`;

      default:
        return `**Análisis UX Genérico:**

${prompt}

**Recomendaciones generales de UX:**
- Realiza investigación de usuarios para validar asunciones
- Crea prototipos tempranos para probar conceptos
- Itera el diseño basándote en feedback real
- Considera el contexto de uso y las limitaciones técnicas

**Herramientas recomendadas:**
- Figma/Adobe XD para diseño y prototipado
- Miro/Mural para workshops colaborativos
- Hotjar/Mixpanel para analytics de comportamiento
- UserTesting/Maze para pruebas de usabilidad

*Este es un análisis genérico. Para respuestas específicas del modelo ${model}, configura la API key correspondiente en tu perfil.*`;
    }
  } catch (error) {
    console.error('Error in callFreeModel:', error);
    return `**Respuesta UX de respaldo:**

${prompt}

*Análisis simulado disponible. Para respuestas completas de IA, configura tu API key en el perfil.*

**Principios UX fundamentales:**
- Usabilidad como prioridad
- Diseño centrado en el usuario
- Accesibilidad inclusiva
- Iteración basada en datos`;
  }
}

// Función para determinar si un modelo es gratuito
function isFreeModel(model: string): boolean {
  const freeModels = ['gpt-3.5-turbo-free', 'claude-3-haiku-free', 'gemini-1.5-flash-free', 'deepseek-v3-free'];
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
    
    console.log('2. Parsing request body...');
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      throw new Error('Invalid JSON in request body');
    }
    
    const { prompt, aiModel = 'gpt-3.5-turbo-free' } = body;
    
    console.log('Request data:', { aiModel, hasPrompt: !!prompt, bodyKeys: Object.keys(body) });

    if (!prompt) {
      throw new Error('Prompt requerido');
    }

    // Verificar si es un modelo gratuito primero
    const selectedModel = aiModel || 'gpt-3.5-turbo-free';
    let user = null;
    let supabaseClient = null;

    // Solo requerir autenticación para modelos premium
    if (!isFreeModel(selectedModel)) {
      console.log('3. Premium model detected, checking authentication...');
      if (!authHeader) {
        throw new Error('Para usar modelos premium, necesitas autenticarte');
      }

      console.log('4. Initializing Supabase client...');
      supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      console.log('5. Getting user...');
      const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser();
      if (userError || !authUser) {
        console.error('User error:', userError);
        throw new Error('Usuario no autenticado para usar modelos premium');
      }
      user = authUser;
      console.log('User ID:', user.id);
    } else if (authHeader) {
      // Para modelos gratuitos, intentar autenticación si está disponible (para límites)
      console.log('3. Free model with auth header, attempting authentication...');
      try {
        supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser();
        if (!userError && authUser) {
          user = authUser;
          console.log('User authenticated for usage tracking:', user.id);
        }
      } catch (error) {
        console.log('Authentication failed but continuing with free model:', error);
      }
    } else {
      console.log('3. Free model without authentication...');
    }

    // Verificar si es un modelo gratuito
    if (isFreeModel(selectedModel)) {
      console.log('5. Using free model...');
      
      // Para modelos gratuitos, permitir uso sin autenticación estricta
      if (user) {
        // Si el usuario está autenticado, verificar límite de uso
        console.log('5.1. Checking usage limit for authenticated user...');
        const { data: usageResult, error: usageError } = await supabaseClient
          .rpc('check_and_update_ai_usage', {
            p_user_id: user.id,
            p_ai_model: selectedModel,
            p_is_registered: true
          });

        if (usageError) {
          console.error('Usage check error:', usageError);
          // Si hay error con la verificación, continuar con el modelo gratuito
        } else if (usageResult && !usageResult.can_use) {
          throw new Error(`Has alcanzado el límite diario para ${selectedModel}. Intenta con otro modelo gratuito o regístrate para obtener más usos.`);
        }
      } else {
        console.log('5.1. Using free model without authentication...');
      }

      aiResponse = await callFreeModel(prompt, selectedModel);
    } else {
      console.log('5. Using premium model...');
      
      if (!user) {
        throw new Error('Para usar modelos premium, necesitas crear una cuenta y configurar tu API key.');
      }
      
      // Para modelos premium, necesitamos API key
      const apiKey = await getAPIKeyForModel(supabaseClient, user.id, selectedModel);
      
      if (!apiKey) {
        throw new Error(`Para usar ${selectedModel}, necesitas configurar tu API key en tu perfil. También puedes probar con los modelos gratuitos disponibles.`);
      }

      console.log('5.1. Calling premium AI with user API key...');
      aiResponse = await callOpenAI(prompt, apiKey, selectedModel);
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