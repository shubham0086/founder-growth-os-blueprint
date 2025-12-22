import { Button } from "@/components/ui/button";
import { 
  Download, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const weeklyMetrics = [
  { label: "Total Spend", value: "₹42,500", change: -8 },
  { label: "Total Clicks", value: "1,247", change: 12 },
  { label: "New Leads", value: "47", change: 23 },
  { label: "Avg CPL", value: "₹904", change: -15 },
  { label: "Bookings", value: "12", change: 5 },
  { label: "Won Deals", value: "4", change: 33 },
];

const channelPerformance = [
  { channel: "Google Ads", spend: "₹18,200", leads: 22, cpl: "₹827", cvr: "2.8%" },
  { channel: "Meta Ads", spend: "₹20,100", leads: 20, cpl: "₹1,005", cvr: "2.1%" },
  { channel: "Organic", spend: "₹0", leads: 5, cpl: "₹0", cvr: "4.2%" },
];

export default function Reports() {
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
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
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
                    December 16 - December 22, 2024
                  </p>
                </div>
                <div className="flex items-center gap-2 text-success">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">Positive Week</span>
                </div>
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
                      <span className={`flex items-center gap-1 text-sm font-medium ${
                        metric.change >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {metric.change >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
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
                    {channelPerformance.map((row) => (
                      <tr key={row.channel} className="border-b border-border/50">
                        <td className="py-4 text-foreground font-medium">{row.channel}</td>
                        <td className="py-4 text-right text-muted-foreground">{row.spend}</td>
                        <td className="py-4 text-right text-muted-foreground">{row.leads}</td>
                        <td className="py-4 text-right text-muted-foreground">{row.cpl}</td>
                        <td className="py-4 text-right text-muted-foreground">{row.cvr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-success/5 border-success/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-success flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  What Worked
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Video testimonials drove 34% higher engagement</p>
                <p>• "Free Assessment" CTA outperformed by 23%</p>
                <p>• Google Search CPL decreased by 15%</p>
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
                <p>• Meta CPL increased by 12% - review targeting</p>
                <p>• Weekend performance dipped - consider pausing</p>
                <p>• Mobile CVR 40% lower than desktop</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">Monthly Report</h3>
            <p className="text-sm text-muted-foreground mb-4">Generate a comprehensive monthly report with trends and insights.</p>
            <Button className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
