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
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Authenticate with user's token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { workspace_id } = await req.json();

    if (!workspace_id) {
      throw new Error('workspace_id is required');
    }

    // Validate workspace_id format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(workspace_id)) {
      throw new Error('Invalid workspace_id format');
    }

    // Verify user owns the workspace
    const { data: workspace, error: workspaceError } = await userClient
      .from('workspaces')
      .select('id')
      .eq('id', workspace_id)
      .eq('user_id', user.id)
      .single();

    if (workspaceError || !workspace) {
      console.error('Workspace ownership error:', workspaceError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: You do not own this workspace' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role for accessing connection data
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // List ad accounts the user has access to - pass token via header
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_id,currency,timezone_name,account_status`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
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

    console.log(`Found ${accounts.length} Meta ad accounts for workspace: ${workspace_id}, user: ${user.id}`);

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
