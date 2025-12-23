import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from './useWorkspace';
import { subDays, format, parseISO } from 'date-fns';

export interface LeadsBySource {
  source: string;
  count: number;
}

export interface LeadsByCampaign {
  campaign: string;
  source: string;
  count: number;
}

export interface SpendVsLeads {
  date: string;
  dateLabel: string;
  leads: number;
  spend: number;
}

export interface LeadAttributionSummary {
  totalLeads: number;
  leadsWithAttribution: number;
  topSource: string | null;
  topCampaign: string | null;
}

export function useLeadAttribution() {
  const { workspace } = useWorkspace();
  const [leadsBySource, setLeadsBySource] = useState<LeadsBySource[]>([]);
  const [leadsByCampaign, setLeadsByCampaign] = useState<LeadsByCampaign[]>([]);
  const [spendVsLeads, setSpendVsLeads] = useState<SpendVsLeads[]>([]);
  const [summary, setSummary] = useState<LeadAttributionSummary>({
    totalLeads: 0,
    leadsWithAttribution: 0,
    topSource: null,
    topCampaign: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30');

  const fetchData = useCallback(async () => {
    if (!workspace?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const days = parseInt(dateRange);
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

      // Fetch leads with UTM data
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, source, utm, created_at')
        .eq('workspace_id', workspace.id)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      if (leadsError) throw leadsError;

      // Fetch daily ad spend
      const { data: adsMetrics, error: adsError } = await supabase
        .from('ads_metrics_daily')
        .select('date, spend')
        .eq('workspace_id', workspace.id)
        .gte('date', startDate)
        .order('date', { ascending: true });

      if (adsError) throw adsError;

      // Process leads by source
      const sourceMap = new Map<string, number>();
      const campaignMap = new Map<string, { source: string; count: number }>();
      let leadsWithAttribution = 0;

      (leads || []).forEach((lead) => {
        const source = lead.source || 'Direct';
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);

        // Extract UTM campaign from JSON
        const utm = lead.utm as { utm_campaign?: string; utm_source?: string } | null;
        if (utm?.utm_campaign) {
          leadsWithAttribution++;
          const campaignKey = utm.utm_campaign;
          const existing = campaignMap.get(campaignKey);
          if (existing) {
            existing.count++;
          } else {
            campaignMap.set(campaignKey, {
              source: utm.utm_source || source,
              count: 1,
            });
          }
        } else if (lead.source && lead.source !== 'Direct') {
          leadsWithAttribution++;
        }
      });

      const sourceData: LeadsBySource[] = Array.from(sourceMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);

      const campaignData: LeadsByCampaign[] = Array.from(campaignMap.entries())
        .map(([campaign, data]) => ({
          campaign,
          source: data.source,
          count: data.count,
        }))
        .sort((a, b) => b.count - a.count);

      // Process spend vs leads by date
      const leadsPerDay = new Map<string, number>();
      (leads || []).forEach((lead) => {
        const date = format(parseISO(lead.created_at), 'yyyy-MM-dd');
        leadsPerDay.set(date, (leadsPerDay.get(date) || 0) + 1);
      });

      const spendPerDay = new Map<string, number>();
      (adsMetrics || []).forEach((metric) => {
        const existing = spendPerDay.get(metric.date) || 0;
        spendPerDay.set(metric.date, existing + (Number(metric.spend) || 0));
      });

      // Combine into spend vs leads data
      const allDates = new Set([...leadsPerDay.keys(), ...spendPerDay.keys()]);
      const spendVsLeadsData: SpendVsLeads[] = Array.from(allDates)
        .sort()
        .map((date) => ({
          date,
          dateLabel: format(parseISO(date), 'MMM d'),
          leads: leadsPerDay.get(date) || 0,
          spend: spendPerDay.get(date) || 0,
        }));

      setLeadsBySource(sourceData);
      setLeadsByCampaign(campaignData);
      setSpendVsLeads(spendVsLeadsData);
      setSummary({
        totalLeads: leads?.length || 0,
        leadsWithAttribution,
        topSource: sourceData[0]?.source || null,
        topCampaign: campaignData[0]?.campaign || null,
      });
    } catch (err) {
      console.error('Error fetching lead attribution:', err);
      setError(err instanceof Error ? err.message : 'Failed to load attribution data');
    } finally {
      setLoading(false);
    }
  }, [workspace?.id, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    leadsBySource,
    leadsByCampaign,
    spendVsLeads,
    summary,
    loading,
    error,
    dateRange,
    setDateRange,
    refetch: fetchData,
  };
}
