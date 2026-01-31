import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  confidence?: string;
}

interface SankeyData {
  nodes: { name: string }[];
  links: SankeyLink[];
  unit?: string;
  sources?: { name: string; url: string | null; type: string }[];
}

const calculateTotalValue = (data: SankeyData): number => {
  return data.links.reduce((sum, link) => sum + (link.value || 0), 0);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logError = async (
  supabase: any,
  functionName: string,
  flowId: string | null,
  message: string,
  details?: Record<string, unknown>
) => {
  try {
    await supabase.from('system_logs').insert({
      function_name: functionName,
      flow_id: flowId,
      level: 'error',
      message,
      details,
    });
  } catch (e) {
    console.error('Failed to log error:', e);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logInfo = async (
  supabase: any,
  functionName: string,
  message: string,
  details?: Record<string, unknown>
) => {
  try {
    await supabase.from('system_logs').insert({
      function_name: functionName,
      flow_id: null,
      level: 'info',
      message,
      details,
    });
  } catch (e) {
    console.error('Failed to log info:', e);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.error('LOVABLE_API_KEY not configured');
    return new Response(
      JSON.stringify({ error: 'AI service not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Find oldest 10 public flows not updated in 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: staleFlows, error: fetchError } = await supabase
      .from('user_flows')
      .select('id, title, query, data, updated_at')
      .eq('is_public', true)
      .lt('updated_at', thirtyDaysAgo.toISOString())
      .order('updated_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      throw new Error(`Failed to fetch stale flows: ${fetchError.message}`);
    }

    if (!staleFlows || staleFlows.length === 0) {
      await logInfo(supabase, 'cron-refresh-gallery', 'No stale flows found to refresh');
      return new Response(
        JSON.stringify({ message: 'No stale flows to refresh', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${staleFlows.length} stale flows to refresh`);
    await logInfo(supabase, 'cron-refresh-gallery', `Starting refresh for ${staleFlows.length} flows`);

    let processed = 0;
    let errors = 0;
    const currentYear = new Date().getFullYear();

    for (const flow of staleFlows) {
      try {
        const oldData = flow.data as SankeyData;
        const lastUpdated = new Date(flow.updated_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Generate refresh prompt
        const refreshPrompt = `Current data is from ${lastUpdated}. Provide an updated dataset for "${flow.query}" based on the latest ${currentYear} information. If no significant changes exist, return exactly: NO_CHANGE`;

        const systemPrompt = `You are a data expert. Update the Sankey diagram data for the topic provided.

CRITICAL: If the data has not meaningfully changed, return exactly the text "NO_CHANGE" with no other content.

If there ARE meaningful updates, return ONLY valid JSON with no markdown, no code blocks, no explanation. Just the raw JSON object.

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
3. Every link MUST include a "value" representing a realistic number
4. Every link MUST include a "confidence" field (verified, estimated, or projected)
5. Include a top-level "unit" field with the appropriate unit
6. Include a top-level "sources" array with 2-5 relevant data sources with REAL URLs
7. Use the MOST RECENT available data (${currentYear} or ${currentYear - 1})`;

        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: refreshPrompt },
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`AI gateway error: ${response.status} - ${errorText}`);
        }

        const aiResponse = await response.json();
        const content = aiResponse.choices?.[0]?.message?.content?.trim();

        if (!content) {
          throw new Error('Empty AI response');
        }

        // Check for NO_CHANGE response
        if (content === 'NO_CHANGE' || content.includes('NO_CHANGE')) {
          console.log(`Flow ${flow.id} has no changes`);
          // Update the timestamp to prevent re-checking soon
          await supabase
            .from('user_flows')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', flow.id);
          processed++;
          continue;
        }

        // Parse the new data
        let newData: SankeyData;
        try {
          let cleanContent = content;
          if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.slice(7);
          } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.slice(3);
          }
          if (cleanContent.endsWith('```')) {
            cleanContent = cleanContent.slice(0, -3);
          }
          cleanContent = cleanContent.trim();
          
          newData = JSON.parse(cleanContent);
        } catch (parseError) {
          await logError(supabase, 'cron-refresh-gallery', flow.id, 'Failed to parse AI response as JSON', {
            content: content.substring(0, 500),
          });
          errors++;
          continue;
        }

        // Validate the new data
        if (!newData.nodes || !Array.isArray(newData.nodes) || 
            !newData.links || !Array.isArray(newData.links)) {
          await logError(supabase, 'cron-refresh-gallery', flow.id, 'Invalid Sankey data structure', {
            hasNodes: !!newData.nodes,
            hasLinks: !!newData.links,
          });
          errors++;
          continue;
        }

        // Calculate total values
        const oldTotalValue = calculateTotalValue(oldData);
        const newTotalValue = calculateTotalValue(newData);
        const changePercent = oldTotalValue > 0 
          ? Math.abs((newTotalValue - oldTotalValue) / oldTotalValue * 100) 
          : 100;

        // Determine status based on change threshold
        const status = changePercent > 20 ? 'manual_review' : 'pending';

        // Insert into pending_updates
        const { error: insertError } = await supabase.from('pending_updates').insert({
          flow_id: flow.id,
          old_data: oldData,
          new_data: newData,
          old_total_value: oldTotalValue,
          new_total_value: newTotalValue,
          change_percent: changePercent,
          status,
        });

        if (insertError) {
          await logError(supabase, 'cron-refresh-gallery', flow.id, 'Failed to insert pending update', {
            error: insertError.message,
          });
          errors++;
          continue;
        }

        console.log(`Created pending update for flow ${flow.id} (${changePercent.toFixed(1)}% change, status: ${status})`);
        processed++;

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1500));

      } catch (flowError) {
        const errorMessage = flowError instanceof Error ? flowError.message : 'Unknown error';
        await logError(supabase, 'cron-refresh-gallery', flow.id, errorMessage);
        errors++;
      }
    }

    const summary = {
      message: 'Refresh cycle complete',
      processed,
      errors,
      total: staleFlows.length,
    };

    await logInfo(supabase, 'cron-refresh-gallery', `Completed: ${processed} processed, ${errors} errors`);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('cron-refresh-gallery error:', errorMessage);
    await logError(supabase, 'cron-refresh-gallery', null, errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
