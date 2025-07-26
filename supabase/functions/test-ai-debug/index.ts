import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== DEBUG FUNCTION STARTED ===');
    
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header:', authHeader ? 'present' : 'missing');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    console.log('User:', user ? user.id : 'not found', 'Error:', userError);

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('openai_api_key, gemini_api_key, claude_api_key')
      .eq('user_id', user?.id)
      .single();

    console.log('Profile:', {
      hasOpenAI: !!profile?.openai_api_key,
      hasGemini: !!profile?.gemini_api_key,
      hasClaude: !!profile?.claude_api_key,
      error: profileError
    });

    // Test simple OpenAI call
    if (profile?.openai_api_key) {
      console.log('Testing OpenAI API call...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${profile.openai_api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Say hello in Spanish' }],
          max_tokens: 50,
        }),
      });

      console.log('OpenAI response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('OpenAI response:', data.choices[0].message.content);
      } else {
        const error = await response.text();
        console.log('OpenAI error:', error);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      user: user?.id,
      profile: {
        hasOpenAI: !!profile?.openai_api_key,
        hasGemini: !!profile?.gemini_api_key,
        hasClaude: !!profile?.claude_api_key
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('DEBUG ERROR:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});