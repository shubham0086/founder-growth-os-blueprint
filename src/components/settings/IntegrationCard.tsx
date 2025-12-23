import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Plug, 
  Unplug, 
  Loader2, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown
} from "lucide-react";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  isConnecting?: boolean;
  isLoading?: boolean;
  accountName?: string;
  lastSync?: {
    status: string;
    started_at: string;
    finished_at: string | null;
    error: string | null;
    rows_upserted: number | null;
  } | null;
  syncing?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync?: (days: number) => Promise<void>;
}

export function IntegrationCard({
  name,
  description,
  icon,
  isConnected,
  isConnecting,
  isLoading,
  accountName,
  lastSync,
  syncing,
  onConnect,
  onDisconnect,
  onSync,
}: IntegrationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleSync = async (days: number) => {
    if (!onSync) return;
    try {
      await onSync(days);
      toast.success(`Sync started for last ${days} days`);
    } catch {
      toast.error('Failed to start sync');
    }
  };

  const getSyncStatusIcon = () => {
    if (!lastSync) return null;
    
    switch (lastSync.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-40 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                {icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{name}</h3>
                  {isConnected && getSyncStatusIcon()}
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
                {isConnected && accountName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Account: {accountName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <StatusBadge status="success" label="Connected" />
                  
                  {onSync && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          disabled={syncing}
                        >
                          {syncing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                          Sync
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSync(7)}>
                          Last 7 days
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSync(14)}>
                          Last 14 days
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSync(30)}>
                          Last 30 days
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={onDisconnect}
                  >
                    <Unplug className="h-4 w-4" />
                  </Button>

                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  disabled={isConnecting}
                  onClick={onConnect}
                >
                  {isConnecting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Plug className="h-3 w-3" />
                  )}
                  Connect
                </Button>
              )}
            </div>
          </div>

          {isConnected && (
            <CollapsibleContent>
              <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                <div className="text-sm">
                  <h4 className="font-medium mb-2">Sync Status</h4>
                  {lastSync ? (
                    <div className="space-y-2 text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Status</span>
                        <span className={`font-medium ${
                          lastSync.status === 'completed' ? 'text-success' :
                          lastSync.status === 'failed' ? 'text-destructive' :
                          lastSync.status === 'running' ? 'text-primary' : ''
                        }`}>
                          {lastSync.status.charAt(0).toUpperCase() + lastSync.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last run</span>
                        <span>{formatDistanceToNow(new Date(lastSync.started_at), { addSuffix: true })}</span>
                      </div>
                      {lastSync.finished_at && (
                        <div className="flex justify-between">
                          <span>Finished</span>
                          <span>{format(new Date(lastSync.finished_at), 'MMM d, h:mm a')}</span>
                        </div>
                      )}
                      {lastSync.rows_upserted !== null && lastSync.status === 'completed' && (
                        <div className="flex justify-between">
                          <span>Records synced</span>
                          <span className="font-medium text-foreground">{lastSync.rows_upserted}</span>
                        </div>
                      )}
                      {lastSync.error && (
                        <div className="mt-2 p-2 rounded bg-destructive/10 text-destructive text-xs">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                            <span>{lastSync.error}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No sync history available</p>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          )}
        </CardContent>
      </Collapsible>
    </Card>
  );
}
