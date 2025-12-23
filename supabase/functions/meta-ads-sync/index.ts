import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let runId: string | null = null;

  try {
    const { workspace_id, days_back = 7 } = await req.json();

    if (!workspace_id) {
      throw new Error('workspace_id is required');
    }

    // Create sync run record
    const { data: run, error: runError } = await supabase
      .from('sync_runs')
      .insert({
        workspace_id,
        provider: 'meta',
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (runError) throw runError;
    runId = run.id;

    const log = async (level: string, message: string) => {
      console.log(`[${level}] ${message}`);
      await supabase.from('sync_run_logs').insert({
        run_id: runId,
        level,
        message,
      });
    };

    await log('info', 'Starting Meta Ads sync');

    // Get connection
    const { data: connection, error: connError } = await supabase
      .from('meta_ads_connections')
      .select('*')
      .eq('workspace_id', workspace_id)
      .single();

    if (connError || !connection) {
      throw new Error('Meta Ads not connected for this workspace');
    }

    const accessToken = connection.access_token;

    // Get selected accounts
    const { data: accounts, error: accError } = await supabase
      .from('meta_ad_accounts')
      .select('*')
      .eq('workspace_id', workspace_id)
      .eq('is_selected', true);

    if (accError) throw accError;

    if (!accounts || accounts.length === 0) {
      await log('warn', 'No Meta ad accounts selected for sync');
      await supabase
        .from('sync_runs')
        .update({ status: 'completed', finished_at: new Date().toISOString(), rows_upserted: 0 })
        .eq('id', runId);
      
      return new Response(
        JSON.stringify({ success: true, rows_upserted: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days_back);

    await log('info', `Fetching metrics from ${formatDate(startDate)} to ${formatDate(endDate)}`);

    let totalRowsUpserted = 0;

    for (const account of accounts) {
      await log('info', `Syncing account ${account.account_id}: ${account.name}`);

      try {
        // Fetch campaigns first
        const campaignsUrl = `https://graph.facebook.com/v18.0/act_${account.account_id}/campaigns?fields=id,name,objective,status&access_token=${accessToken}`;
        const campaignsResponse = await fetch(campaignsUrl);
        const campaignsData = await campaignsResponse.json();

        if (campaignsData.error) {
          await log('error', `Failed to fetch campaigns: ${campaignsData.error.message}`);
          continue;
        }

        const campaigns = campaignsData.data || [];
        
        // Upsert campaigns
        const campaignsToUpsert = campaigns.map((c: any) => ({
          workspace_id,
          account_id: account.account_id,
          campaign_id: c.id,
          name: c.name,
          objective: c.objective,
          status: c.status,
        }));

        if (campaignsToUpsert.length > 0) {
          const { error: campError } = await supabase
            .from('meta_campaigns')
            .upsert(campaignsToUpsert, {
              onConflict: 'workspace_id,account_id,campaign_id',
            });

          if (campError) {
            await log('error', `Failed to upsert campaigns: ${campError.message}`);
          }
        }

        // Fetch insights for each campaign
        for (const campaign of campaigns) {
          const insightsUrl = `https://graph.facebook.com/v18.0/${campaign.id}/insights?fields=impressions,clicks,spend,actions,ctr,cpc&time_range={"since":"${formatDate(startDate)}","until":"${formatDate(endDate)}"}&time_increment=1&access_token=${accessToken}`;
          
          const insightsResponse = await fetch(insightsUrl);
          const insightsData = await insightsResponse.json();

          if (insightsData.error) {
            await log('warn', `Failed to fetch insights for campaign ${campaign.id}: ${insightsData.error.message}`);
            continue;
          }

          const insights = insightsData.data || [];
          const metricsToUpsert = insights.map((insight: any) => {
            // Extract conversions from actions
            let conversions = 0;
            if (insight.actions) {
              const leadAction = insight.actions.find((a: any) => 
                a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped'
              );
              if (leadAction) {
                conversions = parseInt(leadAction.value) || 0;
              }
            }

            return {
              workspace_id,
              account_id: account.account_id,
              campaign_id: campaign.id,
              date: insight.date_start,
              impressions: parseInt(insight.impressions) || 0,
              clicks: parseInt(insight.clicks) || 0,
              spend: parseFloat(insight.spend) || 0,
              actions_json: insight.actions || null,
              conversions,
              ctr: parseFloat(insight.ctr) || 0,
              cpc: parseFloat(insight.cpc) || 0,
            };
          });

          if (metricsToUpsert.length > 0) {
            const { error: metricsError } = await supabase
              .from('meta_metrics_daily')
              .upsert(metricsToUpsert, {
                onConflict: 'workspace_id,account_id,campaign_id,date',
              });

            if (metricsError) {
              await log('error', `Failed to upsert metrics: ${metricsError.message}`);
            } else {
              totalRowsUpserted += metricsToUpsert.length;
            }
          }
        }

        await log('info', `Synced ${campaigns.length} campaigns for account ${account.account_id}`);
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : 'Unknown error';
        await log('error', `Error syncing account ${account.account_id}: ${errMsg}`);
      }
    }

    // Update sync run as completed
    await supabase
      .from('sync_runs')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        rows_upserted: totalRowsUpserted,
      })
      .eq('id', runId);

    await log('info', `Sync completed. Total rows upserted: ${totalRowsUpserted}`);

    return new Response(
      JSON.stringify({ success: true, rows_upserted: totalRowsUpserted }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in meta-ads-sync:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (runId) {
      await supabase
        .from('sync_runs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          error: message,
        })
        .eq('id', runId);

      await supabase.from('sync_run_logs').insert({
        run_id: runId,
        level: 'error',
        message: message,
      });
    }

    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
