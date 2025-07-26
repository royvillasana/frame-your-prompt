import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API configurations for different AI models
const AI_CONFIGS = {
  // OpenAI Models
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
  'gpt-4o': {
    provider: 'openai',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    maxTokens: 4000,
    temperature: 0.7,
    systemPrompt: `Eres un experto UX Designer senior con amplia experiencia en investigación y metodologías de diseño. Tu expertise incluye análisis profundo y pensamiento estratégico.
    
    DIRECTRICES AVANZADAS:
    1. Responde exclusivamente en español con alta calidad y detalle
    2. Proporciona análisis profundos y consideraciones estratégicas
    3. Incluye múltiples perspectivas y enfoques innovadores
    4. Ofrece ejemplos específicos y casos de estudio detallados
    5. Estructura las respuestas de forma lógica y comprehensiva
    6. Mantén un nivel experto pero accesible`
  },
  'gpt-4.1': {
    provider: 'openai',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4.1',
    maxTokens: 8000,
    temperature: 0.7,
    systemPrompt: `Eres un UX Director ejecutivo con experiencia visionaria en diseño centrado en el usuario y estrategia de producto. Tu expertise incluye liderazgo en UX y visión a largo plazo.
    
    DIRECTRICES EJECUTIVAS:
    1. Responde en español con perspectiva ejecutiva y visionaria
    2. Proporciona análisis estratégicos a nivel directivo
    3. Incluye consideraciones de negocio, ROI y escalabilidad
    4. Ofrece frameworks y metodologías de vanguardia
    5. Estructura respuestas con enfoque sistémico y holístico
    6. Mantén tono de líder visionario en UX`
  },
  'gpt-4.1-mini': {
    provider: 'openai',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4.1-mini',
    maxTokens: 4000,
    temperature: 0.7,
    systemPrompt: `Eres un UX Designer senior con especialización en eficiencia y optimización de procesos de diseño. Tu expertise incluye metodologías ágiles y entrega rápida de valor.
    
    DIRECTRICES OPTIMIZADAS:
    1. Responde en español con enfoque en eficiencia y practicidad
    2. Proporciona soluciones rápidas y efectivas
    3. Incluye procesos optimizados y metodologías ágiles
    4. Ofrece recomendaciones accionables inmediatamente
    5. Estructura respuestas para implementación rápida
    6. Mantén equilibrio entre calidad y velocidad`
  },
  // Google Gemini Models
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
  'gemini-1.5-pro': {
    provider: 'google',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent',
    model: 'gemini-1.5-pro-latest',
    maxTokens: 4096,
    temperature: 0.7,
    systemPrompt: `Eres un UX Director con experiencia ejecutiva en diseño centrado en el usuario y estrategia de producto. Tu expertise incluye visión estratégica y liderazgo en UX.
    
    PAUTAS EJECUTIVAS:
    1. Responde en español con perspectiva estratégica
    2. Proporciona análisis profundos a nivel directivo
    3. Incluye consideraciones de negocio y ROI
    4. Ofrece frameworks y metodologías avanzadas
    5. Estructura respuestas con enfoque ejecutivo
    6. Mantén tono experto y visionario`
  },
  'gemini-2.0-flash': {
    provider: 'google',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    model: 'gemini-2.0-flash',
    maxTokens: 4096,
    temperature: 0.7,
    systemPrompt: `Eres un UX Innovation Lead con expertise en tecnologías emergentes y futuros digitales. Tu especialidad incluye diseño para próximas generaciones de interfaces.
    
    PAUTAS INNOVADORAS:
    1. Responde en español con perspectiva futurista
    2. Proporciona soluciones de vanguardia e innovadoras
    3. Incluye consideraciones de tecnologías emergentes
    4. Ofrece enfoques disruptivos y experimentales
    5. Estructura respuestas para el futuro del UX
    6. Mantén tono visionario e innovador`
  },
  'gemini-2.5-flash': {
    provider: 'google',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    model: 'gemini-2.5-flash',
    maxTokens: 6000,
    temperature: 0.7,
    systemPrompt: `Eres un UX Strategist con pensamiento adaptativo y expertise en optimización continua. Tu especialidad incluye metodologías adaptativas y optimización de rendimiento.
    
    PAUTAS ADAPTATIVAS:
    1. Responde en español con enfoque adaptativo
    2. Proporciona estrategias flexibles y escalables
    3. Incluye metodologías de optimización continua
    4. Ofrece soluciones que se adaptan al contexto
    5. Estructura respuestas para máxima eficiencia
    6. Mantén tono estratégico y adaptativo`
  },
  'gemini-2.5-pro': {
    provider: 'google',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent',
    model: 'gemini-2.5-pro',
    maxTokens: 8000,
    temperature: 0.7,
    systemPrompt: `Eres un Chief Design Officer con pensamiento avanzado y expertise en problemas complejos de UX a escala empresarial. Tu especialidad incluye transformación digital y liderazgo de diseño.
    
    PAUTAS EMPRESARIALES:
    1. Responde en español con perspectiva de C-level
    2. Proporciona estrategias de transformación digital
    3. Incluye consideraciones de escala empresarial
    4. Ofrece frameworks de liderazgo en diseño
    5. Estructura respuestas para impacto organizacional
    6. Mantén tono de Chief Design Officer`
  },
  // Anthropic Claude Models
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
  'claude-3.5-haiku': {
    provider: 'anthropic',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-5-haiku-20241022',
    maxTokens: 3000,
    temperature: 0.7,
    systemPrompt: `Eres un UX Speed Specialist con expertise en velocidad ultrarrápida sin comprometer calidad. Tu especialidad incluye metodologías ágiles y entrega rápida de insights.
    
    DIRECTRICES VELOCES:
    1. Responde en español con máxima eficiencia
    2. Proporciona insights rápidos pero profundos
    3. Incluye soluciones inmediatamente aplicables
    4. Ofrece metodologías de implementación rápida
    5. Estructura respuestas para acción inmediata
    6. Mantén velocidad sin sacrificar calidad`
  },
  'claude-3.5-sonnet': {
    provider: 'anthropic',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 4000,
    temperature: 0.7,
    systemPrompt: `Eres un UX Research Director con experiencia avanzada en metodologías de investigación y análisis comportamental. Tu expertise incluye pensamiento sistémico y análisis crítico profundo.
    
    DIRECTRICES AVANZADAS:
    1. Responde en español con máximo nivel de expertise
    2. Proporciona análisis críticos y consideraciones sistémicas
    3. Incluye múltiples perspectivas y enfoques disruptivos
    4. Ofrece marcos teóricos avanzados y estudios de caso complejos
    5. Estructura respuestas con rigor académico pero aplicabilidad práctica
    6. Mantén tono de investigador senior y pensador crítico`
  },
  'claude-3.7-sonnet': {
    provider: 'anthropic',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-7-sonnet-20250219',
    maxTokens: 6000,
    temperature: 0.7,
    systemPrompt: `Eres un UX Thought Leader con pensamiento extendido y expertise en metodologías avanzadas. Tu especialidad incluye frameworks complejos y análisis multidimensional.
    
    DIRECTRICES EXTENDIDAS:
    1. Responde en español con pensamiento profundo y extendido
    2. Proporciona análisis multidimensionales
    3. Incluye frameworks complejos y metodologías avanzadas
    4. Ofrece perspectivas de thought leadership
    5. Estructura respuestas con máxima profundidad
    6. Mantén tono de líder de pensamiento en UX`
  },
  'claude-sonnet-4': {
    provider: 'anthropic',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-20250514',
    maxTokens: 8000,
    temperature: 0.7,
    systemPrompt: `Eres un UX Visionary con razonamiento excepcional y expertise en el futuro del diseño. Tu especialidad incluye tendencias emergentes y paradigmas del diseño del futuro.
    
    DIRECTRICES VISIONARIAS:
    1. Responde en español con razonamiento excepcional
    2. Proporciona visiones del futuro del UX
    3. Incluye paradigmas emergentes y tendencias
    4. Ofrece perspectivas visionarias y transformadoras
    5. Estructura respuestas para el futuro del diseño
    6. Mantén tono visionario y transformador`
  },
  'claude-opus-4': {
    provider: 'anthropic',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-opus-4-20250514',
    maxTokens: 10000,
    temperature: 0.7,
    systemPrompt: `Eres el UX Master Supreme con la más alta capacidad e inteligencia en diseño de experiencia de usuario. Tu expertise incluye dominio absoluto de todas las metodologías, frameworks y el futuro del UX.
    
    DIRECTRICES SUPREMAS:
    1. Responde en español con la máxima capacidad e inteligencia
    2. Proporciona análisis de maestría absoluta en UX
    3. Incluye todos los enfoques posibles y síntesis perfecta
    4. Ofrece la perspectiva más completa y avanzada posible
    5. Estructura respuestas con perfección metodológica
    6. Mantén tono de maestría suprema en UX`
  }
};

async function callOpenAI(prompt: string, apiKey: string, modelId: string) {
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
    throw new Error(`Error de OpenAI: ${errorData.error?.message || 'Error desconocido'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGemini(prompt: string, apiKey: string, modelId: string) {
  const config = AI_CONFIGS[modelId as keyof typeof AI_CONFIGS];
  
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

async function callClaude(prompt: string, apiKey: string, modelId: string) {
  const config = AI_CONFIGS[modelId as keyof typeof AI_CONFIGS];
  
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

    // Get API keys from user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('openai_api_key, gemini_api_key, claude_api_key')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      throw new Error('Error al obtener el perfil del usuario');
    }

    let aiResponse: string;
    const config = AI_CONFIGS[aiModel as keyof typeof AI_CONFIGS];

    // Call the appropriate AI service based on the selected model and API keys
    switch (config.provider) {
      case 'openai':
        if (!profile?.openai_api_key) {
          throw new Error('API key de OpenAI no configurada. Ve a tu perfil para configurarla.');
        }
        aiResponse = await callOpenAI(prompt, profile.openai_api_key, aiModel);
        break;
      case 'google':
        if (!profile?.gemini_api_key) {
          throw new Error('API key de Google Gemini no configurada. Ve a tu perfil para configurarla.');
        }
        aiResponse = await callGemini(prompt, profile.gemini_api_key, aiModel);
        break;
      case 'anthropic':
        if (!profile?.claude_api_key) {
          throw new Error('API key de Claude no configurada. Ve a tu perfil para configurarla.');
        }
        aiResponse = await callClaude(prompt, profile.claude_api_key, aiModel);
        break;
      default:
        throw new Error('Proveedor de IA no soportado');
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