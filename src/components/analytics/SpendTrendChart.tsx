import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { DailyMetric } from "@/hooks/useAdsMetrics";
import { format, parseISO } from "date-fns";

interface SpendTrendChartProps {
  data: DailyMetric[];
  loading?: boolean;
}

const chartConfig = {
  spend: {
    label: "Spend",
    color: "hsl(var(--primary))",
  },
};

export function SpendTrendChart({ data, loading }: SpendTrendChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), "MMM d"),
  }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Spend Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Spend Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="dateLabel"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              labelFormatter={(value) => value}
            />
            <Area
              type="monotone"
              dataKey="spend"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#spendGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
