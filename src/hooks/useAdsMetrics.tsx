import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { subDays, format } from 'date-fns';

export interface DailyMetric {
  date: string;
  network: 'google' | 'meta' | 'all';
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
}

export interface AdsMetricsSummary {
  totalSpend: number;
  totalClicks: number;
  totalImpressions: number;
  totalConversions: number;
  spendChange: number;
  clicksChange: number;
  impressionsChange: number;
  conversionsChange: number;
  ctr: number;
  cpc: number;
}

export interface TopCampaign {
  campaign_id: string;
  network: string;
  spend: number;
  clicks: number;
  conversions: number;
}

interface UseAdsMetricsResult {
  summary: AdsMetricsSummary | null;
  dailyMetrics: DailyMetric[];
  topCampaigns: TopCampaign[];
  loading: boolean;
  error: string | null;
  dateRange: { start: Date; end: Date };
  setDateRange: (range: { start: Date; end: Date }) => void;
}

export function useAdsMetrics(): UseAdsMetricsResult {
  const { workspace } = useWorkspace();
  const [summary, setSummary] = useState<AdsMetricsSummary | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [topCampaigns, setTopCampaigns] = useState<TopCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });

  useEffect(() => {
    async function fetchMetrics() {
      if (!workspace?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const startDate = format(dateRange.start, 'yyyy-MM-dd');
        const endDate = format(dateRange.end, 'yyyy-MM-dd');
        
        // Calculate previous period for comparison
        const periodLength = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
        const prevStart = format(subDays(dateRange.start, periodLength), 'yyyy-MM-dd');
        const prevEnd = format(subDays(dateRange.start, 1), 'yyyy-MM-dd');

        // Fetch current period from unified view
        const { data: currentData, error: currentError } = await supabase
          .from('ads_metrics_daily')
          .select('*')
          .eq('workspace_id', workspace.id)
          .gte('date', startDate)
          .lte('date', endDate);

        if (currentError) throw currentError;

        // Fetch previous period for comparison
        const { data: prevData, error: prevError } = await supabase
          .from('ads_metrics_daily')
          .select('*')
          .eq('workspace_id', workspace.id)
          .gte('date', prevStart)
          .lte('date', prevEnd);

        if (prevError) throw prevError;

        // Aggregate current period
        const current = (currentData || []).reduce(
          (acc, row) => ({
            spend: acc.spend + (Number(row.spend) || 0),
            clicks: acc.clicks + (Number(row.clicks) || 0),
            impressions: acc.impressions + (Number(row.impressions) || 0),
            conversions: acc.conversions + (Number(row.conversions) || 0),
          }),
          { spend: 0, clicks: 0, impressions: 0, conversions: 0 }
        );

        // Aggregate previous period
        const previous = (prevData || []).reduce(
          (acc, row) => ({
            spend: acc.spend + (Number(row.spend) || 0),
            clicks: acc.clicks + (Number(row.clicks) || 0),
            impressions: acc.impressions + (Number(row.impressions) || 0),
            conversions: acc.conversions + (Number(row.conversions) || 0),
          }),
          { spend: 0, clicks: 0, impressions: 0, conversions: 0 }
        );

        // Calculate percent change
        const calcChange = (curr: number, prev: number) => {
          if (prev === 0) return curr > 0 ? 100 : 0;
          return Math.round(((curr - prev) / prev) * 100);
        };

        setSummary({
          totalSpend: current.spend,
          totalClicks: current.clicks,
          totalImpressions: current.impressions,
          totalConversions: current.conversions,
          spendChange: calcChange(current.spend, previous.spend),
          clicksChange: calcChange(current.clicks, previous.clicks),
          impressionsChange: calcChange(current.impressions, previous.impressions),
          conversionsChange: calcChange(current.conversions, previous.conversions),
          ctr: current.impressions > 0 ? (current.clicks / current.impressions) * 100 : 0,
          cpc: current.clicks > 0 ? current.spend / current.clicks : 0,
        });

        // Group daily data for trend charts
        const dailyMap = new Map<string, DailyMetric>();
        (currentData || []).forEach((row) => {
          const key = row.date as string;
          const existing = dailyMap.get(key) || {
            date: key,
            network: 'all' as const,
            spend: 0,
            clicks: 0,
            impressions: 0,
            conversions: 0,
          };
          existing.spend += Number(row.spend) || 0;
          existing.clicks += Number(row.clicks) || 0;
          existing.impressions += Number(row.impressions) || 0;
          existing.conversions += Number(row.conversions) || 0;
          dailyMap.set(key, existing);
        });

        const sortedDaily = Array.from(dailyMap.values()).sort((a, b) => 
          a.date.localeCompare(b.date)
        );
        setDailyMetrics(sortedDaily);

        // Get top campaigns by spend
        const campaignMap = new Map<string, TopCampaign>();
        (currentData || []).forEach((row) => {
          const key = `${row.network}-${row.campaign_id}`;
          const existing = campaignMap.get(key) || {
            campaign_id: row.campaign_id || 'unknown',
            network: row.network || 'unknown',
            spend: 0,
            clicks: 0,
            conversions: 0,
          };
          existing.spend += Number(row.spend) || 0;
          existing.clicks += Number(row.clicks) || 0;
          existing.conversions += Number(row.conversions) || 0;
          campaignMap.set(key, existing);
        });

        const sortedCampaigns = Array.from(campaignMap.values())
          .sort((a, b) => b.spend - a.spend)
          .slice(0, 10);
        setTopCampaigns(sortedCampaigns);

      } catch (err) {
        console.error('Error fetching ads metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [workspace?.id, dateRange.start, dateRange.end]);

  return { summary, dailyMetrics, topCampaigns, loading, error, dateRange, setDateRange };
}
