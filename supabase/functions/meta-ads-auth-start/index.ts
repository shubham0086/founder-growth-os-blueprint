import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workspace_id, redirect_uri } = await req.json();

    if (!workspace_id) {
      throw new Error('workspace_id is required');
    }

    const appId = Deno.env.get('META_APP_ID');
    if (!appId) {
      throw new Error('META_APP_ID not configured. Please add it in backend secrets.');
    }

    // Meta Marketing API permissions
    const scopes = [
      'ads_read',
      'read_insights',
      'business_management',
    ];

    const state = btoa(JSON.stringify({ workspace_id }));
    
    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.set('client_id', appId);
    authUrl.searchParams.set('redirect_uri', redirect_uri || `${req.headers.get('origin')}/settings?tab=integrations`);
    authUrl.searchParams.set('scope', scopes.join(','));
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');

    console.log('Generated Meta Ads OAuth URL for workspace:', workspace_id);

    return new Response(
      JSON.stringify({ auth_url: authUrl.toString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in meta-ads-auth-start:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
