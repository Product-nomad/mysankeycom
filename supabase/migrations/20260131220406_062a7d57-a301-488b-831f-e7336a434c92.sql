-- Create pending_updates table for staging auto-refreshed flows
CREATE TABLE public.pending_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES public.user_flows(id) ON DELETE CASCADE,
  old_data JSONB NOT NULL,
  new_data JSONB NOT NULL,
  old_total_value NUMERIC NOT NULL,
  new_total_value NUMERIC NOT NULL,
  change_percent NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'manual_review', 'approved', 'discarded')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- Enable RLS
ALTER TABLE public.pending_updates ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for edge functions and admin)
CREATE POLICY "Service role full access on pending_updates"
ON public.pending_updates
FOR ALL
USING (true)
WITH CHECK (true);

-- Create system_logs table for error tracking
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  flow_id UUID REFERENCES public.user_flows(id) ON DELETE SET NULL,
  level TEXT NOT NULL DEFAULT 'error' CHECK (level IN ('info', 'warn', 'error')),
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access on system_logs"
ON public.system_logs
FOR ALL
USING (true)
WITH CHECK (true);

-- Add index for efficient queries
CREATE INDEX idx_pending_updates_status ON public.pending_updates(status);
CREATE INDEX idx_pending_updates_created_at ON public.pending_updates(created_at DESC);
CREATE INDEX idx_system_logs_level ON public.system_logs(level);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX idx_user_flows_updated_at ON public.user_flows(updated_at);