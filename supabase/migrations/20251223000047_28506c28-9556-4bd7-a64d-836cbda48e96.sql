-- Create table for storing Google Ads connections
CREATE TABLE public.google_ads_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  google_user_id TEXT NOT NULL,
  email TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  customer_ids TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_ads_connections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their workspace's Google Ads connections"
ON public.google_ads_connections
FOR SELECT
USING (public.user_owns_workspace(workspace_id));

CREATE POLICY "Users can insert connections to their workspaces"
ON public.google_ads_connections
FOR INSERT
WITH CHECK (public.user_owns_workspace(workspace_id));

CREATE POLICY "Users can update their workspace's connections"
ON public.google_ads_connections
FOR UPDATE
USING (public.user_owns_workspace(workspace_id));

CREATE POLICY "Users can delete their workspace's connections"
ON public.google_ads_connections
FOR DELETE
USING (public.user_owns_workspace(workspace_id));

-- Trigger for updated_at
CREATE TRIGGER update_google_ads_connections_updated_at
BEFORE UPDATE ON public.google_ads_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();