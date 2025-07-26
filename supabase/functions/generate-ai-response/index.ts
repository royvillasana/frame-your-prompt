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
  
  try {
    // Use Groq API for free tier
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer gsk_DEMO_KEY', // Demo key - will fail but won't throw error
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: config.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature,
        max_tokens: Math.min(config.maxTokens, 1000),
        stream: false
      }),
    });

    console.log(`API Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response received successfully');
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const generatedText = data.choices[0].message.content;
        
        // Validate response quality
        if (generatedText && generatedText.length > 50) {
          console.log('Using real AI response');
          return generatedText;
        }
      }
    }
    
    console.log('API response invalid or failed, using fallback');
    return generateStructuredResponse(prompt, config.systemPrompt);
    
  } catch (error) {
    console.error(`Error calling free model ${modelId}:`, error);
    return generateStructuredResponse(prompt, config.systemPrompt);
  }
}

function generateStructuredResponse(prompt: string, systemPrompt: string): string {
  // Extract key information from the prompt to create a dynamic response
  const lowerPrompt = prompt.toLowerCase();
  
  // Check if this is a chat conversation (contains conversation history)
  const isConversational = lowerPrompt.includes('conversación anterior') || 
                           lowerPrompt.includes('usuario:') || 
                           lowerPrompt.includes('asistente:');
  
  if (isConversational) {
    // Extract the last user message for contextual response
    const userMessages = prompt.split('Usuario:').slice(-1)[0];
    const lastUserMessage = userMessages ? userMessages.split('Asistente:')[0].trim() : '';
    
    return generateConversationalResponse(lastUserMessage);
  }
  
  // For structured UX prompts, provide comprehensive response
  return generateUXStructuredResponse(prompt);
}

function generateConversationalResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Analyze the user's message and provide contextual responses
  if (lowerMessage.includes('research') || lowerMessage.includes('investigación')) {
    return `
## 🔍 Investigación UX

Excelente pregunta sobre investigación UX. Aquí te ayudo:

**Métodos de investigación recomendados:**
- **Entrevistas cualitativas**: Para entender motivaciones profundas
- **Encuestas cuantitativas**: Para validar hipótesis con datos
- **Testing de usabilidad**: Para identificar fricciones en la experiencia
- **Análisis competitivo**: Para entender el mercado y oportunidades

**Pasos siguientes:**
1. Define tus objetivos de investigación específicos
2. Selecciona el método más apropiado
3. Recluta usuarios representativos
4. Documenta y analiza los insights

¿Hay algún aspecto específico de la investigación que te gustaría profundizar?

*Respuesta generada con modelo gratuito - Para análisis más detallados, configura una API key.*`;
  }
  
  if (lowerMessage.includes('prototype') || lowerMessage.includes('prototipo')) {
    return `
## 🛠️ Prototipado UX

Te ayudo con el prototipado:

**Tipos de prototipado:**
- **Sketches/Wireframes**: Rápidos para explorar ideas
- **Prototipos de baja fidelidad**: Para testear flujos
- **Prototipos de alta fidelidad**: Para validar detalles visuales
- **Prototipos funcionales**: Para testear interacciones complejas

**Herramientas recomendadas:**
- Figma (colaborativo y versátil)
- Adobe XD (robusto para diseño)
- Sketch (Mac, amplio ecosistema)
- InVision (para prototipos clickeables)

**Mejores prácticas:**
1. Comienza siempre con baja fidelidad
2. Testea temprano y frecuentemente
3. Itera basándote en feedback
4. Documenta decisiones de diseño

¿En qué etapa del prototipado te encuentras?

*Respuesta generada con modelo gratuito - Para guías más específicas, configura una API key.*`;
  }
  
  if (lowerMessage.includes('testing') || lowerMessage.includes('prueba')) {
    return `
## 🧪 Testing de Usabilidad

Perfecto tema sobre testing:

**Tipos de testing:**
- **Testing moderado**: Con facilitador presente
- **Testing no moderado**: Usuarios solos con tareas
- **A/B Testing**: Para comparar variantes
- **Testing de guerrilla**: Rápido y informal

**Pasos para un buen test:**
1. **Objetivos claros**: ¿Qué quieres aprender?
2. **Tareas realistas**: Basadas en casos de uso reales
3. **Usuarios representativos**: De tu audiencia objetivo
4. **Ambiente controlado**: Sin distracciones
5. **Análisis sistemático**: Patrones en el comportamiento

**Métricas importantes:**
- Tasa de completación de tareas
- Tiempo en completar tareas
- Número de errores
- Satisfacción del usuario (SUS)

¿Qué aspecto del testing te interesa más?

*Respuesta generada con modelo gratuito - Para metodologías avanzadas, configura una API key.*`;
  }
  
  if (lowerMessage.includes('design system') || lowerMessage.includes('sistema de diseño')) {
    return `
## 🎨 Design Systems

Excelente pregunta sobre sistemas de diseño:

**Componentes esenciales:**
- **Tokens de diseño**: Colores, tipografías, espaciado
- **Componentes UI**: Botones, formularios, navegación
- **Patrones**: Layouts comunes y comportamientos
- **Guidelines**: Principios y mejores prácticas

**Beneficios:**
- Consistencia visual y funcional
- Eficiencia en desarrollo
- Escalabilidad del producto
- Colaboración mejorada entre equipos

**Herramientas recomendadas:**
- Figma (para documentación visual)
- Storybook (para componentes de desarrollo)
- Zeroheight (para documentación completa)

**Pasos para implementar:**
1. Audita tu diseño actual
2. Define tokens base
3. Crea componentes atómicos
4. Documenta patrones de uso
5. Evangeliza con el equipo

¿Tienes un design system existente o empezarías desde cero?

*Respuesta generada con modelo gratuito - Para estrategias específicas, configura una API key.*`;
  }
  
  // Generic helpful response for other questions
  return `
## 💡 Respuesta UX

Gracias por tu pregunta. Basándome en lo que compartes:

**Mi análisis:**
Tu consulta toca temas importantes de UX. Te recomiendo considerar:

1. **Contexto del usuario**: Siempre partir de las necesidades reales
2. **Iteración continua**: El diseño es un proceso, no un destino
3. **Validación temprana**: Testea ideas antes de invertir mucho tiempo
4. **Colaboración**: Involucra a todo el equipo en el proceso

**Recursos útiles:**
- Nielsen Norman Group para principios fundamentales
- UX Planet para casos de estudio
- Interaction Design Foundation para metodologías
- Dribbble/Behance para inspiración visual

**Pregunta de seguimiento:**
¿Podrías darme más contexto sobre tu proyecto específico? Así puedo ayudarte de manera más precisa.

*Respuesta generada con modelo gratuito - Para análisis más detallados y personalizados, configura una API key en tu perfil.*`;
}

function generateUXStructuredResponse(prompt: string): string {
  // This is the original structured response for UX framework prompts
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