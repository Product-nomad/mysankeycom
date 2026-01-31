-- Ensure the view has explicit security_invoker = true
ALTER VIEW public.user_flows_public SET (security_invoker = true);