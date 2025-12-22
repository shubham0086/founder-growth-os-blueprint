import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Plus, 
  Megaphone,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MousePointerClick,
  Users,
  MoreHorizontal,
  Play,
  Pause
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const campaigns = [
  {
    id: 1,
    name: "Transform 90 Days - Main",
    platform: "Meta",
    status: "active" as const,
    budget: "₹15,000/week",
    spend: "₹12,450",
    clicks: 847,
    leads: 23,
    cpl: "₹541",
    cplChange: -12,
  },
  {
    id: 2,
    name: "Free Assessment - Search",
    platform: "Google",
    status: "active" as const,
    budget: "₹10,000/week",
    spend: "₹8,200",
    clicks: 312,
    leads: 18,
    cpl: "₹456",
    cplChange: -8,
  },
  {
    id: 3,
    name: "Retargeting - Website Visitors",
    platform: "Meta",
    status: "paused" as const,
    budget: "₹5,000/week",
    spend: "₹0",
    clicks: 0,
    leads: 0,
    cpl: "-",
    cplChange: 0,
  },
  {
    id: 4,
    name: "Brand Awareness - Local",
    platform: "Meta",
    status: "draft" as const,
    budget: "₹8,000/week",
    spend: "₹0",
    clicks: 0,
    leads: 0,
    cpl: "-",
    cplChange: 0,
  },
];

const platformColors = {
  Meta: "bg-blue-500/10 text-blue-400",
  Google: "bg-red-500/10 text-red-400",
};

export default function Campaigns() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Campaign Plans
          </h1>
          <p className="text-muted-foreground">
            Manage your ad campaigns across platforms.
          </p>
        </div>
        <Button className="gap-2 gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Spend</span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">₹20,650</p>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Clicks</span>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">1,159</p>
            <p className="text-xs text-success mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +15% vs last week
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Leads</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">41</p>
            <p className="text-xs text-success mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +23% vs last week
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg CPL</span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">₹504</p>
            <p className="text-xs text-success mt-1 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> -10% vs last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">All Campaigns</h2>
        {campaigns.map((campaign) => (
          <Card 
            key={campaign.id}
            className="bg-card/50 border-border/50 hover:border-border transition-all"
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-6">
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted shrink-0">
                  <Megaphone className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-foreground">{campaign.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${platformColors[campaign.platform as keyof typeof platformColors]}`}>
                      {campaign.platform}
                    </span>
                    <StatusBadge 
                      status={
                        campaign.status === 'active' ? 'success' : 
                        campaign.status === 'paused' ? 'warning' : 'neutral'
                      } 
                      label={campaign.status} 
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Budget: {campaign.budget}
                  </p>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-8 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{campaign.spend}</p>
                    <p className="text-xs text-muted-foreground">Spent</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{campaign.clicks}</p>
                    <p className="text-xs text-muted-foreground">Clicks</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{campaign.leads}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{campaign.cpl}</p>
                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                      CPL
                      {campaign.cplChange !== 0 && (
                        <span className={campaign.cplChange < 0 ? 'text-success' : 'text-destructive'}>
                          {campaign.cplChange < 0 ? '↓' : '↑'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {campaign.status === 'active' && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>
                  )}
                  {campaign.status === 'paused' && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <Play className="h-4 w-4" />
                      Resume
                    </Button>
                  )}
                  {campaign.status === 'draft' && (
                    <Button size="sm" className="gap-2 gradient-primary text-primary-foreground">
                      <Play className="h-4 w-4" />
                      Launch
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Campaign</DropdownMenuItem>
                      <DropdownMenuItem>View Analytics</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
