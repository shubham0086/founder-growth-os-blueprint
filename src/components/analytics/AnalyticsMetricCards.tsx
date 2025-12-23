import { MetricCard } from "@/components/ui/metric-card";
import { IndianRupee, MousePointerClick, Eye, Target } from "lucide-react";
import { AdsMetricsSummary } from "@/hooks/useAdsMetrics";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsMetricCardsProps {
  summary: AdsMetricsSummary | null;
  loading?: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toFixed(0)}`;
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

function MetricSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <div className="flex items-end justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export function AnalyticsMetricCards({ summary, loading }: AnalyticsMetricCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Spend"
        value={summary ? formatCurrency(summary.totalSpend) : "₹0"}
        change={summary?.spendChange}
        changeLabel="vs previous period"
        icon={<IndianRupee className="h-5 w-5" />}
      />
      <MetricCard
        title="Total Clicks"
        value={summary ? formatNumber(summary.totalClicks) : "0"}
        change={summary?.clicksChange}
        changeLabel="vs previous period"
        icon={<MousePointerClick className="h-5 w-5" />}
      />
      <MetricCard
        title="Impressions"
        value={summary ? formatNumber(summary.totalImpressions) : "0"}
        change={summary?.impressionsChange}
        changeLabel="vs previous period"
        icon={<Eye className="h-5 w-5" />}
      />
      <MetricCard
        title="Conversions"
        value={summary ? formatNumber(summary.totalConversions) : "0"}
        change={summary?.conversionsChange}
        changeLabel="vs previous period"
        icon={<Target className="h-5 w-5" />}
      />
    </div>
  );
}
