-- Create a system user for seeded gallery content
-- This allows the seed function to insert public flows without a real user

-- Add a policy to allow inserting with the system user ID from service role
CREATE POLICY "Service role can insert system flows"
ON public.user_flows
FOR INSERT
TO service_role
WITH CHECK (true);

-- Add a policy to allow service role to update system flows
CREATE POLICY "Service role can update system flows"
ON public.user_flows
FOR UPDATE
TO service_role
USING (true);

-- Add a policy to allow service role to delete system flows
CREATE POLICY "Service role can delete system flows"
ON public.user_flows
FOR DELETE
TO service_role
USING (true);