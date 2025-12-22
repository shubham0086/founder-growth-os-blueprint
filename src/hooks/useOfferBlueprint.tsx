import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from './useWorkspace';
import { Json } from '@/integrations/supabase/types';

export interface OfferBlueprint {
  id: string;
  name: string;
  promise: string | null;
  mechanism: string | null;
  proof: string | null;
  tiers: Json | null;
  objections: Json | null;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export function useOfferBlueprint() {
  const { workspace } = useWorkspace();
  const [blueprint, setBlueprint] = useState<OfferBlueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlueprint = useCallback(async () => {
    if (!workspace?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('offer_blueprints')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setBlueprint(data);
    } catch (err) {
      console.error('Error fetching offer blueprint:', err);
      setError(err instanceof Error ? err.message : 'Failed to load blueprint');
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  const createBlueprint = async (data: Partial<OfferBlueprint>) => {
    if (!workspace?.id) return;

    const { error } = await supabase
      .from('offer_blueprints')
      .insert({
        workspace_id: workspace.id,
        name: data.name || 'New Offer',
        promise: data.promise || null,
        mechanism: data.mechanism || null,
        proof: data.proof || null,
        tiers: data.tiers || [],
        objections: data.objections || [],
        status: 'draft',
        version: 1,
      });

    if (error) throw error;
    await fetchBlueprint();
  };

  const updateBlueprint = async (id: string, updates: Partial<OfferBlueprint>) => {
    const { error } = await supabase
      .from('offer_blueprints')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchBlueprint();
  };

  useEffect(() => {
    fetchBlueprint();
  }, [fetchBlueprint]);

  return { 
    blueprint, 
    loading, 
    error, 
    refetch: fetchBlueprint,
    createBlueprint,
    updateBlueprint,
  };
}
