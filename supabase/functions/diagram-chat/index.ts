import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SankeyNode {
  name: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface DiagramData {
  nodes: SankeyNode[];
  links: SankeyLink[];
  unit?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, diagramData, query } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from diagram data
    const diagramContext = buildDiagramContext(diagramData, query);
    
    console.log("Diagram context built:", diagramContext.substring(0, 200) + "...");
    console.log("Processing chat with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { 
            role: "system", 
            content: `You are a concise data analyst for Sankey diagrams. Answer questions about flows, values, and patterns.

RESPONSE RULES:
- Be extremely brief: 1-3 sentences max for simple questions
- Use plain numbers without excessive formatting
- Avoid bullet lists unless comparing 3+ items
- No bold text, asterisks, or markdown formatting
- State the direct answer first, add brief context only if essential
- For totals: just give the number and unit
- For comparisons: use simple "X vs Y" format

${diagramContext}`
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildDiagramContext(data: DiagramData, query: string): string {
  if (!data || !data.nodes || !data.links) {
    return "No diagram data available.";
  }

  const unit = data.unit || "units";
  
  // Calculate node totals
  const nodeTotals = new Map<string, { incoming: number; outgoing: number }>();
  
  data.nodes.forEach(node => {
    nodeTotals.set(node.name, { incoming: 0, outgoing: 0 });
  });
  
  data.links.forEach(link => {
    const sourceStats = nodeTotals.get(link.source);
    const targetStats = nodeTotals.get(link.target);
    if (sourceStats) sourceStats.outgoing += link.value;
    if (targetStats) targetStats.incoming += link.value;
  });

  // Find sources (no incoming) and sinks (no outgoing)
  const sources = Array.from(nodeTotals.entries())
    .filter(([_, stats]) => stats.incoming === 0 && stats.outgoing > 0)
    .map(([name, stats]) => `${name}: ${stats.outgoing} ${unit}`);
  
  const sinks = Array.from(nodeTotals.entries())
    .filter(([_, stats]) => stats.outgoing === 0 && stats.incoming > 0)
    .map(([name, stats]) => `${name}: ${stats.incoming} ${unit}`);

  // Calculate total flow
  const totalFlow = data.links.reduce((sum, link) => sum + link.value, 0);
  
  // Get top flows
  const topFlows = [...data.links]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map(l => `${l.source} → ${l.target}: ${l.value} ${unit} (${((l.value / totalFlow) * 100).toFixed(1)}%)`);

  return `CURRENT DIAGRAM: "${query}"
Unit of measurement: ${unit}
Total nodes: ${data.nodes.length}
Total connections: ${data.links.length}
Total flow volume: ${totalFlow} ${unit}

SOURCE NODES (inputs):
${sources.join("\n")}

SINK NODES (outputs):
${sinks.join("\n")}

TOP 5 LARGEST FLOWS:
${topFlows.join("\n")}

ALL CONNECTIONS:
${data.links.map(l => `${l.source} → ${l.target}: ${l.value} ${unit}`).join("\n")}`;
}
