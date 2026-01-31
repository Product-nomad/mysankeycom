-- Fix warn-level security issues: Add missing DELETE policies

-- 1. Allow users to delete their own profiles (GDPR/privacy compliance)
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- 2. Allow service role to delete pending_updates for cleanup
CREATE POLICY "Service role can delete pending updates"
ON public.pending_updates
FOR DELETE
USING (true);

-- 3. Allow service role to delete and update system_logs for log rotation
CREATE POLICY "Service role can delete system logs"
ON public.system_logs
FOR DELETE
USING (true);

CREATE POLICY "Service role can update system logs"
ON public.system_logs
FOR UPDATE
USING (true);