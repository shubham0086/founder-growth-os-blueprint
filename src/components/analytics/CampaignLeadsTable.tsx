import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadsByCampaign } from '@/hooks/useLeadAttribution';

interface CampaignLeadsTableProps {
  data: LeadsByCampaign[];
  loading?: boolean;
}

export function CampaignLeadsTable({ data, loading }: CampaignLeadsTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Leads by UTM Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No campaign attribution data available
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Leads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 10).map((campaign, index) => (
                <TableRow key={`${campaign.campaign}-${index}`}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {campaign.campaign}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {campaign.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {campaign.count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
