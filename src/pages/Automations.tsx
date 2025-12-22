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
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sequences = [
  {
    id: 1,
    name: "Immediate Lead Response",
    trigger: "New lead captured",
    channel: "whatsapp",
    steps: 1,
    status: "active" as const,
    sentToday: 12,
  },
  {
    id: 2,
    name: "24h Follow-up",
    trigger: "Lead not responded (24h)",
    channel: "email",
    steps: 2,
    status: "active" as const,
    sentToday: 8,
  },
  {
    id: 3,
    name: "7-Day Nurture Sequence",
    trigger: "Lead stage = Contacted",
    channel: "email",
    steps: 5,
    status: "active" as const,
    sentToday: 15,
  },
  {
    id: 4,
    name: "Re-engagement Campaign",
    trigger: "Lead inactive (14 days)",
    channel: "email",
    steps: 3,
    status: "paused" as const,
    sentToday: 0,
  },
];

const templates = [
  {
    id: 1,
    name: "Welcome Message",
    channel: "whatsapp",
    preview: "Hi {{name}}! Thanks for your interest in our fitness program. I'm here to help you get started...",
  },
  {
    id: 2,
    name: "Free Assessment Reminder",
    channel: "email",
    preview: "Subject: Your free fitness assessment is waiting, {{name}}!",
  },
  {
    id: 3,
    name: "Success Story Share",
    channel: "email",
    preview: "Subject: How Priya transformed in 90 days (and how you can too)",
  },
];

export default function Automations() {
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
        <Button className="gap-2 gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4" />
          New Sequence
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active Sequences</span>
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">3</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Messages Sent Today</span>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">35</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Open Rate</span>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">42%</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Reply Rate</span>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">18%</p>
          </CardContent>
        </Card>
      </div>

      {/* Sequences */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Sequences</h2>
        {sequences.map((sequence) => (
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
                      {sequence.trigger}
                    </span>
                    <span className="flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      {sequence.steps} step{sequence.steps > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-foreground">{sequence.sentToday}</p>
                  <p className="text-xs text-muted-foreground">Sent today</p>
                </div>

                {/* Toggle */}
                <Switch checked={sequence.status === 'active'} />

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit Sequence</DropdownMenuItem>
                    <DropdownMenuItem>View Analytics</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Message Templates</h2>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="bg-card/50 border-border/50 hover:border-border transition-all cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  {template.channel === 'whatsapp' ? (
                    <MessageSquare className="h-4 w-4 text-green-400" />
                  ) : (
                    <Mail className="h-4 w-4 text-blue-400" />
                  )}
                  <h3 className="font-medium text-foreground">{template.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.preview}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
