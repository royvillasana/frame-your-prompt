// supabase/functions/generate-enhanced-prompt/index.ts

;

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      throw new Error('Prompt is required.');
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
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
    const content = JSON.parse(responseData.choices[0].message.content);

    return Response.json(content, {
      headers: corsHeaders,
    });

  } catch (error) {
    return Response.json({ error: error.message }, {
      headers: corsHeaders,
      status: 500,
    });
  }
});
