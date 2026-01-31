import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

  try {
    const { updateId, action, userId } = await req.json();

    if (!updateId || !action) {
      return new Response(
        JSON.stringify({ error: 'updateId and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['approve', 'discard'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'action must be "approve" or "discard"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the pending update
    const { data: pendingUpdate, error: fetchError } = await supabase
      .from('pending_updates')
      .select('*, user_flows(id, title, query, description)')
      .eq('id', updateId)
      .single();

    if (fetchError || !pendingUpdate) {
      return new Response(
        JSON.stringify({ error: 'Pending update not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();

    if (action === 'discard') {
      // Mark as discarded
      const { error: updateError } = await supabase
        .from('pending_updates')
        .update({
          status: 'discarded',
          reviewed_at: now,
          reviewed_by: userId,
        })
        .eq('id', updateId);

      if (updateError) {
        throw new Error(`Failed to discard update: ${updateError.message}`);
      }

      return new Response(
        JSON.stringify({ success: true, action: 'discarded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action is 'approve' - update the flow and regenerate analysis
    const flowData = pendingUpdate.user_flows;
    const newData = pendingUpdate.new_data;

    // Generate updated analysis if API key is available
    let newDescription = flowData.description;
    if (LOVABLE_API_KEY) {
      try {
        const analysisPrompt = `Write a concise 300-word expert analysis of the latest data for "${flowData.query}". 
The data shows flows between these elements: ${newData.nodes?.slice(0, 10).map((n: { name: string }) => n.name).join(', ')}.
Focus on key insights, trends, and what the data reveals. Use current ${new Date().getFullYear()} context.`;

        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { role: 'system', content: 'You are a data analyst writing concise, insightful analyses.' },
              { role: 'user', content: analysisPrompt },
            ],
          }),
        });

        if (response.ok) {
          const aiResponse = await response.json();
          const content = aiResponse.choices?.[0]?.message?.content?.trim();
          if (content) {
            newDescription = content;
          }
        }
      } catch (analysisError) {
        console.error('Failed to generate new analysis:', analysisError);
        // Continue with existing description
      }
    }

    // Update the flow with new data
    const { error: flowUpdateError } = await supabase
      .from('user_flows')
      .update({
        data: newData,
        description: newDescription,
        updated_at: now,
      })
      .eq('id', flowData.id);

    if (flowUpdateError) {
      throw new Error(`Failed to update flow: ${flowUpdateError.message}`);
    }

    // Mark pending update as approved
    const { error: pendingUpdateError } = await supabase
      .from('pending_updates')
      .update({
        status: 'approved',
        reviewed_at: now,
        reviewed_by: userId,
      })
      .eq('id', updateId);

    if (pendingUpdateError) {
      throw new Error(`Failed to update pending status: ${pendingUpdateError.message}`);
    }

    // Log success
    await supabase.from('system_logs').insert({
      function_name: 'approve-pending-update',
      flow_id: flowData.id,
      level: 'info',
      message: `Flow approved and updated successfully`,
      details: { updateId, changePercent: pendingUpdate.change_percent },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        action: 'approved',
        flowId: flowData.id,
        analysisUpdated: !!LOVABLE_API_KEY,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('approve-pending-update error:', errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
