import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from './useWorkspace';
import { startOfWeek, endOfWeek, format } from 'date-fns';

interface WeeklyBriefData {
  weekRange: string;
  highlights: string[];
  warnings: string[];
  actions: string[];
}

export function useWeeklyBrief() {
  const { workspace } = useWorkspace();
  const [brief, setBrief] = useState<WeeklyBriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBriefData() {
      if (!workspace?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const weekRange = `Week of ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

        // Fetch this week's metrics
        const { data: metrics, error: metricsError } = await supabase
          .from('metrics_daily')
          .select('spend, clicks, leads, bookings, cpl')
          .eq('workspace_id', workspace.id)
          .gte('date', format(weekStart, 'yyyy-MM-dd'))
          .lte('date', format(weekEnd, 'yyyy-MM-dd'));

        if (metricsError) throw metricsError;

        // Fetch recent leads count
        const { count: leadsCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .gte('created_at', weekStart.toISOString());

        // Fetch running experiments
        const { data: experiments } = await supabase
          .from('experiments')
          .select('hypothesis, status')
          .eq('workspace_id', workspace.id)
          .eq('status', 'running')
          .limit(3);

        // Aggregate metrics
        const totals = (metrics || []).reduce(
          (acc, day) => ({
            spend: acc.spend + (Number(day.spend) || 0),
            clicks: acc.clicks + (day.clicks || 0),
            leads: acc.leads + (day.leads || 0),
            bookings: acc.bookings + (day.bookings || 0),
          }),
          { spend: 0, clicks: 0, leads: 0, bookings: 0 }
        );

        // Generate insights based on data
        const highlights: string[] = [];
        const warnings: string[] = [];
        const actions: string[] = [];

        if (leadsCount && leadsCount > 0) {
          highlights.push(`${leadsCount} new leads captured this week.`);
        }
        if (totals.bookings > 0) {
          highlights.push(`${totals.bookings} bookings confirmed.`);
        }
        if (totals.clicks > 0 && totals.leads > 0) {
          const cvr = ((totals.leads / totals.clicks) * 100).toFixed(1);
          if (parseFloat(cvr) > 5) {
            highlights.push(`Strong conversion rate at ${cvr}%.`);
          }
        }

        if (totals.spend > 0 && totals.leads === 0) {
          warnings.push('Spending on ads but no leads yet. Review targeting.');
        }
        if (totals.clicks > 100 && totals.leads < 3) {
          warnings.push('Low conversion rate. Consider testing new landing pages.');
        }
        if (!metrics || metrics.length === 0) {
          warnings.push('No metrics data this week. Add daily metrics to track performance.');
        }

        // Generate actions
        if (experiments && experiments.length > 0) {
          actions.push(`Monitor ${experiments.length} running experiment(s).`);
        } else {
          actions.push('Start an A/B test to optimize conversions.');
        }
        if (totals.leads > 5) {
          actions.push('Follow up with new leads within 24 hours.');
        }
        actions.push('Review ad performance and pause underperformers.');

        setBrief({
          weekRange,
          highlights: highlights.length > 0 ? highlights : ['Add data to see insights.'],
          warnings,
          actions: actions.slice(0, 3),
        });
      } catch (err) {
        console.error('Error fetching weekly brief:', err);
        setError(err instanceof Error ? err.message : 'Failed to load brief');
      } finally {
        setLoading(false);
      }
    }

    fetchBriefData();
  }, [workspace?.id]);

  return { brief, loading, error };
}
