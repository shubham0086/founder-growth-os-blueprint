import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

export interface GoogleAdsConnection {
  id: string;
  workspace_id: string;
  google_user_id: string;
  email: string | null;
  customer_ids: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export function useGoogleAdsConnection() {
  const { workspace } = useWorkspace();
  const [connection, setConnection] = useState<GoogleAdsConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const fetchConnection = useCallback(async () => {
    if (!workspace?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('google_ads_connections')
        .select('id, workspace_id, google_user_id, email, customer_ids, status, created_at, updated_at')
        .eq('workspace_id', workspace.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      setConnection(data);
    } catch (err) {
      console.error('Error fetching Google Ads connection:', err);
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  const connectGoogleAds = async () => {
    if (!workspace?.id) {
      toast.error('No workspace selected');
      return;
    }

    setConnecting(true);
    
    try {
      // Use Supabase OAuth with Google provider
      // Scopes for Google Ads API access
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/adwords',
          redirectTo: `${window.location.origin}/settings?tab=integrations&google_ads=connected`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

      // The OAuth flow will redirect, so we handle the callback in a useEffect
    } catch (err: any) {
      console.error('Error connecting Google Ads:', err);
      toast.error(err.message || 'Failed to connect Google Ads');
      setConnecting(false);
    }
  };

  const disconnectGoogleAds = async () => {
    if (!connection?.id) return;

    try {
      const { error } = await supabase
        .from('google_ads_connections')
        .update({ status: 'disconnected' })
        .eq('id', connection.id);

      if (error) throw error;

      setConnection(null);
      toast.success('Google Ads disconnected');
    } catch (err) {
      console.error('Error disconnecting Google Ads:', err);
      toast.error('Failed to disconnect');
    }
  };

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const isGoogleAdsCallback = urlParams.get('google_ads') === 'connected';
      
      if (!isGoogleAdsCallback || !workspace?.id) return;

      try {
        // Get the current session which should have the Google tokens
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.provider_token) {
          console.log('No provider token available');
          return;
        }

        // Check if connection already exists
        const { data: existing } = await supabase
          .from('google_ads_connections')
          .select('id')
          .eq('workspace_id', workspace.id)
          .eq('google_user_id', session.user.id)
          .maybeSingle();

        if (!existing) {
          // Create new connection record with user_id for RLS
          const { error: insertError } = await supabase
            .from('google_ads_connections')
            .insert({
              workspace_id: workspace.id,
              user_id: session.user.id,
              google_user_id: session.user.user_metadata?.sub || session.user.id,
              email: session.user.email,
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token,
              status: 'active',
            });

          if (insertError) throw insertError;
          
          toast.success('Google Ads connected successfully!');
          await fetchConnection();
        }

        // Clean up URL
        window.history.replaceState({}, '', '/settings?tab=integrations');
      } catch (err) {
        console.error('Error handling OAuth callback:', err);
        toast.error('Failed to complete Google Ads connection');
      }
    };

    handleOAuthCallback();
  }, [workspace?.id, fetchConnection]);

  return {
    connection,
    loading,
    connecting,
    isConnected: !!connection,
    connectGoogleAds,
    disconnectGoogleAds,
    refetch: fetchConnection,
  };
}
