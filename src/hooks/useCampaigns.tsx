import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from './useWorkspace';
import { Json } from '@/integrations/supabase/types';

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: string;
  structure: Json | null;
  budget_rules: Json | null;
  created_at: string;
  updated_at: string;
}

export function useCampaigns() {
  const { workspace } = useWorkspace();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!workspace?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('campaign_plans')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  const createCampaign = async (campaign: Partial<Campaign>) => {
    if (!workspace?.id) return;

    const { error } = await supabase
      .from('campaign_plans')
      .insert({
        workspace_id: workspace.id,
        name: campaign.name || 'New Campaign',
        platform: campaign.platform || 'Meta',
        status: 'draft',
        structure: campaign.structure || {},
        budget_rules: campaign.budget_rules || {},
      });

    if (error) throw error;
    await fetchCampaigns();
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    const { error } = await supabase
      .from('campaign_plans')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchCampaigns();
  };

  const deleteCampaign = async (id: string) => {
    const { error } = await supabase
      .from('campaign_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchCampaigns();
  };

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { 
    campaigns, 
    loading, 
    error, 
    refetch: fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
}
