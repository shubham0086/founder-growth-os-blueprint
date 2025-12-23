-- =====================================================
-- PHASE 1: Google Ads + Meta Ads Integration Tables
-- =====================================================

-- Add UTM tracking columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS gclid text,
ADD COLUMN IF NOT EXISTS fbclid text,
ADD COLUMN IF NOT EXISTS referrer text,
ADD COLUMN IF NOT EXISTS landing_page_id uuid;

-- =====================================================
-- GOOGLE ADS TABLES
-- =====================================================

-- Google Ads Accounts (accessible accounts for a connection)
CREATE TABLE public.google_ads_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  customer_id text NOT NULL,
  name text NOT NULL,
  currency_code text,
  time_zone text,
  is_manager boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, customer_id)
);

-- Google Ads Campaigns
CREATE TABLE public.google_ads_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  customer_id text NOT NULL,
  campaign_id text NOT NULL,
  name text NOT NULL,
  status text,
  channel_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, customer_id, campaign_id)
);

-- Google Ads Daily Metrics
CREATE TABLE public.google_ads_metrics_daily (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  customer_id text NOT NULL,
  campaign_id text NOT NULL,
  date date NOT NULL,
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  cost_micros bigint DEFAULT 0,
  conversions numeric DEFAULT 0,
  conversion_value numeric DEFAULT 0,
  ctr numeric DEFAULT 0,
  cpc_micros bigint DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, customer_id, campaign_id, date)
);

-- =====================================================
-- META ADS TABLES
-- =====================================================

-- Meta Ads Connections
CREATE TABLE public.meta_ads_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  access_token text,
  token_expiry timestamp with time zone,
  app_scoped_user_id text,
  status text DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(workspace_id)
);

-- Meta Ad Accounts
CREATE TABLE public.meta_ad_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  account_id text NOT NULL,
  name text NOT NULL,
  currency text,
  timezone text,
  is_selected boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, account_id)
);

-- Meta Campaigns
CREATE TABLE public.meta_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  account_id text NOT NULL,
  campaign_id text NOT NULL,
  name text NOT NULL,
  objective text,
  status text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, account_id, campaign_id)
);

-- Meta Daily Metrics
CREATE TABLE public.meta_metrics_daily (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  account_id text NOT NULL,
  campaign_id text NOT NULL,
  date date NOT NULL,
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  spend numeric DEFAULT 0,
  actions_json jsonb DEFAULT '[]'::jsonb,
  conversions numeric DEFAULT 0,
  ctr numeric DEFAULT 0,
  cpc numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, account_id, campaign_id, date)
);

-- =====================================================
-- SYNC TRACKING TABLES
-- =====================================================

-- Sync Runs (job execution history)
CREATE TABLE public.sync_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('google', 'meta')),
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  finished_at timestamp with time zone,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed', 'degraded')),
  error text,
  rows_upserted integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Sync Run Logs (detailed logs for each run)
CREATE TABLE public.sync_run_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES public.sync_runs(id) ON DELETE CASCADE,
  level text NOT NULL DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_google_ads_metrics_workspace_date ON public.google_ads_metrics_daily(workspace_id, date);
CREATE INDEX idx_google_ads_metrics_campaign ON public.google_ads_metrics_daily(workspace_id, campaign_id, date);
CREATE INDEX idx_meta_metrics_workspace_date ON public.meta_metrics_daily(workspace_id, date);
CREATE INDEX idx_meta_metrics_campaign ON public.meta_metrics_daily(workspace_id, campaign_id, date);
CREATE INDEX idx_sync_runs_workspace ON public.sync_runs(workspace_id, provider, started_at DESC);
CREATE INDEX idx_leads_utm ON public.leads(workspace_id, source, created_at);
CREATE INDEX idx_leads_gclid ON public.leads(workspace_id, gclid) WHERE gclid IS NOT NULL;
CREATE INDEX idx_leads_fbclid ON public.leads(workspace_id, fbclid) WHERE fbclid IS NOT NULL;

-- =====================================================
-- UNIFIED ADS METRICS VIEW
-- =====================================================

CREATE OR REPLACE VIEW public.ads_metrics_daily AS
SELECT 
  'google'::text as network,
  workspace_id,
  customer_id as account_id,
  campaign_id,
  date,
  (cost_micros::numeric / 1000000) as spend,
  clicks,
  impressions,
  conversions
FROM public.google_ads_metrics_daily
UNION ALL
SELECT 
  'meta'::text as network,
  workspace_id,
  account_id,
  campaign_id,
  date,
  spend,
  clicks,
  impressions,
  conversions
FROM public.meta_metrics_daily;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE public.google_ads_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_ads_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ads_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_run_logs ENABLE ROW LEVEL SECURITY;

-- Google Ads Accounts policies
CREATE POLICY "Users can view google ads accounts in their workspaces" ON public.google_ads_accounts FOR SELECT USING (user_owns_workspace(workspace_id));
CREATE POLICY "Users can create google ads accounts in their workspaces" ON public.google_ads_accounts FOR INSERT WITH CHECK (user_owns_workspace(workspace_id));
CREATE POLICY "Users can update google ads accounts in their workspaces" ON public.google_ads_accounts FOR UPDATE USING (user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete google ads accounts in their workspaces" ON public.google_ads_accounts FOR DELETE USING (user_owns_workspace(workspace_id));

-- Google Ads Campaigns policies
CREATE POLICY "Users can view google ads campaigns in their workspaces" ON public.google_ads_campaigns FOR SELECT USING (user_owns_workspace(workspace_id));
CREATE POLICY "Users can create google ads campaigns in their workspaces" ON public.google_ads_campaigns FOR INSERT WITH CHECK (user_owns_workspace(workspace_id));
CREATE POLICY "Users can update google ads campaigns in their workspaces" ON public.google_ads_campaigns FOR UPDATE USING (user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete google ads campaigns in their workspaces" ON public.google_ads_campaigns FOR DELETE USING (user_owns_workspace(workspace_id));

-- Google Ads Metrics policies
CREATE POLICY "Users can view google ads metrics in their workspaces" ON public.google_ads_metrics_daily FOR SELECT USING (user_owns_workspace(workspace_id));
CREATE POLICY "Users can create google ads metrics in their workspaces" ON public.google_ads_metrics_daily FOR INSERT WITH CHECK (user_owns_workspace(workspace_id));
CREATE POLICY "Users can update google ads metrics in their workspaces" ON public.google_ads_metrics_daily FOR UPDATE USING (user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete google ads metrics in their workspaces" ON public.google_ads_metrics_daily FOR DELETE USING (user_owns_workspace(workspace_id));

-- Meta Ads Connections policies
CREATE POLICY "Users can view meta connections in their workspaces" ON public.meta_ads_connections FOR SELECT USING (user_owns_workspace(workspace_id));
CREATE POLICY "Users can create meta connections in their workspaces" ON public.meta_ads_connections FOR INSERT WITH CHECK (user_owns_workspace(workspace_id));
CREATE POLICY "Users can update meta connections in their workspaces" ON public.meta_ads_connections FOR UPDATE USING (user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete meta connections in their workspaces" ON public.meta_ads_connections FOR DELETE USING (user_owns_workspace(workspace_id));

-- Meta Ad Accounts policies
CREATE POLICY "Users can view meta ad accounts in their workspaces" ON public.meta_ad_accounts FOR SELECT USING (user_owns_workspace(workspace_id));
CREATE POLICY "Users can create meta ad accounts in their workspaces" ON public.meta_ad_accounts FOR INSERT WITH CHECK (user_owns_workspace(workspace_id));
CREATE POLICY "Users can update meta ad accounts in their workspaces" ON public.meta_ad_accounts FOR UPDATE USING (user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete meta ad accounts in their workspaces" ON public.meta_ad_accounts FOR DELETE USING (user_owns_workspace(workspace_id));

-- Meta Campaigns policies
CREATE POLICY "Users can view meta campaigns in their workspaces" ON public.meta_campaigns FOR SELECT USING (user_owns_workspace(workspace_id));
CREATE POLICY "Users can create meta campaigns in their workspaces" ON public.meta_campaigns FOR INSERT WITH CHECK (user_owns_workspace(workspace_id));
CREATE POLICY "Users can update meta campaigns in their workspaces" ON public.meta_campaigns FOR UPDATE USING (user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete meta campaigns in their workspaces" ON public.meta_campaigns FOR DELETE USING (user_owns_workspace(workspace_id));

-- Meta Metrics policies
CREATE POLICY "Users can view meta metrics in their workspaces" ON public.meta_metrics_daily FOR SELECT USING (user_owns_workspace(workspace_id));
CREATE POLICY "Users can create meta metrics in their workspaces" ON public.meta_metrics_daily FOR INSERT WITH CHECK (user_owns_workspace(workspace_id));
CREATE POLICY "Users can update meta metrics in their workspaces" ON public.meta_metrics_daily FOR UPDATE USING (user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete meta metrics in their workspaces" ON public.meta_metrics_daily FOR DELETE USING (user_owns_workspace(workspace_id));

-- Sync Runs policies
CREATE POLICY "Users can view sync runs in their workspaces" ON public.sync_runs FOR SELECT USING (user_owns_workspace(workspace_id));
CREATE POLICY "Users can create sync runs in their workspaces" ON public.sync_runs FOR INSERT WITH CHECK (user_owns_workspace(workspace_id));
CREATE POLICY "Users can update sync runs in their workspaces" ON public.sync_runs FOR UPDATE USING (user_owns_workspace(workspace_id));

-- Sync Run Logs policies (access through run_id relationship)
CREATE POLICY "Users can view sync logs for their runs" ON public.sync_run_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sync_runs WHERE sync_runs.id = sync_run_logs.run_id AND user_owns_workspace(sync_runs.workspace_id))
);
CREATE POLICY "Users can create sync logs for their runs" ON public.sync_run_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.sync_runs WHERE sync_runs.id = sync_run_logs.run_id AND user_owns_workspace(sync_runs.workspace_id))
);

-- Update triggers for updated_at
CREATE TRIGGER update_google_ads_accounts_updated_at BEFORE UPDATE ON public.google_ads_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_google_ads_campaigns_updated_at BEFORE UPDATE ON public.google_ads_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_google_ads_metrics_updated_at BEFORE UPDATE ON public.google_ads_metrics_daily FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meta_ads_connections_updated_at BEFORE UPDATE ON public.meta_ads_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meta_ad_accounts_updated_at BEFORE UPDATE ON public.meta_ad_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meta_campaigns_updated_at BEFORE UPDATE ON public.meta_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meta_metrics_updated_at BEFORE UPDATE ON public.meta_metrics_daily FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();