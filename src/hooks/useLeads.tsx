import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from './useWorkspace';
import { formatDistanceToNow } from 'date-fns';

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  stage: string;
  score: number | null;
  createdAt: string;
  rawCreatedAt: string;
}

export interface ScoreResult {
  updated: number;
  total: number;
  details: Array<{ id: string; name: string; oldScore: number; newScore: number }>;
}

export function useLeads() {
  const { workspace } = useWorkspace();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    if (!workspace?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedLeads: Lead[] = (data || []).map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        stage: lead.stage,
        score: lead.score,
        createdAt: formatDistanceToNow(new Date(lead.created_at), { addSuffix: true }),
        rawCreatedAt: lead.created_at,
      }));

      setLeads(mappedLeads);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  const scoreLeads = useCallback(async (leadId?: string): Promise<ScoreResult | null> => {
    if (!workspace?.id) return null;

    try {
      setScoring(true);
      
      const { data, error: scoreError } = await supabase.functions.invoke('score-leads', {
        body: { 
          workspace_id: workspace.id,
          lead_id: leadId 
        },
      });

      if (scoreError) throw scoreError;

      // Refresh leads after scoring
      await fetchLeads();

      return data as ScoreResult;
    } catch (err) {
      console.error('Error scoring leads:', err);
      throw err;
    } finally {
      setScoring(false);
    }
  }, [workspace?.id, fetchLeads]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return { leads, loading, scoring, error, refetch: fetchLeads, scoreLeads };
}
