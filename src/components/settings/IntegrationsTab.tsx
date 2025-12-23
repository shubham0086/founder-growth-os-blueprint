import { IntegrationCard } from "./IntegrationCard";
import { useGoogleAdsConnection } from "@/hooks/useGoogleAdsConnection";
import { useMetaAdsConnection } from "@/hooks/useMetaAdsConnection";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export function IntegrationsTab() {
  const {
    connection: googleConnection,
    loading: googleLoading,
    connecting: googleConnecting,
    connectGoogleAds,
    disconnectGoogleAds,
  } = useGoogleAdsConnection();

  const {
    connection: metaConnection,
    accounts: metaAccounts,
    loading: metaLoading,
    connecting: metaConnecting,
    connectMetaAds,
    disconnectMetaAds,
  } = useMetaAdsConnection();

  const {
    lastSync: googleLastSync,
    syncing: googleSyncing,
    triggerSync: triggerGoogleSync,
  } = useSyncStatus('google');

  const {
    lastSync: metaLastSync,
    syncing: metaSyncing,
    triggerSync: triggerMetaSync,
  } = useSyncStatus('meta');

  const selectedMetaAccount = metaAccounts.find(a => a.is_selected);

  // Static integrations that are pre-configured
  const staticIntegrations = [
    { name: "Perplexity AI", description: "Research & content generation", status: "connected", icon: "🔮" },
    { name: "Firecrawl", description: "Competitor analysis & web scraping", status: "connected", icon: "🔥" },
    { name: "ElevenLabs", description: "Audio briefs & voice synthesis", status: "connected", icon: "🔊" },
  ];

  return (
    <div className="space-y-6">
      {/* Ad Platforms Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Ad Platforms</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <IntegrationCard
            name="Google Ads"
            description="Sync campaigns, spend, and conversions from Google Ads"
            icon="📊"
            isConnected={!!googleConnection}
            isConnecting={googleConnecting}
            isLoading={googleLoading}
            accountName={googleConnection?.email || undefined}
            lastSync={googleLastSync}
            syncing={googleSyncing}
            onConnect={connectGoogleAds}
            onDisconnect={disconnectGoogleAds}
            onSync={triggerGoogleSync}
          />

          <IntegrationCard
            name="Meta Ads"
            description="Sync campaigns and insights from Facebook & Instagram"
            icon="📱"
            isConnected={!!metaConnection}
            isConnecting={metaConnecting}
            isLoading={metaLoading}
            accountName={selectedMetaAccount?.name}
            lastSync={metaLastSync}
            syncing={metaSyncing}
            onConnect={connectMetaAds}
            onDisconnect={disconnectMetaAds}
            onSync={triggerMetaSync}
          />
        </div>
      </div>

      {/* Other Integrations Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">AI & Tools</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {staticIntegrations.map((integration) => (
            <Card key={integration.name} className="bg-card/50 border-border/50">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                      {integration.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <StatusBadge status="success" label="Active" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Coming Soon Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { icon: "💬", name: "WhatsApp Business", description: "Lead messaging & automation" },
            { icon: "📧", name: "Email Marketing", description: "Automated email campaigns" },
          ].map((item) => (
            <Card key={item.name} className="bg-card/50 border-border/50 opacity-80 hover:opacity-100 transition-opacity">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const subject = encodeURIComponent(`Integration Request: ${item.name}`);
                      const body = encodeURIComponent(`Hi, I'd like to request early access to the ${item.name} integration.`);
                      window.open(`mailto:support@foundergrowth.io?subject=${subject}&body=${body}`);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Request Access
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
