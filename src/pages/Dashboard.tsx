import { MetricCard } from "@/components/ui/metric-card";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { WeeklyBrief } from "@/components/dashboard/WeeklyBrief";
import { LeadsPipeline } from "@/components/dashboard/LeadsPipeline";
import { 
  IndianRupee, 
  MousePointerClick, 
  Users, 
  Calendar,
  TrendingUp 
} from "lucide-react";

export default function Dashboard() {
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
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Ad Spend (This Week)"
          value="₹42,500"
          change={-8}
          changeLabel="vs last week"
          icon={<IndianRupee className="h-5 w-5" />}
        />
        <MetricCard
          title="Total Clicks"
          value="1,247"
          change={12}
          changeLabel="vs last week"
          icon={<MousePointerClick className="h-5 w-5" />}
        />
        <MetricCard
          title="New Leads"
          value="47"
          change={23}
          changeLabel="vs last week"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Bookings"
          value="12"
          change={5}
          changeLabel="vs last week"
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="col-span-2 space-y-6">
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
