import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from './useWorkspace';
import { Json } from '@/integrations/supabase/types';

export interface LandingPage {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_url: string | null;
  sections: Json | null;
  created_at: string;
  updated_at: string;
}

export function useLandingPages() {
  const { workspace } = useWorkspace();
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    if (!workspace?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPages(data || []);
    } catch (err) {
      console.error('Error fetching landing pages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  const createPage = async (page: Partial<LandingPage>) => {
    if (!workspace?.id) return;

    const { error } = await supabase
      .from('landing_pages')
      .insert({
        workspace_id: workspace.id,
        title: page.title || 'New Landing Page',
        slug: page.slug || `page-${Date.now()}`,
        status: 'draft',
        sections: page.sections || [],
      });

    if (error) throw error;
    await fetchPages();
  };

  const updatePage = async (id: string, updates: Partial<LandingPage>) => {
    const { error } = await supabase
      .from('landing_pages')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchPages();
  };

  const deletePage = async (id: string) => {
    const { error } = await supabase
      .from('landing_pages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchPages();
  };

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return { 
    pages, 
    loading, 
    error, 
    refetch: fetchPages,
    createPage,
    updatePage,
    deletePage,
  };
}
