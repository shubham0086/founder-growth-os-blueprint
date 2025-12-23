import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

export interface MetaAdsConnection {
  id: string;
  workspace_id: string;
  user_id: string;
  app_scoped_user_id: string | null;
  status: string | null;
  token_expiry: string | null;
  created_at: string;
  updated_at: string;
}

export interface MetaAdAccount {
  id: string;
  account_id: string;
  name: string;
  currency: string | null;
  timezone: string | null;
  is_selected: boolean | null;
}

export function useMetaAdsConnection() {
  const { workspace } = useWorkspace();
  const [connection, setConnection] = useState<MetaAdsConnection | null>(null);
  const [accounts, setAccounts] = useState<MetaAdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const fetchConnection = useCallback(async () => {
    if (!workspace?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('meta_ads_connections')
        .select('id, workspace_id, user_id, app_scoped_user_id, status, token_expiry, created_at, updated_at')
        .eq('workspace_id', workspace.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      setConnection(data);

      // Also fetch accounts if connected
      if (data) {
        const { data: accountsData } = await supabase
          .from('meta_ad_accounts')
          .select('id, account_id, name, currency, timezone, is_selected')
          .eq('workspace_id', workspace.id);
        
        setAccounts(accountsData || []);
      }
    } catch (err) {
      console.error('Error fetching Meta Ads connection:', err);
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  const connectMetaAds = async () => {
    if (!workspace?.id) {
      toast.error('No workspace selected');
      return;
    }

    setConnecting(true);
    
    try {
      const response = await supabase.functions.invoke('meta-ads-auth-start', {
        body: { workspace_id: workspace.id },
      });

      if (response.error) throw response.error;
      
      const { auth_url } = response.data;
      if (auth_url) {
        window.location.href = auth_url;
      } else {
        throw new Error('No auth URL returned');
      }
    } catch (err: unknown) {
      console.error('Error connecting Meta Ads:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect Meta Ads';
      toast.error(errorMessage);
      setConnecting(false);
    }
  };

  const disconnectMetaAds = async () => {
    if (!connection?.id) return;

    try {
      const { error } = await supabase
        .from('meta_ads_connections')
        .update({ status: 'disconnected' })
        .eq('id', connection.id);

      if (error) throw error;

      setConnection(null);
      setAccounts([]);
      toast.success('Meta Ads disconnected');
    } catch (err) {
      console.error('Error disconnecting Meta Ads:', err);
      toast.error('Failed to disconnect');
    }
  };

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const isMetaCallback = urlParams.get('meta_ads') === 'connected';
      
      if (!isMetaCallback || !workspace?.id) return;

      toast.success('Meta Ads connected successfully!');
      await fetchConnection();

      // Clean up URL
      window.history.replaceState({}, '', '/settings?tab=integrations');
    };

    handleOAuthCallback();
  }, [workspace?.id, fetchConnection]);

  return {
    connection,
    accounts,
    loading,
    connecting,
    isConnected: !!connection,
    connectMetaAds,
    disconnectMetaAds,
    refetch: fetchConnection,
  };
}
