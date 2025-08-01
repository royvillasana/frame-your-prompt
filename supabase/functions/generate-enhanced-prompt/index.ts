// supabase/functions/generate-enhanced-prompt/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts';

const createResponse = (body: any, status = 200) => {
  return new Response(JSON.stringify(body), {
    headers: { 
      ...corsHeaders,
      'Content-Type': 'application/json' 
    },
    status
  });
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Ensure the request is a POST
  if (req.method !== 'POST') {
    return createResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      return createResponse({ error: 'Invalid JSON' }, 400);
    }

    const { prompt } = requestData;
    if (!prompt) {
      return createResponse({ error: 'Prompt is required' }, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return createResponse({ error: 'Server configuration error' }, 500);
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert prompt engineer. Your task is to enhance the user-provided prompt to make it more detailed, structured, and effective for an AI assistant. If the user prompt includes a "Document Content" section, you must incorporate the key information from this document into your enhanced prompt to provide specific context. Your response must be a JSON object containing a single key, "enhancedPrompt", with the improved prompt as its value. Do not include any other text, commentary, or markdown.'
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      }),
    });

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${openaiResponse.statusText} - ${errorBody}`);
    }

    const responseData = await openaiResponse.json();
    let content;
    try {
      content = JSON.parse(responseData.choices[0].message.content);
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      return createResponse({ error: 'Error processing AI response' }, 500);
    }

    return createResponse(content);
  } catch (error) {
    console.error('Error:', error);
    return createResponse(
      { error: error.message || 'Internal server error' },
      error.status || 500
    );
  }
});
