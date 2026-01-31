import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { headers, sampleRows } = await req.json();

    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Headers array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `Analyze this CSV data schema and identify the best column mappings for a Sankey diagram.

HEADERS: ${JSON.stringify(headers)}

SAMPLE DATA (first 3 rows):
${sampleRows.map((row: Record<string, string>, i: number) => `Row ${i + 1}: ${JSON.stringify(row)}`).join('\n')}

A Sankey diagram requires:
- SOURCE: The origin node (e.g., "Category", "From", "Supplier", "Department")
- TARGET: The destination node (e.g., "Destination", "To", "Customer", "Product")
- VALUE: A numeric quantity representing flow (e.g., "Amount", "Count", "Sales", "Quantity")

If no clear VALUE column exists, suggest using frequency counting (counting occurrences of Source-Target pairs).

Respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "sourceColumn": "exact column name or null",
  "targetColumn": "exact column name or null",
  "valueColumn": "exact column name or null",
  "useFrequencyCount": true/false,
  "confidence": "high" | "medium" | "low",
  "explanation": "brief explanation of why these columns were chosen"
}`;

    console.log('Analyzing schema with headers:', headers);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a data analyst expert. Analyze CSV schemas and suggest optimal column mappings for Sankey diagrams. Always respond with valid JSON only, no markdown formatting.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI response:', content);

    // Parse the JSON response, handling potential markdown wrapping
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.slice(7);
    }
    if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    const mapping = JSON.parse(cleanedContent);

    return new Response(
      JSON.stringify(mapping),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-data-schema:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
