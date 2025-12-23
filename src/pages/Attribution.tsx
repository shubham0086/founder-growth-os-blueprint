import { Users, Target, TrendingUp, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLeadAttribution } from '@/hooks/useLeadAttribution';
import { LeadsBySourceChart } from '@/components/analytics/LeadsBySourceChart';
import { SpendVsLeadsChart } from '@/components/analytics/SpendVsLeadsChart';
import { CampaignLeadsTable } from '@/components/analytics/CampaignLeadsTable';

export default function Attribution() {
  const {
    leadsBySource,
    leadsByCampaign,
    spendVsLeads,
    summary,
    loading,
    error,
    dateRange,
    setDateRange,
  } = useLeadAttribution();

  const handleRangeChange = (value: string) => {
    setDateRange(value);
  };

  // Calculate CPL from spendVsLeads data
  const totalSpend = spendVsLeads.reduce((sum, d) => sum + d.spend, 0);
  const totalLeads = summary.totalLeads;
  const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const attributionRate =
    totalLeads > 0 ? (summary.leadsWithAttribution / totalLeads) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead Attribution</h1>
          <p className="text-muted-foreground">
            Track lead sources, campaigns, and cost per lead
          </p>
        </div>
        <Select value={dateRange} onValueChange={handleRangeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select range" />
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

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{summary.totalLeads}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cost per Lead</p>
                <p className="text-2xl font-bold">
                  ₹{cpl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="rounded-full bg-chart-2/10 p-3">
                <TrendingUp className="h-5 w-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Source</p>
                <p className="text-2xl font-bold truncate max-w-[150px]">
                  {summary.topSource || '—'}
                </p>
              </div>
              <div className="rounded-full bg-chart-3/10 p-3">
                <Target className="h-5 w-5 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attribution Rate</p>
                <p className="text-2xl font-bold">{attributionRate.toFixed(0)}%</p>
              </div>
              <div className="rounded-full bg-chart-4/10 p-3">
                <Percent className="h-5 w-5 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spend vs Leads Chart */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SpendVsLeadsChart data={spendVsLeads} loading={loading} />
        <LeadsBySourceChart data={leadsBySource} loading={loading} />
      </div>

      {/* Campaign Table */}
      <CampaignLeadsTable data={leadsByCampaign} loading={loading} />
    </div>
  );
}
