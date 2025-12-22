import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from './useWorkspace';
import { startOfWeek, endOfWeek, subWeeks, format } from 'date-fns';

interface DashboardMetrics {
  adSpend: number;
  adSpendChange: number;
  totalClicks: number;
  clicksChange: number;
  newLeads: number;
  leadsChange: number;
  bookings: number;
  bookingsChange: number;
}

export function useDashboardMetrics() {
  const { workspace } = useWorkspace();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      if (!workspace?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const now = new Date();
        const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
        const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

        // Fetch this week's metrics
        const { data: thisWeekData, error: thisWeekError } = await supabase
          .from('metrics_daily')
          .select('spend, clicks, leads, bookings')
          .eq('workspace_id', workspace.id)
          .gte('date', format(thisWeekStart, 'yyyy-MM-dd'))
          .lte('date', format(thisWeekEnd, 'yyyy-MM-dd'));

        if (thisWeekError) throw thisWeekError;

        // Fetch last week's metrics
        const { data: lastWeekData, error: lastWeekError } = await supabase
          .from('metrics_daily')
          .select('spend, clicks, leads, bookings')
          .eq('workspace_id', workspace.id)
          .gte('date', format(lastWeekStart, 'yyyy-MM-dd'))
          .lte('date', format(lastWeekEnd, 'yyyy-MM-dd'));

        if (lastWeekError) throw lastWeekError;

        // Fetch this week's new leads count
        const { count: thisWeekLeadsCount, error: leadsError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .gte('created_at', thisWeekStart.toISOString())
          .lte('created_at', thisWeekEnd.toISOString());

        if (leadsError) throw leadsError;

        // Fetch last week's leads count
        const { count: lastWeekLeadsCount, error: lastLeadsError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .gte('created_at', lastWeekStart.toISOString())
          .lte('created_at', lastWeekEnd.toISOString());

        if (lastLeadsError) throw lastLeadsError;

        // Aggregate this week
        const thisWeek = (thisWeekData || []).reduce(
          (acc, day) => ({
            spend: acc.spend + (Number(day.spend) || 0),
            clicks: acc.clicks + (day.clicks || 0),
            leads: acc.leads + (day.leads || 0),
            bookings: acc.bookings + (day.bookings || 0),
          }),
          { spend: 0, clicks: 0, leads: 0, bookings: 0 }
        );

        // Aggregate last week
        const lastWeek = (lastWeekData || []).reduce(
          (acc, day) => ({
            spend: acc.spend + (Number(day.spend) || 0),
            clicks: acc.clicks + (day.clicks || 0),
            leads: acc.leads + (day.leads || 0),
            bookings: acc.bookings + (day.bookings || 0),
          }),
          { spend: 0, clicks: 0, leads: 0, bookings: 0 }
        );

        // Calculate percent change
        const calcChange = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return Math.round(((current - previous) / previous) * 100);
        };

        // Use actual lead counts from leads table
        const actualLeadsThisWeek = thisWeekLeadsCount || 0;
        const actualLeadsLastWeek = lastWeekLeadsCount || 0;

        setMetrics({
          adSpend: thisWeek.spend,
          adSpendChange: calcChange(thisWeek.spend, lastWeek.spend),
          totalClicks: thisWeek.clicks,
          clicksChange: calcChange(thisWeek.clicks, lastWeek.clicks),
          newLeads: actualLeadsThisWeek,
          leadsChange: calcChange(actualLeadsThisWeek, actualLeadsLastWeek),
          bookings: thisWeek.bookings,
          bookingsChange: calcChange(thisWeek.bookings, lastWeek.bookings),
        });
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [workspace?.id]);

  return { metrics, loading, error };
}
