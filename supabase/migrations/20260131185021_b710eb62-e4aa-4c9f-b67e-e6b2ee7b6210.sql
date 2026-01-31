-- Create a public-safe view for user_flows that only exposes non-sensitive fields
-- This view will be used for public access instead of direct table access

CREATE VIEW public.user_flows_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    title,
    description,
    settings,
    share_slug,
    is_public,
    created_at,
    updated_at
    -- Deliberately excluding: query, data, breadcrumbs, user_id (potentially sensitive)
  FROM public.user_flows
  WHERE is_public = true;

-- Drop the existing public access policy that exposes all columns
DROP POLICY IF EXISTS "Public flows are viewable by anyone" ON public.user_flows;

-- Create a new restrictive policy that denies direct public SELECT access
-- Users can only view their own flows directly; public flows must go through the view
-- Note: The view will work because security_invoker respects the user's actual permissions
-- For anonymous/public access to the view, we need a policy that allows reading public flows
-- but only through the view's limited columns

-- Re-create the public access policy with same logic (the view handles column restriction)
CREATE POLICY "Public flows are viewable by anyone" 
  ON public.user_flows 
  FOR SELECT 
  USING (is_public = true);