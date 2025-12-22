import { cn } from "@/lib/utils";
import { User, ArrowRight } from "lucide-react";

const stages = [
  { name: "New", count: 12, color: "bg-primary" },
  { name: "Contacted", count: 8, color: "bg-blue-500" },
  { name: "Booked", count: 5, color: "bg-violet-500" },
  { name: "Qualified", count: 3, color: "bg-amber-500" },
  { name: "Won", count: 2, color: "bg-success" },
];

const recentLeads = [
  { name: "Priya Sharma", source: "Google Ads", stage: "New", time: "2m ago" },
  { name: "Rahul Verma", source: "Landing Page", stage: "Contacted", time: "1h ago" },
  { name: "Anita Desai", source: "WhatsApp", stage: "Booked", time: "3h ago" },
];

export function LeadsPipeline() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Leads Pipeline</h2>
        <button className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
          View all <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Pipeline visualization */}
      <div className="flex items-center gap-2">
        {stages.map((stage, index) => (
          <div key={stage.name} className="flex-1 group">
            <div className="relative h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500", stage.color)}
                style={{ width: `${(stage.count / 12) * 100}%` }}
              />
            </div>
            <div className="mt-2 text-center">
              <p className="text-lg font-semibold text-foreground">{stage.count}</p>
              <p className="text-xs text-muted-foreground">{stage.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent leads */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Recent Leads</h3>
        {recentLeads.map((lead, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:bg-card hover:border-border transition-all cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
              <p className="text-xs text-muted-foreground">{lead.source}</p>
            </div>
            <div className="text-right">
              <span className={cn(
                "inline-block px-2 py-0.5 rounded text-xs font-medium",
                lead.stage === "New" && "bg-primary/10 text-primary",
                lead.stage === "Contacted" && "bg-blue-500/10 text-blue-400",
                lead.stage === "Booked" && "bg-violet-500/10 text-violet-400"
              )}>
                {lead.stage}
              </span>
              <p className="text-xs text-muted-foreground mt-1">{lead.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
