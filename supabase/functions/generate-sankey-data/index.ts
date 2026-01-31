import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const getSystemPrompt = (isDrillDown: boolean, originalQuery?: string, clickedNodeName?: string) => {
  const currentYear = new Date().getFullYear();
  
  const confidenceInstructions = `
IMPORTANT: For each link, include a "confidence" field with one of these values:
- "verified" - Data from official sources, financial reports, government statistics
- "estimated" - Calculated from partial data or industry benchmarks  
- "projected" - AI-generated estimates based on patterns and trends

Also include a "sources" array at the root level with objects containing:
- "name": Source name - MUST include year ${currentYear} or ${currentYear - 1} (e.g., "Annual Report ${currentYear}", "Financial Statements ${currentYear}")
- "url": A REAL, WORKING URL to the actual source document (e.g., investor relations page, official statistics site). Use null ONLY if no real URL exists.
- "type": "official" | "industry" | "research" | "estimate"

CRITICAL FOR SOURCES:
- Use the MOST RECENT data available (${currentYear} or ${currentYear - 1})
- Provide REAL URLs that actually work - check that the domain and path structure are realistic
- For companies: use their investor relations pages (e.g., https://www.company.com/investors/)
- For government data: use official statistics sites (e.g., eia.gov, bls.gov, ons.gov.uk)
- For industry data: use reputable sources (e.g., IEA, World Bank, IMF)
- NEVER make up fake URLs - if unsure, set url to null
`;

  if (isDrillDown && originalQuery && clickedNodeName) {
    return `You are a data expert. The user is drilling down into a specific part of a flow.

Original topic: ${originalQuery}
Specific node to expand: ${clickedNodeName}
Current year: ${currentYear}

Provide a detailed sub-flow for this specific node "${clickedNodeName}" showing its internal breakdown and relationships.

CRITICAL: Return ONLY valid JSON with no markdown, no code blocks, no explanation. Just the raw JSON object.

Format:
{
  "unit": "USD",
  "nodes": [{"name": "Node A"}, {"name": "Node B"}],
  "links": [{"source": "Node A", "target": "Node B", "value": 100, "confidence": "verified"}],
  "sources": [{"name": "Source Name ${currentYear}", "url": "https://real-url.com/path", "type": "official"}]
}

Rules:
1. Create at least 12-18 links showing the internal breakdown of "${clickedNodeName}"
2. Show how "${clickedNodeName}" breaks down into sub-components, processes, or destinations
3. Ensure all source and target names in links exactly match node names
4. Every link MUST include a "value" representing a realistic number based on the context
5. Every link MUST include a "confidence" field (verified, estimated, or projected)
6. Include a top-level "unit" field with the appropriate unit (e.g., "$", "USD", "M USD", "B USD", "People", "MWh", "TWh", "Units", "Tonnes", "%") based on the query context
7. Include a top-level "sources" array with 2-5 relevant data sources with REAL URLs
8. Create a logical flow from inputs through "${clickedNodeName}" to outputs
9. Node names should be concise but descriptive
10. Values should be proportional and add up logically
11. Use realistic, researched values - for money use actual figures (e.g., billions for large companies)
12. Use the MOST RECENT available data (${currentYear} or ${currentYear - 1})

${confidenceInstructions}

Focus on accuracy and creating an insightful drill-down view of "${clickedNodeName}".`;
  }

  return `You are a data expert. The user will provide a topic (company, country, or concept). Generate a detailed Sankey diagram data structure in JSON format.

Current year: ${currentYear}

CRITICAL: Return ONLY valid JSON with no markdown, no code blocks, no explanation. Just the raw JSON object.

Format:
{
  "unit": "B USD",
  "nodes": [{"name": "Node A"}, {"name": "Node B"}],
  "links": [{"source": "Node A", "target": "Node B", "value": 100, "confidence": "verified"}],
  "sources": [{"name": "Source Name ${currentYear}", "url": "https://real-url.com/path", "type": "official"}]
}

Rules:
1. Create at least 15-20 links for a detailed breakdown
2. Ensure all source and target names in links exactly match node names
3. Every link MUST include a "value" representing a realistic number based on the context
4. Every link MUST include a "confidence" field (verified, estimated, or projected)
5. Include a top-level "unit" field with the appropriate unit (e.g., "$", "USD", "M USD", "B USD", "People", "MWh", "TWh", "Units", "Tonnes", "%") based on the query context
6. Include a top-level "sources" array with 2-5 relevant data sources with REAL, WORKING URLs
7. Create a logical flow from sources to intermediates to destinations
8. Node names should be concise but descriptive
9. Values should be proportional and add up logically
10. Use realistic, researched values - for money use actual figures (e.g., billions for large companies)
11. Use the MOST RECENT available data (${currentYear} or ${currentYear - 1})

${confidenceInstructions}

Focus on accuracy and creating an insightful, informative diagram.`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Optional authentication - diagram generation works without login
    // But we track authenticated users for analytics
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData } = await supabase.auth.getClaims(token);
      
      if (claimsData?.claims?.sub) {
        userId = claimsData.claims.sub as string;
        console.log(`Authenticated user: ${userId}`);
      }
    }

    const { query, originalQuery, clickedNodeName } = await req.json();
    
    const searchQuery = query || originalQuery;
    const isDrillDown = !!(originalQuery && clickedNodeName);

    
    if (!searchQuery || typeof searchQuery !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input length to prevent abuse
    if (searchQuery.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Query too long (max 500 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (clickedNodeName && clickedNodeName.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Node name too long (max 200 characters)' }),
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

    const systemPrompt = getSystemPrompt(isDrillDown, originalQuery, clickedNodeName);
    const userMessage = isDrillDown 
      ? `Drill down into "${clickedNodeName}" from the topic "${originalQuery}". Show detailed sub-flows.`
      : `Generate a detailed Sankey diagram for: ${searchQuery}`;

    console.log(`Generating Sankey data - User: ${userId || 'anonymous'}, Query: ${searchQuery}, DrillDown: ${isDrillDown}, Node: ${clickedNodeName || 'N/A'}`);

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
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
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
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Failed to generate diagram data" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sankeyData;
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      sankeyData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      return new Response(
        JSON.stringify({ error: "AI returned invalid data format. Please try again." }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!sankeyData.nodes || !Array.isArray(sankeyData.nodes) || 
        !sankeyData.links || !Array.isArray(sankeyData.links)) {
      console.error("Invalid Sankey data structure:", sankeyData);
      return new Response(
        JSON.stringify({ error: "AI returned incomplete data. Please try again." }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure sources array exists (fallback if AI doesn't provide it)
    if (!sankeyData.sources || !Array.isArray(sankeyData.sources)) {
      sankeyData.sources = [
        { name: "AI Generated Estimate", url: null, type: "estimate" }
      ];
    }

    // Ensure all links have confidence (fallback to 'projected')
    sankeyData.links = sankeyData.links.map((link: any) => ({
      ...link,
      confidence: link.confidence || 'projected'
    }));

    console.log(`Generated ${sankeyData.nodes.length} nodes and ${sankeyData.links.length} links for user ${userId}`);

    return new Response(
      JSON.stringify(sankeyData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("generate-sankey-data error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
