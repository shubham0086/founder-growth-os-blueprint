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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workspace_id } = await req.json();

    if (!workspace_id) {
      throw new Error('workspace_id is required');
    }

    const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN');
    if (!developerToken) {
      throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get connection
    const { data: connection, error: connError } = await supabase
      .from('google_ads_connections')
      .select('*')
      .eq('workspace_id', workspace_id)
      .single();

    if (connError || !connection) {
      throw new Error('Google Ads not connected for this workspace');
    }

    // Refresh token if needed
    let accessToken = connection.access_token;
    const tokenExpiry = new Date(connection.token_expires_at);
    
    if (tokenExpiry <= new Date()) {
      console.log('Refreshing expired token...');
      const newTokens = await refreshAccessToken(connection.refresh_token);
      accessToken = newTokens.access_token;
      
      // Update stored token
      await supabase
        .from('google_ads_connections')
        .update({
          access_token: accessToken,
          token_expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
        })
        .eq('workspace_id', workspace_id);
    }

    // List accessible customers using Google Ads API
    const customersResponse = await fetch(
      'https://googleads.googleapis.com/v15/customers:listAccessibleCustomers',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': developerToken,
        },
      }
    );

    const customersData = await customersResponse.json();
    
    if (customersData.error) {
      console.error('Google Ads API error:', customersData.error);
      throw new Error(customersData.error.message || 'Failed to list accounts');
    }

    const resourceNames = customersData.resourceNames || [];
    const accounts = [];

    // Get details for each customer
    for (const resourceName of resourceNames) {
      const customerId = resourceName.replace('customers/', '');
      
      try {
        const detailResponse = await fetch(
          `https://googleads.googleapis.com/v15/${resourceName}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'developer-token': developerToken,
            },
          }
        );

        const detail = await detailResponse.json();
        
        if (!detail.error) {
          accounts.push({
            customer_id: customerId,
            name: detail.descriptiveName || `Account ${customerId}`,
            currency_code: detail.currencyCode,
            time_zone: detail.timeZone,
            is_manager: detail.manager || false,
          });
        }
      } catch (e) {
        console.warn(`Failed to get details for ${customerId}:`, e);
        accounts.push({
          customer_id: customerId,
          name: `Account ${customerId}`,
        });
      }
    }

    console.log(`Found ${accounts.length} Google Ads accounts for workspace:`, workspace_id);

    return new Response(
      JSON.stringify({ accounts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in google-ads-list-accounts:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
