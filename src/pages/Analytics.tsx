import { useAdsMetrics } from "@/hooks/useAdsMetrics";
import { AnalyticsMetricCards } from "@/components/analytics/AnalyticsMetricCards";
import { SpendTrendChart } from "@/components/analytics/SpendTrendChart";
import { ClicksConversionsChart } from "@/components/analytics/ClicksConversionsChart";
import { TopCampaignsTable } from "@/components/analytics/TopCampaignsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Percent, IndianRupee } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subDays } from "date-fns";
import { useState } from "react";

export default function Analytics() {
  const { summary, dailyMetrics, topCampaigns, loading, error, dateRange, setDateRange } = useAdsMetrics();
  const [selectedRange, setSelectedRange] = useState("30");

  const handleRangeChange = (value: string) => {
    setSelectedRange(value);
    const days = parseInt(value);
    setDateRange({
      start: subDays(new Date(), days),
      end: new Date(),
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Ads Analytics
          </h1>
          <p className="text-muted-foreground">
            Unified performance metrics from Google Ads and Meta Ads
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedRange} onValueChange={handleRangeChange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Metric Cards */}
      <AnalyticsMetricCards summary={summary} loading={loading} />

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CTR</p>
                <p className="text-2xl font-bold">
                  {summary ? `${summary.ctr.toFixed(2)}%` : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. CPC</p>
                <p className="text-2xl font-bold">
                  {summary ? `₹${summary.cpc.toFixed(2)}` : '₹0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Percent className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conv. Rate</p>
                <p className="text-2xl font-bold">
                  {summary && summary.totalClicks > 0
                    ? `${((summary.totalConversions / summary.totalClicks) * 100).toFixed(2)}%`
                    : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendTrendChart data={dailyMetrics} loading={loading} />
        <ClicksConversionsChart data={dailyMetrics} loading={loading} />
      </div>

      {/* Top Campaigns */}
      <TopCampaignsTable campaigns={topCampaigns} loading={loading} />
    </div>
  );
}
