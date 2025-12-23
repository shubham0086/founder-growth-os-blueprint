import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')!;
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }
  return data;
}

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

    const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN');
    if (!developerToken) {
      throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
    }

    // Create sync run record
    const { data: run, error: runError } = await supabase
      .from('sync_runs')
      .insert({
        workspace_id,
        provider: 'google',
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

    await log('info', 'Starting Google Ads sync');

    // Get connection
    const { data: connection, error: connError } = await supabase
      .from('google_ads_connections')
      .select('*')
      .eq('workspace_id', workspace_id)
      .single();

    if (connError || !connection) {
      throw new Error('Google Ads not connected for this workspace');
    }

    // Get selected accounts
    const { data: accounts, error: accError } = await supabase
      .from('google_ads_accounts')
      .select('*')
      .eq('workspace_id', workspace_id);

    if (accError) throw accError;

    if (!accounts || accounts.length === 0) {
      await log('warn', 'No Google Ads accounts selected for sync');
      await supabase
        .from('sync_runs')
        .update({ status: 'completed', finished_at: new Date().toISOString(), rows_upserted: 0 })
        .eq('id', runId);
      
      return new Response(
        JSON.stringify({ success: true, rows_upserted: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Refresh token if needed
    let accessToken = connection.access_token;
    const tokenExpiry = new Date(connection.token_expires_at);
    
    if (tokenExpiry <= new Date()) {
      await log('info', 'Refreshing expired token');
      const newTokens = await refreshAccessToken(connection.refresh_token);
      accessToken = newTokens.access_token;
      
      await supabase
        .from('google_ads_connections')
        .update({
          access_token: accessToken,
          token_expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
        })
        .eq('workspace_id', workspace_id);
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days_back);

    await log('info', `Fetching metrics from ${formatDate(startDate)} to ${formatDate(endDate)}`);

    let totalRowsUpserted = 0;

    for (const account of accounts) {
      await log('info', `Syncing account ${account.customer_id}: ${account.name}`);

      try {
        // Use Google Ads Query Language
        const query = `
          SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            campaign.advertising_channel_type,
            segments.date,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value,
            metrics.ctr,
            metrics.average_cpc
          FROM campaign
          WHERE segments.date BETWEEN '${formatDate(startDate)}' AND '${formatDate(endDate)}'
        `;

        const searchResponse = await fetch(
          `https://googleads.googleapis.com/v15/customers/${account.customer_id}/googleAds:searchStream`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'developer-token': developerToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
          }
        );

        const searchData = await searchResponse.json();

        if (searchData.error) {
          await log('error', `API error for ${account.customer_id}: ${searchData.error.message}`);
          continue;
        }

        // Process results
        const metricsToUpsert = [];
        const campaignsToUpsert = [];

        for (const result of searchData || []) {
          if (!result.results) continue;

          for (const row of result.results) {
            const campaign = row.campaign;
            const metrics = row.metrics;
            const date = row.segments?.date;

            if (campaign && date) {
              // Track campaign
              campaignsToUpsert.push({
                workspace_id,
                customer_id: account.customer_id,
                campaign_id: campaign.id.toString(),
                name: campaign.name,
                status: campaign.status,
                channel_type: campaign.advertisingChannelType,
              });

              // Track daily metrics
              metricsToUpsert.push({
                workspace_id,
                customer_id: account.customer_id,
                campaign_id: campaign.id.toString(),
                date,
                impressions: metrics.impressions || 0,
                clicks: metrics.clicks || 0,
                cost_micros: metrics.costMicros || 0,
                conversions: metrics.conversions || 0,
                conversion_value: metrics.conversionsValue || 0,
                ctr: metrics.ctr || 0,
                cpc_micros: metrics.averageCpc || 0,
              });
            }
          }
        }

        // Upsert campaigns
        if (campaignsToUpsert.length > 0) {
          const uniqueCampaigns = Array.from(
            new Map(campaignsToUpsert.map(c => [c.campaign_id, c])).values()
          );
          
          const { error: campError } = await supabase
            .from('google_ads_campaigns')
            .upsert(uniqueCampaigns, {
              onConflict: 'workspace_id,customer_id,campaign_id',
            });

          if (campError) {
            await log('error', `Failed to upsert campaigns: ${campError.message}`);
          }
        }

        // Upsert metrics
        if (metricsToUpsert.length > 0) {
          const { error: metricsError } = await supabase
            .from('google_ads_metrics_daily')
            .upsert(metricsToUpsert, {
              onConflict: 'workspace_id,customer_id,campaign_id,date',
            });

          if (metricsError) {
            await log('error', `Failed to upsert metrics: ${metricsError.message}`);
          } else {
            totalRowsUpserted += metricsToUpsert.length;
            await log('info', `Upserted ${metricsToUpsert.length} metric rows for ${account.customer_id}`);
          }
        }
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : 'Unknown error';
        await log('error', `Error syncing account ${account.customer_id}: ${errMsg}`);
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
    console.error('Error in google-ads-sync:', error);
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
