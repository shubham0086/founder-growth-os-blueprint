import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from './useWorkspace';

export interface Automation {
  id: string;
  name: string;
  trigger_event: string;
  channel: string;
  status: string;
  template: string | null;
  delay_hours: number | null;
  sequence_order: number | null;
  created_at: string;
}

export function useAutomations() {
  const { workspace } = useWorkspace();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAutomations = useCallback(async () => {
    if (!workspace?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('automations')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('sequence_order', { ascending: true });

      if (fetchError) throw fetchError;
      setAutomations(data || []);
    } catch (err) {
      console.error('Error fetching automations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load automations');
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  const createAutomation = async (automation: Partial<Automation>) => {
    if (!workspace?.id) return;

    const { error } = await supabase
      .from('automations')
      .insert({
        workspace_id: workspace.id,
        name: automation.name || 'New Automation',
        trigger_event: automation.trigger_event || 'new_lead',
        channel: automation.channel || 'email',
        status: 'active',
        template: automation.template || null,
        delay_hours: automation.delay_hours || 0,
        sequence_order: automations.length + 1,
      });

    if (error) throw error;
    await fetchAutomations();
  };

  const updateAutomation = async (id: string, updates: Partial<Automation>) => {
    const { error } = await supabase
      .from('automations')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchAutomations();
  };

  const deleteAutomation = async (id: string) => {
    const { error } = await supabase
      .from('automations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchAutomations();
  };

  useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  return { 
    automations, 
    loading, 
    error, 
    refetch: fetchAutomations,
    createAutomation,
    updateAutomation,
    deleteAutomation,
  };
}
