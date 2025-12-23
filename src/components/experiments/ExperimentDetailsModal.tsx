import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { 
  FlaskConical, 
  Target, 
  Calendar,
  Play,
  Square,
  BarChart3
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Experiment {
  id: string;
  hypothesis: string;
  metric: string | null;
  variants: string[] | null;
  status: string;
  result: any;
  created_at: string;
  updated_at: string;
}

interface ExperimentDetailsModalProps {
  experiment: Experiment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (id: string) => void;
  onEnd: (id: string) => void;
}

export function ExperimentDetailsModal({ 
  experiment, 
  open, 
  onOpenChange,
  onStart,
  onEnd
}: ExperimentDetailsModalProps) {
  if (!experiment) return null;

  const statusConfig = {
    backlog: { status: "neutral" as const, label: "Backlog" },
    running: { status: "info" as const, label: "Running" },
    completed: { status: "success" as const, label: "Completed" },
  };

  const statusInfo = statusConfig[experiment.status as keyof typeof statusConfig] || statusConfig.backlog;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              experiment.status === 'running' ? 'bg-primary/10' : 
              experiment.status === 'completed' ? 'bg-green-500/10' : 'bg-muted'
            }`}>
              <FlaskConical className={`h-5 w-5 ${
                experiment.status === 'running' ? 'text-primary' : 
                experiment.status === 'completed' ? 'text-green-500' : 'text-muted-foreground'
              }`} />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold">Experiment Details</p>
              <StatusBadge status={statusInfo.status} label={statusInfo.label} className="mt-1" />
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-4">
          {/* Hypothesis */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              Hypothesis
            </h4>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              {experiment.hypothesis}
            </p>
          </div>

          {/* Metric */}
          {experiment.metric && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Success Metric
              </h4>
              <p className="text-sm text-muted-foreground">{experiment.metric}</p>
            </div>
          )}

          {/* Variants */}
          {experiment.variants && experiment.variants.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Variants</h4>
              <div className="flex flex-wrap gap-2">
                {experiment.variants.map((variant, i) => (
                  <div 
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground"
                  >
                    {variant}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Timeline
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Created: {formatDistanceToNow(new Date(experiment.created_at), { addSuffix: true })}</p>
              <p>Last updated: {formatDistanceToNow(new Date(experiment.updated_at), { addSuffix: true })}</p>
            </div>
          </div>

          {/* Results (if completed) */}
          {experiment.status === 'completed' && experiment.result && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Results</h4>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <pre className="text-xs text-muted-foreground overflow-auto">
                  {JSON.stringify(experiment.result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            {experiment.status === 'backlog' && (
              <Button 
                className="flex-1 gap-2"
                onClick={() => {
                  onStart(experiment.id);
                  onOpenChange(false);
                }}
              >
                <Play className="h-4 w-4" />
                Start Experiment
              </Button>
            )}
            {experiment.status === 'running' && (
              <Button 
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  onEnd(experiment.id);
                  onOpenChange(false);
                }}
              >
                <Square className="h-4 w-4" />
                End Experiment
              </Button>
            )}
            {experiment.status === 'completed' && (
              <p className="text-sm text-muted-foreground text-center flex-1">
                This experiment has been completed.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
