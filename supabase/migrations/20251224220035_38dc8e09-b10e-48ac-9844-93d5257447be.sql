-- Add user_id column to google_ads_connections to track who created the connection
ALTER TABLE public.google_ads_connections 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Backfill existing connections using the workspace owner's user_id
UPDATE public.google_ads_connections gac
SET user_id = w.user_id
FROM public.workspaces w
WHERE gac.workspace_id = w.id
AND gac.user_id IS NULL;

-- Make user_id NOT NULL after backfill
ALTER TABLE public.google_ads_connections
ALTER COLUMN user_id SET NOT NULL;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their workspace's Google Ads connections" ON public.google_ads_connections;
DROP POLICY IF EXISTS "Users can insert connections to their workspaces" ON public.google_ads_connections;
DROP POLICY IF EXISTS "Users can update their workspace's connections" ON public.google_ads_connections;
DROP POLICY IF EXISTS "Users can delete their workspace's connections" ON public.google_ads_connections;

-- Create stricter RLS policies that check BOTH workspace ownership AND user_id
-- This ensures only the user who created the connection can access tokens
CREATE POLICY "Users can view their own Google Ads connections"
ON public.google_ads_connections FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND user_owns_workspace(workspace_id));

CREATE POLICY "Users can insert their own Google Ads connections"
ON public.google_ads_connections FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND user_owns_workspace(workspace_id));

CREATE POLICY "Users can update their own Google Ads connections"
ON public.google_ads_connections FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND user_owns_workspace(workspace_id));

CREATE POLICY "Users can delete their own Google Ads connections"
ON public.google_ads_connections FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND user_owns_workspace(workspace_id));