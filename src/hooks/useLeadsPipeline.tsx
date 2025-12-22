import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from './useWorkspace';
import { formatDistanceToNow } from 'date-fns';

interface PipelineStage {
  name: string;
  count: number;
  color: string;
}

interface RecentLead {
  id: string;
  name: string;
  source: string | null;
  stage: string;
  time: string;
}

const stageConfig: Record<string, { color: string; order: number }> = {
  new: { color: 'bg-primary', order: 0 },
  contacted: { color: 'bg-blue-500', order: 1 },
  booked: { color: 'bg-violet-500', order: 2 },
  qualified: { color: 'bg-amber-500', order: 3 },
  won: { color: 'bg-success', order: 4 },
  lost: { color: 'bg-destructive', order: 5 },
};

export function useLeadsPipeline() {
  const { workspace } = useWorkspace();
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPipelineData() {
      if (!workspace?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all leads for the workspace
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('id, name, source, stage, created_at')
          .eq('workspace_id', workspace.id)
          .order('created_at', { ascending: false });

        if (leadsError) throw leadsError;

        // Aggregate by stage
        const stageCounts: Record<string, number> = {};
        (leads || []).forEach((lead) => {
          const stage = lead.stage.toLowerCase();
          stageCounts[stage] = (stageCounts[stage] || 0) + 1;
        });

        // Build ordered stages array
        const orderedStages = Object.entries(stageConfig)
          .sort(([, a], [, b]) => a.order - b.order)
          .map(([stageName, config]) => ({
            name: stageName.charAt(0).toUpperCase() + stageName.slice(1),
            count: stageCounts[stageName] || 0,
            color: config.color,
          }))
          .filter((stage) => stage.name !== 'Lost'); // Exclude lost from pipeline display

        setStages(orderedStages);

        // Get recent leads (top 5)
        const recent = (leads || []).slice(0, 5).map((lead) => ({
          id: lead.id,
          name: lead.name,
          source: lead.source,
          stage: lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1),
          time: formatDistanceToNow(new Date(lead.created_at), { addSuffix: true }),
        }));

        setRecentLeads(recent);
      } catch (err) {
        console.error('Error fetching pipeline data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pipeline');
      } finally {
        setLoading(false);
      }
    }

    fetchPipelineData();
  }, [workspace?.id]);

  return { stages, recentLeads, loading, error };
}
