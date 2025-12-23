import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TopCampaign } from "@/hooks/useAdsMetrics";
import { Skeleton } from "@/components/ui/skeleton";

interface TopCampaignsTableProps {
  campaigns: TopCampaign[];
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
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

export function TopCampaignsTable({ campaigns, loading }: TopCampaignsTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Top Campaigns by Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Top Campaigns by Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No campaign data available. Connect your ad accounts to see performance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Top Campaigns by Spend</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Network</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Conversions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={`${campaign.network}-${campaign.campaign_id}`}>
                <TableCell className="font-medium truncate max-w-[200px]">
                  {campaign.campaign_id}
                </TableCell>
                <TableCell>
                  <Badge variant={campaign.network === 'google' ? 'default' : 'secondary'}>
                    {campaign.network === 'google' ? 'Google' : 'Meta'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(campaign.spend)}</TableCell>
                <TableCell className="text-right">{formatNumber(campaign.clicks)}</TableCell>
                <TableCell className="text-right">{formatNumber(campaign.conversions)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
