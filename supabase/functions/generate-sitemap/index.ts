import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all public flows
    const { data: flows, error } = await supabase
      .from('user_flows_public')
      .select('share_slug, updated_at, title')
      .eq('is_public', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching flows:', error);
      throw error;
    }

    // Get the base URL from request or use default
    const url = new URL(req.url);
    const baseUrl = url.searchParams.get('baseUrl') || 'https://mysankeycom.lovable.app';

    // Generate sitemap XML
    const now = new Date().toISOString().split('T')[0];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/explore</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/auth</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

    // Add dynamic flow pages
    if (flows && flows.length > 0) {
      for (const flow of flows) {
        if (!flow.share_slug) continue;
        
        const lastmod = flow.updated_at 
          ? new Date(flow.updated_at).toISOString().split('T')[0]
          : now;
        
        sitemap += `  <url>
    <loc>${baseUrl}/flow/${flow.share_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    }

    sitemap += `</urlset>`;

    console.log(`Generated sitemap with ${(flows?.length || 0) + 3} URLs`);

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error("generate-sitemap error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
