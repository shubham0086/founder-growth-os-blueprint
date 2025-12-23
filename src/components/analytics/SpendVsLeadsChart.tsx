import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { SpendVsLeads } from '@/hooks/useLeadAttribution';

interface SpendVsLeadsChartProps {
  data: SpendVsLeads[];
  loading?: boolean;
}

const chartConfig = {
  spend: {
    label: 'Ad Spend',
    color: 'hsl(var(--primary))',
  },
  leads: {
    label: 'Leads',
    color: 'hsl(var(--chart-2))',
  },
};

export function SpendVsLeadsChart({ data, loading }: SpendVsLeadsChartProps) {
  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Spend vs Leads Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Spend vs Leads Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}`}
                className="text-muted-foreground"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      if (name === 'spend') {
                        return [`₹${Number(value).toLocaleString()}`, 'Ad Spend'];
                      }
                      return [value, 'Leads'];
                    }}
                  />
                }
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="spend"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                name="Ad Spend"
                opacity={0.8}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="leads"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 0, r: 4 }}
                name="Leads"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
