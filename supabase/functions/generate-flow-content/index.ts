import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ContentRequest {
  title: string;
  nodeNames: string[];
  unit?: string;
  type: 'meta_description' | 'analysis';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, nodeNames, unit, type }: ContentRequest = await req.json();

    if (!title || !nodeNames?.length) {
      return new Response(
        JSON.stringify({ error: 'Title and nodeNames are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let systemPrompt: string;
    let userPrompt: string;

    if (type === 'meta_description') {
      systemPrompt = `You are an SEO expert. Generate a compelling meta description for a Sankey diagram visualization page. The description should:
- Be exactly 2 sentences
- Be under 155 characters total
- Include the main topic
- Mention it's an interactive visualization
- Be engaging and click-worthy`;

      userPrompt = `Generate a meta description for a Sankey diagram titled "${title}" that shows flows between: ${nodeNames.slice(0, 8).join(', ')}${nodeNames.length > 8 ? '...' : ''}.${unit ? ` Values are in ${unit}.` : ''}`;
    } else {
      systemPrompt = `You are a data analyst and business writer. Write an insightful analysis of a Sankey diagram visualization. The analysis should:
- Be exactly 300 words
- Start with a compelling overview of what the diagram reveals
- Highlight 2-3 key insights from the data flow
- Explain the significance of major connections
- End with a forward-looking statement or implication
- Be written in professional, accessible language
- Use specific node names from the diagram
- Do NOT include any markdown formatting or headers`;

      userPrompt = `Write a 300-word analysis for a Sankey diagram titled "${title}". 

The diagram shows these flow components: ${nodeNames.join(', ')}.
${unit ? `Values are measured in ${unit}.` : ''}

Explain what this flow diagram tells us about ${title.replace(/visualized|flow|diagram|sankey/gi, '').trim()}.`;
    }

    console.log(`Generating ${type} content for: ${title}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content?.trim();

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Failed to generate content" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generated ${type} content (${content.length} chars) for: ${title}`);

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("generate-flow-content error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
