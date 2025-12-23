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
    const { code, state, redirect_uri } = await req.json();

    if (!code || !state) {
      throw new Error('code and state are required');
    }

    const appId = Deno.env.get('META_APP_ID');
    const appSecret = Deno.env.get('META_APP_SECRET');
    
    if (!appId || !appSecret) {
      throw new Error('Meta OAuth credentials not configured');
    }

    // Decode state to get workspace_id
    const { workspace_id } = JSON.parse(atob(state));

    // Exchange code for access token
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', appId);
    tokenUrl.searchParams.set('client_secret', appSecret);
    tokenUrl.searchParams.set('redirect_uri', redirect_uri || `${req.headers.get('origin')}/settings?tab=integrations`);
    tokenUrl.searchParams.set('code', code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokens = await tokenResponse.json();

    if (tokens.error) {
      console.error('Token exchange error:', tokens);
      throw new Error(tokens.error.message || tokens.error);
    }

    // Exchange for long-lived token
    const longLivedUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token');
    longLivedUrl.searchParams.set('client_id', appId);
    longLivedUrl.searchParams.set('client_secret', appSecret);
    longLivedUrl.searchParams.set('fb_exchange_token', tokens.access_token);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    const longLivedTokens = await longLivedResponse.json();

    const accessToken = longLivedTokens.access_token || tokens.access_token;
    const expiresIn = longLivedTokens.expires_in || tokens.expires_in || 5184000; // Default 60 days

    // Get user info
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`
    );
    const userInfo = await userResponse.json();

    // Store connection in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get workspace user_id
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('user_id')
      .eq('id', workspace_id)
      .single();

    const tokenExpiry = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Upsert connection
    const { error: upsertError } = await supabase
      .from('meta_ads_connections')
      .upsert({
        workspace_id,
        user_id: workspace?.user_id || '',
        app_scoped_user_id: userInfo.id,
        access_token: accessToken,
        token_expiry: tokenExpiry,
        status: 'connected',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'workspace_id',
      });

    if (upsertError) {
      console.error('Database error:', upsertError);
      throw new Error('Failed to save connection');
    }

    console.log('Meta Ads connected for workspace:', workspace_id, 'user:', userInfo.name);

    return new Response(
      JSON.stringify({ success: true, user_name: userInfo.name }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in meta-ads-auth-callback:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
