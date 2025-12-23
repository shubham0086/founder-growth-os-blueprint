import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Zap,
  Mail,
  MessageSquare,
  Clock,
  MoreHorizontal,
  ArrowRight,
  Loader2
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
import { useAutomations } from "@/hooks/useAutomations";
import { toast } from "sonner";
import { AutomationEditorModal } from "@/components/automations/AutomationEditorModal";

export default function Automations() {
  const { automations, loading, createAutomation, updateAutomation, deleteAutomation } = useAutomations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    trigger_event: 'new_lead',
    channel: 'email',
  });

  const handleCreate = async () => {
    try {
      await createAutomation(newAutomation);
      toast.success('Automation created');
      setDialogOpen(false);
      setNewAutomation({ name: '', trigger_event: 'new_lead', channel: 'email' });
    } catch (err) {
      toast.error('Failed to create automation');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      await updateAutomation(id, { 
        status: currentStatus === 'active' ? 'paused' : 'active' 
      });
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAutomation(id);
      toast.success('Automation deleted');
    } catch (err) {
      toast.error('Failed to delete automation');
    }
  };

  const activeCount = automations.filter(a => a.status === 'active').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Automations
          </h1>
          <p className="text-muted-foreground">
            Set up automated follow-ups and nurture sequences.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4" />
              New Sequence
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Automation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input 
                  value={newAutomation.name}
                  onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Welcome Sequence"
                />
              </div>
              <div className="space-y-2">
                <Label>Trigger</Label>
                <Select 
                  value={newAutomation.trigger_event}
                  onValueChange={(value) => setNewAutomation(prev => ({ ...prev, trigger_event: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_lead">New lead captured</SelectItem>
                    <SelectItem value="lead_not_responded">Lead not responded (24h)</SelectItem>
                    <SelectItem value="lead_contacted">Lead stage = Contacted</SelectItem>
                    <SelectItem value="lead_inactive">Lead inactive (14 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select 
                  value={newAutomation.channel}
                  onValueChange={(value) => setNewAutomation(prev => ({ ...prev, channel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full">Create Automation</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active Sequences</span>
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Automations</span>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{automations.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Open Rate</span>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">--</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Reply Rate</span>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">--</p>
          </CardContent>
        </Card>
      </div>

      {/* Sequences */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Sequences</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : automations.length === 0 ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-foreground font-medium mb-1">No automations yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first sequence to automate follow-ups</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Automation
              </Button>
            </CardContent>
          </Card>
        ) : (
          automations.map((sequence) => (
            <Card 
              key={sequence.id}
              className="bg-card/50 border-border/50 hover:border-border transition-all"
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-6">
                  {/* Icon */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg shrink-0 ${
                    sequence.channel === 'whatsapp' ? 'bg-green-500/10' : 'bg-blue-500/10'
                  }`}>
                    {sequence.channel === 'whatsapp' ? (
                      <MessageSquare className="h-6 w-6 text-green-400" />
                    ) : (
                      <Mail className="h-6 w-6 text-blue-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-foreground">{sequence.name}</h3>
                      <StatusBadge 
                        status={sequence.status === 'active' ? 'success' : 'warning'} 
                        label={sequence.status} 
                      />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {sequence.trigger_event.replace(/_/g, ' ')}
                      </span>
                      {sequence.delay_hours && sequence.delay_hours > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {sequence.delay_hours}h delay
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Toggle */}
                  <Switch 
                    checked={sequence.status === 'active'} 
                    onCheckedChange={() => handleToggleStatus(sequence.id, sequence.status)}
                  />

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingAutomation(sequence)}>Edit Sequence</DropdownMenuItem>
                      <DropdownMenuItem>View Analytics</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(sequence.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Automation Editor Modal */}
      {editingAutomation && (
        <AutomationEditorModal
          open={!!editingAutomation}
          onOpenChange={(open) => !open && setEditingAutomation(null)}
          automation={editingAutomation}
          onSave={async (updates) => {
            await updateAutomation(editingAutomation.id, updates);
          }}
        />
      )}
    </div>
  );
}
