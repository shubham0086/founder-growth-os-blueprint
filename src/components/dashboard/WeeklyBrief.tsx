import { Button } from "@/components/ui/button";
import { Volume2, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

export function WeeklyBrief() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 p-6">
      {/* Glow effect */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Weekly Growth Brief
            </h2>
            <p className="text-sm text-muted-foreground">
              Week of Dec 16 - Dec 22, 2024
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Volume2 className="h-4 w-4" />
            Listen
          </Button>
        </div>

        <div className="space-y-4">
          {/* Highlights */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
            <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                What's Working
              </h3>
              <p className="text-sm text-muted-foreground">
                "Free Assessment" CTA outperforming by 34%. Video ads have 2.1x higher engagement.
              </p>
            </div>
          </div>

          {/* Warnings */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                Needs Attention
              </h3>
              <p className="text-sm text-muted-foreground">
                CPL increased 18% on Meta. Consider pausing underperforming ad sets.
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="pt-2">
            <h3 className="text-sm font-medium text-foreground mb-3">
              Top 3 Actions This Week
            </h3>
            <div className="space-y-2">
              {[
                "Launch new headline variant: 'Transform in 90 Days'",
                "Increase budget on top ad set by 20%",
                "Send re-engagement email to cold leads",
              ].map((action, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm text-muted-foreground group cursor-pointer hover:text-foreground transition-colors"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                    {i + 1}
                  </span>
                  <span className="flex-1">{action}</span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
