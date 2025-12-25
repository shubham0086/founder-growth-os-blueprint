import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

interface Competitor {
  id: string;
  name: string;
  url: string | null;
  notes: string | null;
  status: 'pending' | 'analyzing' | 'analyzed';
  pricing?: string;
  offer?: string;
}

interface ResearchFinding {
  id: string;
  type: string;
  content: any;
  sources: string[] | null;
  created_at: string;
}

export function useResearch() {
  const { workspace } = useWorkspace();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [angles, setAngles] = useState<string[]>([]);
  const [objections, setObjections] = useState<{ objection: string; frequency: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  const fetchCompetitors = useCallback(async () => {
    if (!workspace?.id) return;

    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching competitors:', error);
      return;
    }

    // Parse notes to extract pricing/offer if stored there
    const parsed = (data || []).map((c) => {
      let parsed: any = {};
      try {
        if (c.notes) parsed = JSON.parse(c.notes);
      } catch {}
      return {
        ...c,
        status: parsed.status || 'pending',
        pricing: parsed.pricing,
        offer: parsed.offer,
      } as Competitor;
    });

    setCompetitors(parsed);
  }, [workspace?.id]);

  const fetchFindings = useCallback(async () => {
    if (!workspace?.id) return;

    const { data, error } = await supabase
      .from('research_findings')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching findings:', error);
      return;
    }

    const anglesData = data?.filter((f) => f.type === 'angles') || [];
    const objectionsData = data?.filter((f) => f.type === 'objections') || [];

    if (anglesData.length > 0) {
      const latestAngles = anglesData[0].content;
      setAngles(Array.isArray(latestAngles) ? (latestAngles as string[]) : []);
    }

    if (objectionsData.length > 0) {
      const latestObjections = objectionsData[0].content;
      setObjections(Array.isArray(latestObjections) ? (latestObjections as { objection: string; frequency: number }[]) : []);
    }
  }, [workspace?.id]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([fetchCompetitors(), fetchFindings()]);
      setLoading(false);
    }
    loadData();
  }, [fetchCompetitors, fetchFindings]);

  const addCompetitor = async (url: string) => {
    if (!url) {
      toast.error('Please enter a competitor URL');
      return;
    }
    
    if (!workspace?.id) {
      toast.error('No workspace selected. Please log in or create a workspace.');
      return;
    }

    // Extract domain name
    let domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const name = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);

    const { data, error } = await supabase
      .from('competitors')
      .insert({
        workspace_id: workspace.id,
        name,
        url: domain,
        notes: JSON.stringify({ status: 'pending' }),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding competitor:', error);
      toast.error('Failed to add competitor: ' + error.message);
      return;
    }

    toast.success(`Added ${name} as competitor`);
    await fetchCompetitors();
    return data;
  };

  const analyzeCompetitor = async (competitorId: string, url: string) => {
    if (!workspace?.id) return;

    setAnalyzing(competitorId);

    try {
      // Update status to analyzing
      await supabase
        .from('competitors')
        .update({ notes: JSON.stringify({ status: 'analyzing' }) })
        .eq('id', competitorId);

      await fetchCompetitors();

      // Scrape the competitor
      const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('scrape-competitor', {
        body: { url, extractType: 'pricing_offer' },
      });

      if (scrapeError) throw scrapeError;

      // Update with results
      await supabase
        .from('competitors')
        .update({
          notes: JSON.stringify({
            status: 'analyzed',
            pricing: scrapeData?.pricing || 'Not found',
            offer: scrapeData?.mainOffer || scrapeData?.content?.slice(0, 100) || 'Not found',
          }),
        })
        .eq('id', competitorId);

      toast.success('Competitor analyzed');
    } catch (err) {
      console.error('Analyze error:', err);
      await supabase
        .from('competitors')
        .update({ notes: JSON.stringify({ status: 'pending' }) })
        .eq('id', competitorId);
      toast.error('Failed to analyze competitor');
    } finally {
      setAnalyzing(null);
      await fetchCompetitors();
    }
  };

  const runFullScan = async () => {
    if (!workspace?.id) return;

    const toastId = toast.loading('Running full research scan...');

    try {
      // Get angles from Perplexity
      const { data: anglesData } = await supabase.functions.invoke('ai-research', {
        body: {
          query: `What are the most effective marketing angles for ${workspace.industry || 'fitness'} businesses targeting busy professionals?`,
          type: 'angles',
        },
      });

      if (anglesData?.content) {
        const anglesList = anglesData.content.split('\n').filter((a: string) => a.trim().length > 10).slice(0, 5);
        await supabase.from('research_findings').insert({
          workspace_id: workspace.id,
          type: 'angles',
          content: anglesList,
          sources: anglesData.citations || [],
        });
      }

      // Get objections
      const { data: objectionsData } = await supabase.functions.invoke('ai-research', {
        body: {
          query: `What are the most common objections people have when buying ${workspace.industry || 'fitness'} services?`,
          type: 'objections',
        },
      });

      if (objectionsData?.content) {
        const lines = objectionsData.content.split('\n').filter((o: string) => o.trim().length > 5).slice(0, 5);
        const objectionsList = lines.map((o: string, i: number) => ({
          objection: o.replace(/^[\d\.\-\*]+\s*/, ''),
          frequency: Math.max(10, 50 - i * 10),
        }));
        await supabase.from('research_findings').insert({
          workspace_id: workspace.id,
          type: 'objections',
          content: objectionsList,
          sources: objectionsData.citations || [],
        });
      }

      await fetchFindings();
      toast.success('Research scan complete', { id: toastId });
    } catch (err) {
      console.error('Full scan error:', err);
      toast.error('Research scan failed', { id: toastId });
    }
  };

  return {
    competitors,
    angles,
    objections,
    loading,
    analyzing,
    addCompetitor,
    analyzeCompetitor,
    runFullScan,
    refresh: () => Promise.all([fetchCompetitors(), fetchFindings()]),
  };
}
