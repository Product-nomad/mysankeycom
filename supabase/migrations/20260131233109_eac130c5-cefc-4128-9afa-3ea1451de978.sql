-- Drop the public SELECT policy from user_flows table
-- This prevents direct access to user_id through the base table
DROP POLICY IF EXISTS "Public flows are viewable by anyone" ON public.user_flows;

-- Recreate the user_flows_public view as SECURITY DEFINER
-- This allows the view to access data without requiring the caller to have direct table access
DROP VIEW IF EXISTS public.user_flows_public;

CREATE VIEW public.user_flows_public 
WITH (security_invoker = false)
AS
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

-- Add comment for documentation
COMMENT ON VIEW public.user_flows_public IS 'Public view of user flows that excludes sensitive user_id field';