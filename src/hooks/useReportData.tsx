import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from './useWorkspace';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

export interface ChannelPerformance {
  channel: string;
  spend: number;
  leads: number;
  clicks: number;
  conversions: number;
  cpl: number;
  cvr: number;
}

export interface ReportInsights {
  whatWorked: string[];
  areasToImprove: string[];
}

export function useReportData() {
  const { workspace } = useWorkspace();
  const [channelData, setChannelData] = useState<ChannelPerformance[]>([]);
  const [monthlyChannelData, setMonthlyChannelData] = useState<ChannelPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [insights, setInsights] = useState<ReportInsights | null>(null);
  const [monthlyInsights, setMonthlyInsights] = useState<string | null>(null);

  const fetchChannelData = useCallback(async () => {
    if (!workspace?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      // Fetch weekly ads metrics
      const { data: weeklyAdsData, error: weeklyAdsError } = await supabase
        .from('ads_metrics_daily')
        .select('*')
        .eq('workspace_id', workspace.id)
        .gte('date', weekStart)
        .lte('date', weekEnd);

      if (weeklyAdsError) throw weeklyAdsError;

      // Fetch monthly ads metrics
      const { data: monthlyAdsData, error: monthlyAdsError } = await supabase
        .from('ads_metrics_daily')
        .select('*')
        .eq('workspace_id', workspace.id)
        .gte('date', monthStart)
        .lte('date', monthEnd);

      if (monthlyAdsError) throw monthlyAdsError;

      // Fetch weekly leads for organic
      const { data: weeklyLeads, error: weeklyLeadsError } = await supabase
        .from('leads')
        .select('source')
        .eq('workspace_id', workspace.id)
        .gte('created_at', weekStart)
        .lte('created_at', weekEnd);

      if (weeklyLeadsError) throw weeklyLeadsError;

      // Aggregate weekly data by network
      const weeklyByChannel: Record<string, ChannelPerformance> = {};
      
      (weeklyAdsData || []).forEach(row => {
        const channel = row.network === 'google' ? 'Google Ads' : 
                       row.network === 'meta' ? 'Meta Ads' : row.network || 'Other';
        
        if (!weeklyByChannel[channel]) {
          weeklyByChannel[channel] = {
            channel,
            spend: 0,
            leads: 0,
            clicks: 0,
            conversions: 0,
            cpl: 0,
            cvr: 0,
          };
        }
        
        weeklyByChannel[channel].spend += row.spend || 0;
        weeklyByChannel[channel].clicks += row.clicks || 0;
        weeklyByChannel[channel].conversions += row.conversions || 0;
      });

      // Calculate CPL and CVR
      Object.values(weeklyByChannel).forEach(ch => {
        ch.leads = ch.conversions; // Using conversions as leads for ads
        ch.cpl = ch.leads > 0 ? ch.spend / ch.leads : 0;
        ch.cvr = ch.clicks > 0 ? (ch.leads / ch.clicks) * 100 : 0;
      });

      // Add organic leads
      const organicLeads = (weeklyLeads || []).filter(l => 
        l.source?.toLowerCase().includes('organic') || 
        l.source?.toLowerCase().includes('direct') ||
        !l.source
      ).length;

      if (organicLeads > 0 || Object.keys(weeklyByChannel).length === 0) {
        weeklyByChannel['Organic'] = {
          channel: 'Organic',
          spend: 0,
          leads: organicLeads,
          clicks: 0,
          conversions: organicLeads,
          cpl: 0,
          cvr: 0,
        };
      }

      setChannelData(Object.values(weeklyByChannel).sort((a, b) => b.spend - a.spend));

      // Aggregate monthly data
      const monthlyByChannel: Record<string, ChannelPerformance> = {};
      
      (monthlyAdsData || []).forEach(row => {
        const channel = row.network === 'google' ? 'Google Ads' : 
                       row.network === 'meta' ? 'Meta Ads' : row.network || 'Other';
        
        if (!monthlyByChannel[channel]) {
          monthlyByChannel[channel] = {
            channel,
            spend: 0,
            leads: 0,
            clicks: 0,
            conversions: 0,
            cpl: 0,
            cvr: 0,
          };
        }
        
        monthlyByChannel[channel].spend += row.spend || 0;
        monthlyByChannel[channel].clicks += row.clicks || 0;
        monthlyByChannel[channel].conversions += row.conversions || 0;
      });

      Object.values(monthlyByChannel).forEach(ch => {
        ch.leads = ch.conversions;
        ch.cpl = ch.leads > 0 ? ch.spend / ch.leads : 0;
        ch.cvr = ch.clicks > 0 ? (ch.leads / ch.clicks) * 100 : 0;
      });

      setMonthlyChannelData(Object.values(monthlyByChannel).sort((a, b) => b.spend - a.spend));

      // Generate basic insights from data
      generateBasicInsights(Object.values(weeklyByChannel));

    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  const generateBasicInsights = (channels: ChannelPerformance[]) => {
    const whatWorked: string[] = [];
    const areasToImprove: string[] = [];

    channels.forEach(ch => {
      if (ch.channel !== 'Organic') {
        if (ch.cvr >= 3) {
          whatWorked.push(`${ch.channel} has strong ${ch.cvr.toFixed(1)}% conversion rate`);
        }
        if (ch.cpl > 0 && ch.cpl < 500) {
          whatWorked.push(`${ch.channel} CPL at ₹${Math.round(ch.cpl)} is cost-effective`);
        }
        if (ch.cvr < 2 && ch.clicks > 0) {
          areasToImprove.push(`${ch.channel} CVR at ${ch.cvr.toFixed(1)}% needs optimization`);
        }
        if (ch.cpl > 1000) {
          areasToImprove.push(`${ch.channel} CPL at ₹${Math.round(ch.cpl)} is high - review targeting`);
        }
      }
    });

    const organicChannel = channels.find(c => c.channel === 'Organic');
    if (organicChannel && organicChannel.leads > 0) {
      whatWorked.push(`${organicChannel.leads} organic leads at ₹0 CPL`);
    }

    // Add generic insights if none found
    if (whatWorked.length === 0) {
      whatWorked.push('Data collection in progress - check back soon');
    }
    if (areasToImprove.length === 0) {
      areasToImprove.push('Continue monitoring metrics for trends');
    }

    setInsights({ whatWorked: whatWorked.slice(0, 3), areasToImprove: areasToImprove.slice(0, 3) });
  };

  const generateMonthlyReport = async () => {
    if (!workspace?.id) return;

    setGeneratingInsights(true);
    try {
      const totalSpend = monthlyChannelData.reduce((sum, ch) => sum + ch.spend, 0);
      const totalLeads = monthlyChannelData.reduce((sum, ch) => sum + ch.leads, 0);
      const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          metrics: {
            totalSpend,
            totalLeads,
            totalBookings: 0,
            avgCpl,
            conversionRate: 0,
            channels: monthlyChannelData,
          },
          type: 'monthly_report',
        },
      });

      if (error) throw error;
      setMonthlyInsights(data.insights);
    } catch (err) {
      console.error('Error generating monthly report:', err);
    } finally {
      setGeneratingInsights(false);
    }
  };

  useEffect(() => {
    fetchChannelData();
  }, [fetchChannelData]);

  return {
    channelData,
    monthlyChannelData,
    loading,
    insights,
    monthlyInsights,
    generatingInsights,
    generateMonthlyReport,
    refetch: fetchChannelData,
  };
}
