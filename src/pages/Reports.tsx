import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Upload,
  Plus,
  Loader2,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useReportData } from "@/hooks/useReportData";
import { ImportMetricsModal } from "@/components/data-import/ImportMetricsModal";
import { LogMetricsModal } from "@/components/data-import/LogMetricsModal";
import { exportToCsv } from "@/lib/exportCsv";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/safeClient";
import { useWorkspace } from "@/hooks/useWorkspace";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export default function Reports() {
  const { metrics, loading: metricsLoading } = useDashboardMetrics();
  const { 
    channelData, 
    monthlyChannelData,
    loading: channelLoading, 
    insights,
    monthlyInsights,
    generatingInsights,
    generateMonthlyReport 
  } = useReportData();
  const { workspace } = useWorkspace();
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);

  const loading = metricsLoading || channelLoading;

  const weeklyMetrics = [
    { label: "Total Spend", value: metrics ? `₹${metrics.adSpend.toLocaleString()}` : "₹0", change: metrics?.adSpendChange || 0 },
    { label: "Total Clicks", value: metrics?.totalClicks.toLocaleString() || "0", change: metrics?.clicksChange || 0 },
    { label: "New Leads", value: metrics?.newLeads.toString() || "0", change: metrics?.leadsChange || 0 },
    { label: "Avg CPL", value: metrics && metrics.newLeads > 0 ? `₹${Math.round(metrics.adSpend / metrics.newLeads)}` : "₹0", change: 0 },
    { label: "Bookings", value: metrics?.bookings.toString() || "0", change: metrics?.bookingsChange || 0 },
    { label: "Won Deals", value: "0", change: 0 },
  ];

  const handleExport = async () => {
    if (!workspace?.id) {
      toast.error("No workspace selected");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('metrics_daily')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('date', { ascending: false })
        .limit(90);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error("No metrics data to export");
        return;
      }

      const exportData = data.map(row => ({
        date: row.date,
        spend: row.spend || 0,
        clicks: row.clicks || 0,
        leads: row.leads || 0,
        bookings: row.bookings || 0,
        cpl: row.cpl || 0,
        revenue: row.revenue || '',
        notes: row.notes || '',
      }));

      exportToCsv(`metrics-export-${new Date().toISOString().split('T')[0]}.csv`, exportData);
      toast.success("Metrics exported successfully");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export metrics");
    }
  };

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMMM d');
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'd, yyyy');
  const monthStart = format(startOfMonth(new Date()), 'MMMM d');
  const monthEnd = format(endOfMonth(new Date()), 'd, yyyy');

  const formatCurrency = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${Math.round(value).toLocaleString()}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Reports
          </h1>
          <p className="text-muted-foreground">
            Weekly and monthly performance insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setImportModalOpen(true)}>
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button className="gap-2 gradient-primary text-primary-foreground" onClick={() => setLogModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Log Today
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="weekly" className="gap-2 data-[state=active]:bg-background">
            <Calendar className="h-4 w-4" />
            Weekly Report
          </TabsTrigger>
          <TabsTrigger value="monthly" className="gap-2 data-[state=active]:bg-background">
            <BarChart3 className="h-4 w-4" />
            Monthly Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-6">
          {/* Report Header */}
          <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    Weekly Growth Report
                  </h2>
                  <p className="text-muted-foreground">
                    {weekStart} - {weekEnd}
                  </p>
                </div>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <div className="flex items-center gap-2 text-success">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-semibold">
                      {metrics && metrics.leadsChange >= 0 ? 'Positive Week' : 'Needs Attention'}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Key Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              {weeklyMetrics.map((metric) => (
                <Card key={metric.label} className="bg-card/50 border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{metric.label}</span>
                      {metric.change !== 0 && (
                        <span className={`flex items-center gap-1 text-sm font-medium ${
                          metric.change >= 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {metric.change >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {Math.abs(Math.round(metric.change))}%
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : metric.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Channel Performance */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Channel Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {channelLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : channelData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No channel data available yet. Connect Google or Meta Ads to see performance.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-sm font-medium text-muted-foreground py-3">Channel</th>
                        <th className="text-right text-sm font-medium text-muted-foreground py-3">Spend</th>
                        <th className="text-right text-sm font-medium text-muted-foreground py-3">Leads</th>
                        <th className="text-right text-sm font-medium text-muted-foreground py-3">CPL</th>
                        <th className="text-right text-sm font-medium text-muted-foreground py-3">CVR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channelData.map((row) => (
                        <tr key={row.channel} className="border-b border-border/50">
                          <td className="py-4 text-foreground font-medium">{row.channel}</td>
                          <td className="py-4 text-right text-muted-foreground">{formatCurrency(row.spend)}</td>
                          <td className="py-4 text-right text-muted-foreground">{row.leads}</td>
                          <td className="py-4 text-right text-muted-foreground">{row.cpl > 0 ? formatCurrency(row.cpl) : '₹0'}</td>
                          <td className="py-4 text-right text-muted-foreground">{row.cvr.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insights */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-success/5 border-success/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-success flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  What Worked
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {channelLoading ? (
                  <>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </>
                ) : insights?.whatWorked.map((insight, i) => (
                  <p key={i}>• {insight}</p>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-warning/5 border-warning/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-warning flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {channelLoading ? (
                  <>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </>
                ) : insights?.areasToImprove.map((insight, i) => (
                  <p key={i}>• {insight}</p>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          {/* Monthly Report Header */}
          <Card className="bg-gradient-to-br from-card via-card to-violet-500/5 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    Monthly Growth Report
                  </h2>
                  <p className="text-muted-foreground">
                    {monthStart} - {monthEnd}
                  </p>
                </div>
                <Button 
                  className="gap-2"
                  onClick={generateMonthlyReport}
                  disabled={generatingInsights}
                >
                  {generatingInsights ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {generatingInsights ? 'Generating...' : 'Generate AI Report'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Channel Summary */}
          {monthlyChannelData.length > 0 && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Monthly Channel Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-sm font-medium text-muted-foreground py-3">Channel</th>
                        <th className="text-right text-sm font-medium text-muted-foreground py-3">Spend</th>
                        <th className="text-right text-sm font-medium text-muted-foreground py-3">Leads</th>
                        <th className="text-right text-sm font-medium text-muted-foreground py-3">CPL</th>
                        <th className="text-right text-sm font-medium text-muted-foreground py-3">CVR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyChannelData.map((row) => (
                        <tr key={row.channel} className="border-b border-border/50">
                          <td className="py-4 text-foreground font-medium">{row.channel}</td>
                          <td className="py-4 text-right text-muted-foreground">{formatCurrency(row.spend)}</td>
                          <td className="py-4 text-right text-muted-foreground">{row.leads}</td>
                          <td className="py-4 text-right text-muted-foreground">{row.cpl > 0 ? formatCurrency(row.cpl) : '₹0'}</td>
                          <td className="py-4 text-right text-muted-foreground">{row.cvr.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Generated Insights */}
          {monthlyInsights ? (
            <Card className="bg-gradient-to-br from-primary/5 to-violet-500/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Generated Monthly Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {monthlyInsights}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-foreground mb-2">Monthly Report</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                Generate a comprehensive monthly report with AI-powered insights and recommendations based on your performance data.
              </p>
              <Button 
                className="gap-2"
                onClick={generateMonthlyReport}
                disabled={generatingInsights}
              >
                {generatingInsights ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4" />
                )}
                Generate Report
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ImportMetricsModal 
        open={importModalOpen} 
        onOpenChange={setImportModalOpen}
      />
      <LogMetricsModal 
        open={logModalOpen} 
        onOpenChange={setLogModalOpen}
      />
    </div>
  );
}
