import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';

export interface SyncRun {
  id: string;
  workspace_id: string;
  provider: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  error: string | null;
  rows_upserted: number | null;
}

export function useSyncStatus(provider: 'google' | 'meta') {
  const { workspace } = useWorkspace();
  const [lastSync, setLastSync] = useState<SyncRun | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLastSync = useCallback(async () => {
    if (!workspace?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('sync_runs')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('provider', provider)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setLastSync(data);
    } catch (err) {
      console.error('Error fetching sync status:', err);
    } finally {
      setLoading(false);
    }
  }, [workspace?.id, provider]);

  useEffect(() => {
    fetchLastSync();
  }, [fetchLastSync]);

  const triggerSync = async (days: number = 7) => {
    if (!workspace?.id) return;

    setSyncing(true);
    
    try {
      const functionName = provider === 'google' ? 'google-ads-sync' : 'meta-ads-sync';
      const response = await supabase.functions.invoke(functionName, {
        body: { 
          workspace_id: workspace.id,
          days_back: days,
        },
      });

      if (response.error) throw response.error;
      
      await fetchLastSync();
    } catch (err) {
      console.error('Error triggering sync:', err);
      throw err;
    } finally {
      setSyncing(false);
    }
  };

  return {
    lastSync,
    syncing,
    loading,
    triggerSync,
    refetch: fetchLastSync,
  };
}
