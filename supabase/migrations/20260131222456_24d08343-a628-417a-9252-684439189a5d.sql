-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create admin_users table for role-based access control
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'admin',
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  granted_by uuid
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
  )
$$;

-- RLS Policies for admin_users table
CREATE POLICY "Admins can view admin list"
ON public.admin_users FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage other admins"
ON public.admin_users FOR ALL
USING (public.is_admin(auth.uid()));

-- Fix user_flows_public view - add proper security
DROP VIEW IF EXISTS public.user_flows_public;
CREATE VIEW public.user_flows_public
WITH (security_invoker=on) AS
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

-- Grant access to the view
GRANT SELECT ON public.user_flows_public TO anon, authenticated;

-- Update system_logs policies - allow admins to read
DROP POLICY IF EXISTS "Service role full access on system_logs" ON public.system_logs;
CREATE POLICY "Service role insert on system_logs"
ON public.system_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can read system logs"
ON public.system_logs FOR SELECT
USING (public.is_admin(auth.uid()));

-- Update pending_updates policies - allow admins to read
DROP POLICY IF EXISTS "Service role full access on pending_updates" ON public.pending_updates;
CREATE POLICY "Service role insert on pending_updates"
ON public.pending_updates FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role update on pending_updates"
ON public.pending_updates FOR UPDATE
USING (true);

CREATE POLICY "Admins can read pending updates"
ON public.pending_updates FOR SELECT
USING (public.is_admin(auth.uid()));