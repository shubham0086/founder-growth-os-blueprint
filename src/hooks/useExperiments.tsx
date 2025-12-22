import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from './useWorkspace';
import { Json } from '@/integrations/supabase/types';

export interface Experiment {
  id: string;
  hypothesis: string;
  metric: string | null;
  variants: string[] | null;
  status: string;
  result: Json | null;
  created_at: string;
  updated_at: string;
}

export function useExperiments() {
  const { workspace } = useWorkspace();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiments = useCallback(async () => {
    if (!workspace?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('experiments')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setExperiments(data || []);
    } catch (err) {
      console.error('Error fetching experiments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load experiments');
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  const createExperiment = async (experiment: Partial<Experiment>) => {
    if (!workspace?.id) return;

    const { error } = await supabase
      .from('experiments')
      .insert({
        workspace_id: workspace.id,
        hypothesis: experiment.hypothesis || 'New experiment hypothesis',
        metric: experiment.metric || null,
        variants: experiment.variants || [],
        status: 'backlog',
      });

    if (error) throw error;
    await fetchExperiments();
  };

  const updateExperiment = async (id: string, updates: Partial<Experiment>) => {
    const { error } = await supabase
      .from('experiments')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchExperiments();
  };

  const deleteExperiment = async (id: string) => {
    const { error } = await supabase
      .from('experiments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchExperiments();
  };

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  return { 
    experiments, 
    loading, 
    error, 
    refetch: fetchExperiments,
    createExperiment,
    updateExperiment,
    deleteExperiment,
  };
}
