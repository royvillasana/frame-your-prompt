import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { extractText, getDocumentProxy } from 'https://esm.sh/unpdf';

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      throw new Error('No file provided');
    }

    const fileBuffer = await file.arrayBuffer();
    const pdf = await getDocumentProxy(new Uint8Array(fileBuffer));
    const texts = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const { text } = await extractText(page);
      texts.push(text);
    }
    const combinedText = texts.join('\n\n');

    return new Response(
      JSON.stringify({ documentContent: combinedText }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
