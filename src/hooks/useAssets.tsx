import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

interface Asset {
  id: string;
  name: string;
  type: string;
  content: string | null;
  status: string;
  tags: string[] | null;
  created_at: string;
}

export function useAssets() {
  const { workspace } = useWorkspace();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchAssets = useCallback(async () => {
    if (!workspace?.id) return;

    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assets:', error);
      return;
    }

    setAssets(data || []);
  }, [workspace?.id]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchAssets();
      setLoading(false);
    }
    load();
  }, [fetchAssets]);

  const generateAsset = async (type: 'ad_copy' | 'video_script' | 'creative_brief' | 'email', prompt: string) => {
    if (!workspace?.id) return;

    setGenerating(true);
    const toastId = toast.loading(`Generating ${type.replace('_', ' ')}...`);

    try {
      const { data, error } = await supabase.functions.invoke('ai-generate', {
        body: {
          prompt,
          type,
          context: {
            industry: workspace.industry,
            name: workspace.name,
          },
        },
      });

      if (error) throw error;

      // Save to database
      const { data: asset, error: insertError } = await supabase
        .from('assets')
        .insert({
          workspace_id: workspace.id,
          name: `${type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)} - ${new Date().toLocaleDateString()}`,
          type,
          content: data?.content || data?.generatedContent || '',
          status: 'draft',
          tags: [type],
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Asset generated', { id: toastId });
      await fetchAssets();
      return asset;
    } catch (err) {
      console.error('Generate error:', err);
      toast.error('Failed to generate asset', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  const updateAssetStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('assets')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
      return;
    }

    toast.success('Status updated');
    await fetchAssets();
  };

  const deleteAsset = async (id: string) => {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete asset');
      return;
    }

    toast.success('Asset deleted');
    await fetchAssets();
  };

  const getAssetsByType = (type: string) => assets.filter((a) => a.type === type);

  return {
    assets,
    loading,
    generating,
    generateAsset,
    updateAssetStatus,
    deleteAsset,
    getAssetsByType,
    refresh: fetchAssets,
  };
}
