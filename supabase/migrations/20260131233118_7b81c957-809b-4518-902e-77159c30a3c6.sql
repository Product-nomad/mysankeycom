-- Revert to SECURITY INVOKER view and add RLS policy for public read
-- This is the recommended approach - use RLS on base table with restricted columns via view

DROP VIEW IF EXISTS public.user_flows_public;

-- Recreate view with SECURITY INVOKER (default, safer)
CREATE VIEW public.user_flows_public AS
SELECT 
    id,
    title,
    data,
    description,
    settings,
    share_slug,
    is_public,
    created_at,
    updated_at
FROM public.user_flows
WHERE is_public = true;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.user_flows_public TO anon, authenticated;

-- Re-add the public SELECT policy on user_flows but only accessible via view
-- The view filters out user_id so even though RLS allows access, the column is not exposed
CREATE POLICY "Public flows are viewable by anyone" 
ON public.user_flows 
FOR SELECT 
USING (is_public = true);

-- Add comment for documentation
COMMENT ON VIEW public.user_flows_public IS 'Public view of user flows that excludes sensitive user_id field. Always query this view for public access.';