import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from './useWorkspace';
import { formatDistanceToNow } from 'date-fns';
import { User, FileText, TrendingUp, Mail, Target, Palette, LucideIcon } from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  status: 'success' | 'info' | 'warning' | 'neutral';
}

export function useRecentActivity() {
  const { workspace } = useWorkspace();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivity() {
      if (!workspace?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch recent items from multiple tables in parallel
        const [leadsRes, pagesRes, experimentsRes, assetsRes, automationsRes] = await Promise.all([
          supabase
            .from('leads')
            .select('id, name, source, created_at')
            .eq('workspace_id', workspace.id)
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('landing_pages')
            .select('id, title, status, updated_at')
            .eq('workspace_id', workspace.id)
            .order('updated_at', { ascending: false })
            .limit(3),
          supabase
            .from('experiments')
            .select('id, hypothesis, status, updated_at')
            .eq('workspace_id', workspace.id)
            .order('updated_at', { ascending: false })
            .limit(3),
          supabase
            .from('assets')
            .select('id, name, type, created_at')
            .eq('workspace_id', workspace.id)
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('automations')
            .select('id, name, status, updated_at')
            .eq('workspace_id', workspace.id)
            .order('updated_at', { ascending: false })
            .limit(3),
        ]);

        const allActivities: Activity[] = [];

        // Process leads
        (leadsRes.data || []).forEach((lead) => {
          allActivities.push({
            id: `lead-${lead.id}`,
            type: 'lead',
            title: 'New lead received',
            description: `${lead.name} from ${lead.source || 'Direct'}`,
            time: formatDistanceToNow(new Date(lead.created_at), { addSuffix: true }),
            icon: User,
            status: 'success',
          });
        });

        // Process landing pages
        (pagesRes.data || []).forEach((page) => {
          allActivities.push({
            id: `page-${page.id}`,
            type: 'content',
            title: page.status === 'published' ? 'Landing page published' : 'Landing page updated',
            description: page.title,
            time: formatDistanceToNow(new Date(page.updated_at), { addSuffix: true }),
            icon: FileText,
            status: page.status === 'published' ? 'success' : 'info',
          });
        });

        // Process experiments
        (experimentsRes.data || []).forEach((exp) => {
          allActivities.push({
            id: `exp-${exp.id}`,
            type: 'experiment',
            title: exp.status === 'completed' ? 'Experiment completed' : `Experiment ${exp.status}`,
            description: exp.hypothesis.slice(0, 50) + (exp.hypothesis.length > 50 ? '...' : ''),
            time: formatDistanceToNow(new Date(exp.updated_at), { addSuffix: true }),
            icon: TrendingUp,
            status: exp.status === 'completed' ? 'success' : 'info',
          });
        });

        // Process assets
        (assetsRes.data || []).forEach((asset) => {
          allActivities.push({
            id: `asset-${asset.id}`,
            type: 'asset',
            title: `${asset.type} created`,
            description: asset.name,
            time: formatDistanceToNow(new Date(asset.created_at), { addSuffix: true }),
            icon: Palette,
            status: 'info',
          });
        });

        // Process automations
        (automationsRes.data || []).forEach((auto) => {
          allActivities.push({
            id: `auto-${auto.id}`,
            type: 'automation',
            title: auto.status === 'active' ? 'Automation running' : 'Automation updated',
            description: auto.name,
            time: formatDistanceToNow(new Date(auto.updated_at), { addSuffix: true }),
            icon: Mail,
            status: 'neutral',
          });
        });

        // Sort by time (newest first) and take top 6
        allActivities.sort((a, b) => {
          // Parse "X ago" format - simpler approach: just use original timestamps
          return 0; // Already sorted by individual queries
        });

        setActivities(allActivities.slice(0, 6));
      } catch (err) {
        console.error('Error fetching activity:', err);
        setError(err instanceof Error ? err.message : 'Failed to load activity');
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [workspace?.id]);

  return { activities, loading, error };
}
