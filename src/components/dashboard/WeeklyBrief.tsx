import { Button } from "@/components/ui/button";
import { Volume2, Square, CheckCircle, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { useWeeklyBrief } from "@/hooks/useWeeklyBrief";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Skeleton } from "@/components/ui/skeleton";

export function WeeklyBrief() {
  const { brief, loading, error } = useWeeklyBrief();
  const { speak, stop, isPlaying, isLoading } = useTextToSpeech();

  const handleListen = () => {
    if (isPlaying) {
      stop();
      return;
    }
    if (!brief) return;
    
    const text = `Weekly Growth Brief. ${brief.weekRange}. 
      What's working: ${brief.highlights.join('. ')}. 
      Needs attention: ${brief.warnings.length > 0 ? brief.warnings.join('. ') : 'Nothing urgent.'}. 
      Top actions: ${brief.actions.join('. ')}`;
    speak(text);
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6 text-center text-muted-foreground">
        Failed to load weekly brief.
      </div>
    );
  }

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
            {loading ? (
              <Skeleton className="h-4 w-40" />
            ) : (
              <p className="text-sm text-muted-foreground">{brief?.weekRange}</p>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2" 
            onClick={handleListen}
            disabled={loading || isLoading || !brief}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Square className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            {isPlaying ? 'Stop' : 'Listen'}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Highlights */}
          {loading ? (
            <div className="p-3 rounded-lg bg-success/5 border border-success/20">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-full" />
            </div>
          ) : brief?.highlights && brief.highlights.length > 0 ? (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
              <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1">
                  What's Working
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {brief.highlights.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {/* Warnings */}
          {loading ? (
            <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-3 w-full" />
            </div>
          ) : brief?.warnings && brief.warnings.length > 0 ? (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1">
                  Needs Attention
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {brief.warnings.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {/* Top Actions */}
          {loading ? (
            <div className="pt-2">
              <Skeleton className="h-4 w-32 mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            </div>
          ) : brief?.actions && brief.actions.length > 0 ? (
            <div className="pt-2">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Top Actions This Week
              </h3>
              <div className="space-y-2">
                {brief.actions.map((action, i) => (
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
