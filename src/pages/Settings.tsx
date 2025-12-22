import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  Users, 
  Plug, 
  Shield, 
  Bell,
  Check,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const integrations = [
  { name: "Perplexity AI", description: "Research & content generation", status: "connected", icon: "🔮" },
  { name: "Firecrawl", description: "Competitor analysis & web scraping", status: "connected", icon: "🔥" },
  { name: "ElevenLabs", description: "Audio briefs & voice synthesis", status: "connected", icon: "🔊" },
  { name: "Google Ads", description: "Campaign management", status: "not_connected", icon: "📊" },
  { name: "Meta Ads", description: "Campaign management", status: "not_connected", icon: "📱" },
  { name: "WhatsApp Business", description: "Lead messaging", status: "not_connected", icon: "💬" },
];

const teamMembers = [
  { name: "You", email: "founder@acmefitness.com", role: "Owner" },
  { name: "Marketing Lead", email: "marketing@acmefitness.com", role: "Admin" },
];

export default function Settings() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your workspace, team, and integrations.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="workspace" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="workspace" className="gap-2 data-[state=active]:bg-background">
            <SettingsIcon className="h-4 w-4" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2 data-[state=active]:bg-background">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2 data-[state=active]:bg-background">
            <Plug className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2 data-[state=active]:bg-background">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        {/* Workspace */}
        <TabsContent value="workspace" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Workspace Details</CardTitle>
              <CardDescription>Basic information about your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Workspace Name
                  </label>
                  <Input defaultValue="Acme Fitness" className="bg-background/50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Industry
                  </label>
                  <Input defaultValue="Fitness / Gym" className="bg-background/50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Region
                  </label>
                  <Input defaultValue="Mumbai, India" className="bg-background/50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Currency
                  </label>
                  <Input defaultValue="INR (₹)" className="bg-background/50" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
              <CardDescription>Configure how you receive updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "New lead alerts", description: "Get notified when a new lead comes in" },
                { label: "Daily brief", description: "Receive your daily metrics summary" },
                { label: "Experiment results", description: "Notify when experiments complete" },
                { label: "Budget warnings", description: "Alert when approaching budget limits" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Team Members</CardTitle>
                <CardDescription>Manage who has access to this workspace.</CardDescription>
              </div>
              <Button variant="outline" size="sm">Invite Member</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.email} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {member.role}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.name} className="bg-card/50 border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{integration.icon}</div>
                      <div>
                        <h3 className="font-medium text-foreground">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    {integration.status === 'connected' ? (
                      <StatusBadge status="success" label="Connected" />
                    ) : (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Plug className="h-3 w-3" />
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Data & Privacy</CardTitle>
              <CardDescription>Manage data retention and privacy settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Lead data retention</p>
                  <p className="text-sm text-muted-foreground">Automatically delete lead data after period</p>
                </div>
                <Input defaultValue="365 days" className="w-32 bg-background/50" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Require consent for messaging</p>
                  <p className="text-sm text-muted-foreground">Only send messages to leads who opted in</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Include disclaimers on landing pages</p>
                  <p className="text-sm text-muted-foreground">Auto-add privacy and terms links</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Audit Log</CardTitle>
              <CardDescription>Recent actions in your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { action: "Landing page published", user: "You", time: "2 hours ago" },
                { action: "Campaign budget updated", user: "Marketing Lead", time: "1 day ago" },
                { action: "New team member invited", user: "You", time: "2 days ago" },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm text-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground">by {log.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{log.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
