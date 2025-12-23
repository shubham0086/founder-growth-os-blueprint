import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  Users, 
  Plug, 
  Shield, 
  Loader2,
  LogOut,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { IntegrationsTab } from "@/components/settings/IntegrationsTab";
import { toast } from "sonner";


export default function Settings() {
  const { workspace, notifications, saving, updateWorkspace, updateNotification } = useSettings();
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  
  const [workspaceName, setWorkspaceName] = useState("");
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [currency, setCurrency] = useState("");

  useEffect(() => {
    if (workspace) {
      setWorkspaceName(workspace.name || "");
      setIndustry(workspace.industry || "");
      setRegion(workspace.region || "");
      setCurrency(workspace.currency || "INR");
    }
  }, [workspace]);

  const handleSaveWorkspace = async () => {
    await updateWorkspace({
      name: workspaceName,
      industry,
      region,
      currency,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };


  const loading = !workspace;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your workspace, team, and integrations.
          </p>
        </div>
        <Button variant="outline" className="gap-2 text-destructive hover:text-destructive" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
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
            Account
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
              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Workspace Name
                      </label>
                      <Input 
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        className="bg-background/50" 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Industry
                      </label>
                      <Input 
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="e.g., Fitness / Gym"
                        className="bg-background/50" 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Region
                      </label>
                      <Input 
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        placeholder="e.g., Mumbai, India"
                        className="bg-background/50" 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Currency
                      </label>
                      <Input 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        placeholder="e.g., INR"
                        className="bg-background/50" 
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveWorkspace} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
              <CardDescription>Configure how you receive updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'newLeadAlerts' as const, label: "New lead alerts", description: "Get notified when a new lead comes in" },
                { key: 'dailyBrief' as const, label: "Daily brief", description: "Receive your daily metrics summary" },
                { key: 'experimentResults' as const, label: "Experiment results", description: "Notify when experiments complete" },
                { key: 'budgetWarnings' as const, label: "Budget warnings", description: "Alert when approaching budget limits" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch 
                    checked={notifications[item.key]} 
                    onCheckedChange={(checked) => updateNotification(item.key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account */}
        <TabsContent value="team" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Your Account</CardTitle>
              <CardDescription>Manage your personal account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{profile?.full_name || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    Owner
                  </span>
                </div>
              )}
              
              <div className="pt-4 border-t border-border/50">
                <h4 className="font-medium mb-3">Account Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="text-foreground">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID</span>
                    <span className="text-foreground font-mono text-xs">{user?.id?.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company</span>
                    <span className="text-foreground">{profile?.company_name || workspace?.name || '—'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <IntegrationsTab />
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
              <CardTitle className="text-lg font-semibold">Workspace Info</CardTitle>
              <CardDescription>Technical details about your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Workspace ID</span>
                <span className="text-sm text-foreground font-mono">{workspace?.id?.slice(0, 12)}...</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm text-foreground">
                  {workspace?.created_at ? new Date(workspace.created_at).toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Timezone</span>
                <span className="text-sm text-foreground">{workspace?.timezone || 'UTC'}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
