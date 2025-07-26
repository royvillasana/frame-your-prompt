import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simplified OpenAI function
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
          content: 'Eres un experto UX Designer. Responde en español de manera estructurada y profesional.' 
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
    
    // Handle specific OpenAI errors
    if (response.status === 429) {
      const errorJson = JSON.parse(errorData);
      if (errorJson.error?.code === 'insufficient_quota') {
        throw new Error('Tu API key de OpenAI ha excedido la cuota disponible. Por favor revisa tu plan y facturación en OpenAI.');
      }
      throw new Error('API de OpenAI temporalmente no disponible. Intenta nuevamente en unos minutos.');
    } else if (response.status === 401) {
      throw new Error('API key de OpenAI inválida. Por favor verifica tu clave en el perfil.');
    } else {
      throw new Error(`Error de OpenAI (${response.status}): ${errorData}`);
    }
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

serve(async (req) => {
  console.log('=== SIMPLIFIED EDGE FUNCTION START ===');
  
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
    const body = await req.json();
    const { prompt, aiModel = 'gpt-4o-mini' } = body;
    
    console.log('Request data:', { aiModel, hasPrompt: !!prompt });

    if (!prompt) {
      throw new Error('Prompt requerido');
    }

    console.log('5. Getting user profile...');
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('openai_api_key')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      throw new Error('Error al obtener el perfil del usuario');
    }

    console.log('6. Checking API key...');
    if (!profile?.openai_api_key) {
      throw new Error('API key de OpenAI no configurada. Ve a tu perfil para configurarla.');
    }

    console.log('7. Calling OpenAI...');
    const aiResponse = await callOpenAI(prompt, profile.openai_api_key, aiModel);
    
    console.log('8. AI response received, length:', aiResponse.length);

    console.log('9. Returning successful response...');
    return new Response(JSON.stringify({ 
      aiResponse,
      usage: { can_use: true, remaining: 999999, daily_limit: 999999, current_usage: 0 }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('=== ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Error interno del servidor',
      details: error.stack || 'No stack trace'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});