import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
};

const getSeedSystemPrompt = (title: string, category: string) => {
  const currentYear = new Date().getFullYear();
  
  return `You are a senior data analyst at a top-tier consulting firm. Generate an authoritative, verified Sankey diagram for: "${title}"

Category: ${category}
Current Year: ${currentYear}

CRITICAL REQUIREMENTS FOR THE "GALLERY OF TRUTH":

1. DATA ACCURACY (January ${currentYear} Baseline):
   - Use ONLY verified ${currentYear} or late ${currentYear - 1} data
   - Reference specific figures from official reports (e.g., "NVIDIA's $1T AI capex plan", "US 2026 Budget mandatory spending targets")
   - Include decimal precision where appropriate (e.g., $127.3B not "around $130B")

2. SOURCE CITATION (Mandatory):
   - Provide 3-5 REAL sources with working URLs
   - Cite specific reports: 'IMF World Economic Outlook January ${currentYear}', 'SEC Form 10-K', 'IEA World Energy Outlook ${currentYear}'
   - Use official investor relations pages, government statistics portals, and industry body reports
   - Format: { name: "Report Name ${currentYear}", url: "https://real-domain.com/actual-path", type: "official" }

3. CONFIDENCE LEVELS:
   - "verified": Official government/company filings, audited data
   - "estimated": Industry benchmarks, analyst consensus
   - "projected": Forward-looking estimates, AI-derived

4. NUMERICAL ANOMALIES:
   - Ensure data reveals at least 3 interesting patterns or surprises
   - Include counter-intuitive flows that create "aha moments"
   - Show concentration/diversification patterns

RETURN ONLY VALID JSON:
{
  "unit": "B USD",
  "nodes": [{"name": "Node Name"}],
  "links": [{"source": "Node A", "target": "Node B", "value": 123.4, "confidence": "verified"}],
  "sources": [{"name": "IMF World Economic Outlook Jan ${currentYear}", "url": "https://www.imf.org/en/Publications/WEO", "type": "official"}]
}

Rules:
- 15-25 links minimum for depth
- Node names: concise, professional (no abbreviations unless standard like "GDP", "R&D")
- Values must sum logically within branches
- Use appropriate units: "B USD" for billions, "M USD" for millions, "%" for percentages, "TWh" for energy`;
};

const getAnalysisPrompt = (title: string, sankeyData: any) => {
  const currentYear = new Date().getFullYear();
  const nodeNames = sankeyData.nodes.map((n: any) => n.name).join(', ');
  const topLinks = sankeyData.links
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 5)
    .map((l: any) => `${l.source} → ${l.target}: ${l.value} ${sankeyData.unit}`)
    .join('\n');

  return `Write a 300-word SEO-optimized data analysis for this Sankey diagram: "${title}"

Key nodes: ${nodeNames}
Top flows:
${topLinks}
Unit: ${sankeyData.unit}

REQUIREMENTS:
1. Opening hook with the most surprising statistic
2. Identify and explain AT LEAST 3 specific numerical anomalies or insights
3. Use exact numbers from the data (e.g., "$127.3B flows to...", "representing 34.2% of...")
4. Include context about ${currentYear} market conditions or policy changes
5. End with forward-looking implications

SEO FORMAT:
- Use subheadings with ## 
- Include the topic keywords naturally (2-3 times)
- Write for informed readers (assume basic financial literacy)
- Avoid filler phrases like "In conclusion" or "It's important to note"

Return ONLY the markdown text, no JSON wrapper.`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Verify admin authorization
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('Missing or invalid authorization header');
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized - Login required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Create client with user's auth token to verify identity
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);

  if (claimsError || !claimsData?.claims?.sub) {
    console.log('Failed to verify JWT:', claimsError?.message);
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized - Invalid token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const userId = claimsData.claims.sub as string;
  console.log(`Authenticated user: ${userId}`);

  // Check if user is admin using service role
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: adminCheck, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (adminError || !adminCheck) {
    console.log(`User ${userId} is not an admin`);
    return new Response(
      JSON.stringify({ success: false, error: 'Forbidden - Admin access required' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Admin verified: ${userId}`);

  try {
    const { title, category } = await req.json();
    
    if (!title || !category) {
      return new Response(
        JSON.stringify({ success: false, error: 'Title and category are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const slug = generateSlug(title);

    // Check if flow already exists
    const { data: existing } = await supabase
      .from('user_flows')
      .select('id')
      .eq('share_slug', slug)
      .single();

    if (existing) {
      console.log(`Flow already exists: ${slug}`);
      return new Response(
        JSON.stringify({ success: true, slug, message: 'Already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating flow: ${title}`);

    // Step 1: Generate Sankey data
    const sankeyResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: getSeedSystemPrompt(title, category) },
          { role: "user", content: `Generate the authoritative Sankey diagram for: ${title}` },
        ],
      }),
    });

    if (!sankeyResponse.ok) {
      const status = sankeyResponse.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please wait.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits exhausted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const sankeyAiResponse = await sankeyResponse.json();
    let sankeyContent = sankeyAiResponse.choices?.[0]?.message?.content;

    if (!sankeyContent) {
      throw new Error('No content in AI response for Sankey data');
    }

    // Parse Sankey JSON
    let sankeyData;
    try {
      let cleanContent = sankeyContent.trim();
      if (cleanContent.startsWith('```json')) cleanContent = cleanContent.slice(7);
      else if (cleanContent.startsWith('```')) cleanContent = cleanContent.slice(3);
      if (cleanContent.endsWith('```')) cleanContent = cleanContent.slice(0, -3);
      sankeyData = JSON.parse(cleanContent.trim());
    } catch (e) {
      console.error('Failed to parse Sankey JSON:', sankeyContent);
      throw new Error('Invalid Sankey JSON from AI');
    }

    if (!sankeyData.nodes || !sankeyData.links) {
      throw new Error('Missing nodes or links in Sankey data');
    }

    // Ensure sources and confidence
    if (!sankeyData.sources) {
      sankeyData.sources = [{ name: "AI Generated Estimate", url: null, type: "estimate" }];
    }
    sankeyData.links = sankeyData.links.map((link: any) => ({
      ...link,
      confidence: link.confidence || 'projected'
    }));

    console.log(`Generated ${sankeyData.nodes.length} nodes, ${sankeyData.links.length} links`);

    // Step 2: Generate analysis
    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an SEO content writer specializing in data journalism." },
          { role: "user", content: getAnalysisPrompt(title, sankeyData) },
        ],
      }),
    });

    let analysis = '';
    if (analysisResponse.ok) {
      const analysisAiResponse = await analysisResponse.json();
      analysis = analysisAiResponse.choices?.[0]?.message?.content || '';
    }

    // Step 3: Generate meta description
    const metaResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Write a 155-character SEO meta description. No quotes, no markdown." },
          { role: "user", content: `Meta description for: ${title}` },
        ],
      }),
    });

    let metaDescription = `Explore the ${title} with this interactive Sankey diagram.`;
    if (metaResponse.ok) {
      const metaAiResponse = await metaResponse.json();
      const metaContent = metaAiResponse.choices?.[0]?.message?.content?.trim();
      if (metaContent && metaContent.length <= 160) {
        metaDescription = metaContent.replace(/^["']|["']$/g, '');
      }
    }

    // Step 4: Save to database
    // Use a system user ID for seeded content (or null if we modify the schema)
    // For now, we'll create a special "system" flow by using the service role
    const { error: insertError } = await supabase
      .from('user_flows')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // System user placeholder
        title: title,
        query: title,
        data: sankeyData,
        description: metaDescription,
        is_public: true,
        share_slug: slug,
        settings: { theme: 'default', nodeAlign: 'justify', linkOpacity: 0.5 },
        breadcrumbs: [{ query: title, label: title }],
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(`Failed to save flow: ${insertError.message}`);
    }

    console.log(`Successfully seeded: ${slug}`);

    return new Response(
      JSON.stringify({ success: true, slug, analysis: analysis.slice(0, 200) + '...' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("seed-gallery-flow error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
