import { MetricCard } from "@/components/ui/metric-card";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { WeeklyBrief } from "@/components/dashboard/WeeklyBrief";
import { LeadsPipeline } from "@/components/dashboard/LeadsPipeline";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  IndianRupee, 
  MousePointerClick, 
  Users, 
  Calendar,
} from "lucide-react";

function MetricSkeleton() {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <div className="flex items-end justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-3 w-16 mt-2" />
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
}

function formatNumber(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

export default function Dashboard() {
  const { metrics, loading, error } = useDashboardMetrics();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Good morning! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your growth loop today.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : error ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Failed to load metrics. Please try again.
          </div>
        ) : (
          <>
            <MetricCard
              title="Ad Spend (This Week)"
              value={metrics ? formatCurrency(metrics.adSpend) : "₹0"}
              change={metrics?.adSpendChange}
              changeLabel="vs last week"
              icon={<IndianRupee className="h-5 w-5" />}
            />
            <MetricCard
              title="Total Clicks"
              value={metrics ? formatNumber(metrics.totalClicks) : "0"}
              change={metrics?.clicksChange}
              changeLabel="vs last week"
              icon={<MousePointerClick className="h-5 w-5" />}
            />
            <MetricCard
              title="New Leads"
              value={metrics ? formatNumber(metrics.newLeads) : "0"}
              change={metrics?.leadsChange}
              changeLabel="vs last week"
              icon={<Users className="h-5 w-5" />}
            />
            <MetricCard
              title="Bookings"
              value={metrics ? formatNumber(metrics.bookings) : "0"}
              change={metrics?.bookingsChange}
              changeLabel="vs last week"
              icon={<Calendar className="h-5 w-5" />}
            />
          </>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <WeeklyBrief />
          <QuickActions />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <LeadsPipeline />
        </div>
      </div>

      {/* Activity Section */}
      <RecentActivity />
    </div>
  );
}
