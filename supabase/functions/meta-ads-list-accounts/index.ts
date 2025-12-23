import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workspace_id } = await req.json();

    if (!workspace_id) {
      throw new Error('workspace_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // List ad accounts the user has access to
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_id,currency,timezone_name,account_status&access_token=${accessToken}`
    );

    const accountsData = await accountsResponse.json();

    if (accountsData.error) {
      console.error('Meta API error:', accountsData.error);
      throw new Error(accountsData.error.message || 'Failed to list accounts');
    }

    const accounts = (accountsData.data || []).map((acc: any) => ({
      account_id: acc.account_id,
      name: acc.name,
      currency: acc.currency,
      timezone: acc.timezone_name,
      status: acc.account_status,
    }));

    console.log(`Found ${accounts.length} Meta ad accounts for workspace:`, workspace_id);

    return new Response(
      JSON.stringify({ accounts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in meta-ads-list-accounts:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
