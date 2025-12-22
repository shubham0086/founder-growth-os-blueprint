import { useState } from "react";
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
  Pause,
  Loader2,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { toast } from "sonner";

const platformColors = {
  Meta: "bg-blue-500/10 text-blue-400",
  Google: "bg-red-500/10 text-red-400",
};

export default function Campaigns() {
  const { campaigns, loading, createCampaign, updateCampaign, deleteCampaign } = useCampaigns();
  const { metrics } = useDashboardMetrics();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    platform: 'Meta',
  });

  const handleCreate = async () => {
    try {
      await createCampaign({
        name: newCampaign.name,
        platform: newCampaign.platform,
      });
      toast.success('Campaign created');
      setDialogOpen(false);
      setNewCampaign({ name: '', platform: 'Meta' });
    } catch (err) {
      toast.error('Failed to create campaign');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 
                        currentStatus === 'paused' ? 'active' : 
                        'active';
      await updateCampaign(id, { status: newStatus });
      toast.success('Campaign updated');
    } catch (err) {
      toast.error('Failed to update campaign');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCampaign(id);
      toast.success('Campaign deleted');
    } catch (err) {
      toast.error('Failed to delete campaign');
    }
  };

  const activeCount = campaigns.filter(c => c.status === 'active').length;

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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input 
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Summer Promotion"
                />
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select 
                  value={newCampaign.platform}
                  onValueChange={(value) => setNewCampaign(prev => ({ ...prev, platform: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Meta">Meta (Facebook/Instagram)</SelectItem>
                    <SelectItem value="Google">Google Ads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full">Create Campaign</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Spend</span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              ₹{metrics?.adSpend.toLocaleString() || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Clicks</span>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metrics?.totalClicks.toLocaleString() || 0}
            </p>
            {metrics?.clicksChange !== 0 && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${metrics?.clicksChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {metrics?.clicksChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(metrics?.clicksChange || 0)}% vs last week
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Leads</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metrics?.newLeads || 0}
            </p>
            {metrics?.leadsChange !== 0 && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${metrics?.leadsChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {metrics?.leadsChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(metrics?.leadsChange || 0)}% vs last week
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active Campaigns</span>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{activeCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">All Campaigns</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-foreground font-medium mb-1">No campaigns yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first campaign to start tracking</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => (
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
                      <span className={`text-xs px-2 py-0.5 rounded ${platformColors[campaign.platform as keyof typeof platformColors] || 'bg-muted text-muted-foreground'}`}>
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
                      Created {new Date(campaign.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {campaign.status === 'active' && (
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleToggleStatus(campaign.id, campaign.status)}>
                        <Pause className="h-4 w-4" />
                        Pause
                      </Button>
                    )}
                    {campaign.status === 'paused' && (
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleToggleStatus(campaign.id, campaign.status)}>
                        <Play className="h-4 w-4" />
                        Resume
                      </Button>
                    )}
                    {campaign.status === 'draft' && (
                      <Button size="sm" className="gap-2 gradient-primary text-primary-foreground" onClick={() => handleToggleStatus(campaign.id, campaign.status)}>
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
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(campaign.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
