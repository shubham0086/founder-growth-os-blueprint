-- Fix ads_metrics_daily view - recreate with SECURITY INVOKER to enforce RLS
-- First drop the existing view
DROP VIEW IF EXISTS public.ads_metrics_daily;

-- Recreate the view with SECURITY INVOKER (this makes RLS from underlying tables apply)
CREATE VIEW public.ads_metrics_daily
WITH (security_invoker = true)
AS
SELECT 
  workspace_id,
  date,
  'google'::text AS network,
  customer_id AS account_id,
  campaign_id,
  clicks,
  impressions,
  (cost_micros::numeric / 1000000)::numeric AS spend,
  conversions
FROM google_ads_metrics_daily

UNION ALL

SELECT 
  workspace_id,
  date,
  'meta'::text AS network,
  account_id,
  campaign_id,
  clicks,
  impressions,
  spend,
  conversions
FROM meta_metrics_daily;