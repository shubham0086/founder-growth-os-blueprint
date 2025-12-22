import { cn } from "@/lib/utils";
import { User, ArrowRight } from "lucide-react";
import { useLeadsPipeline } from "@/hooks/useLeadsPipeline";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export function LeadsPipeline() {
  const { stages, recentLeads, loading, error } = useLeadsPipeline();

  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  if (error) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Failed to load pipeline data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Leads Pipeline</h2>
        <Link
          to="/leads"
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Pipeline visualization */}
      {loading ? (
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1">
              <Skeleton className="h-2 rounded-full" />
              <div className="mt-2 text-center">
                <Skeleton className="h-6 w-8 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : stages.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No leads yet. Start adding leads to see your pipeline.
        </p>
      ) : (
        <div className="flex items-center gap-2">
          {stages.map((stage) => (
            <div key={stage.name} className="flex-1 group">
              <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                    stage.color
                  )}
                  style={{ width: `${(stage.count / maxCount) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-center">
                <p className="text-lg font-semibold text-foreground">{stage.count}</p>
                <p className="text-xs text-muted-foreground">{stage.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent leads */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Recent Leads</h3>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : recentLeads.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent leads.
          </p>
        ) : (
          recentLeads.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:bg-card hover:border-border transition-all cursor-pointer"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                <p className="text-xs text-muted-foreground">{lead.source || 'Direct'}</p>
              </div>
              <div className="text-right">
                <span
                  className={cn(
                    "inline-block px-2 py-0.5 rounded text-xs font-medium",
                    lead.stage.toLowerCase() === "new" && "bg-primary/10 text-primary",
                    lead.stage.toLowerCase() === "contacted" && "bg-blue-500/10 text-blue-400",
                    lead.stage.toLowerCase() === "booked" && "bg-violet-500/10 text-violet-400",
                    lead.stage.toLowerCase() === "qualified" && "bg-amber-500/10 text-amber-400",
                    lead.stage.toLowerCase() === "won" && "bg-success/10 text-success"
                  )}
                >
                  {lead.stage}
                </span>
                <p className="text-xs text-muted-foreground mt-1">{lead.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
