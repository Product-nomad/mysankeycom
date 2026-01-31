-- Drop the existing view and recreate with data field included (needed for chart rendering)
-- but exclude query and breadcrumbs which contain potentially sensitive search patterns
DROP VIEW IF EXISTS public.user_flows_public;

CREATE VIEW public.user_flows_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    title,
    description,
    data,  -- Include data since it's needed to render the Sankey chart
    settings,
    share_slug,
    is_public,
    created_at,
    updated_at
    -- Deliberately excluding: query, breadcrumbs, user_id (potentially sensitive user search patterns)
  FROM public.user_flows
  WHERE is_public = true;