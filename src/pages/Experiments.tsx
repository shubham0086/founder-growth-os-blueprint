import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Plus, 
  FlaskConical,
  TrendingUp,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Target,
  Calendar,
  Loader2,
  Trash2,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useExperiments } from "@/hooks/useExperiments";
import { ExperimentDetailsModal } from "@/components/experiments/ExperimentDetailsModal";
import { toast } from "sonner";

export default function Experiments() {
  const { experiments, loading, createExperiment, updateExperiment, deleteExperiment } = useExperiments();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<any>(null);
  const [newExperiment, setNewExperiment] = useState({
    hypothesis: '',
    metric: '',
    variants: '',
  });

  const handleCreate = async () => {
    try {
      await createExperiment({
        hypothesis: newExperiment.hypothesis,
        metric: newExperiment.metric || null,
        variants: newExperiment.variants.split(',').map(v => v.trim()).filter(Boolean),
      });
      toast.success('Experiment created');
      setDialogOpen(false);
      setNewExperiment({ hypothesis: '', metric: '', variants: '' });
    } catch (err) {
      toast.error('Failed to create experiment');
    }
  };

  const handleStartExperiment = async (id: string) => {
    try {
      await updateExperiment(id, { status: 'running' });
      toast.success('Experiment started');
    } catch (err) {
      toast.error('Failed to start experiment');
    }
  };

  const handleEndExperiment = async (id: string) => {
    try {
      await updateExperiment(id, { status: 'completed' });
      toast.success('Experiment ended');
    } catch (err) {
      toast.error('Failed to end experiment');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExperiment(id);
      toast.success('Experiment deleted');
    } catch (err) {
      toast.error('Failed to delete experiment');
    }
  };

  const runningCount = experiments.filter(e => e.status === 'running').length;
  const completedCount = experiments.filter(e => e.status === 'completed').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Experiments
          </h1>
          <p className="text-muted-foreground">
            Test hypotheses and iterate based on data.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4" />
              New Experiment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Experiment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Hypothesis</Label>
                <Textarea 
                  value={newExperiment.hypothesis}
                  onChange={(e) => setNewExperiment(prev => ({ ...prev, hypothesis: e.target.value }))}
                  placeholder="e.g., Video testimonials will outperform static images"
                />
              </div>
              <div className="space-y-2">
                <Label>Metric</Label>
                <Input 
                  value={newExperiment.metric}
                  onChange={(e) => setNewExperiment(prev => ({ ...prev, metric: e.target.value }))}
                  placeholder="e.g., Click-through rate"
                />
              </div>
              <div className="space-y-2">
                <Label>Variants (comma-separated)</Label>
                <Input 
                  value={newExperiment.variants}
                  onChange={(e) => setNewExperiment(prev => ({ ...prev, variants: e.target.value }))}
                  placeholder="e.g., Control, Variant A, Variant B"
                />
              </div>
              <Button onClick={handleCreate} className="w-full">Create Experiment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Running</span>
              <FlaskConical className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{runningCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Completed</span>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground">{completedCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Backlog</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {experiments.filter(e => e.status === 'backlog').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total</span>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{experiments.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Experiments List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">All Experiments</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : experiments.length === 0 ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-foreground font-medium mb-1">No experiments yet</p>
              <p className="text-sm text-muted-foreground mb-4">Start testing hypotheses to improve performance</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Experiment
              </Button>
            </CardContent>
          </Card>
        ) : (
          experiments.map((exp) => (
            <Card 
              key={exp.id}
              className="bg-card/50 border-border/50 hover:border-border transition-all"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                    exp.status === 'running' ? 'bg-primary/10' : 
                    exp.status === 'completed' ? 'bg-success/10' : 'bg-muted'
                  }`}>
                    <FlaskConical className={`h-5 w-5 ${
                      exp.status === 'running' ? 'text-primary' : 
                      exp.status === 'completed' ? 'text-success' : 'text-muted-foreground'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-foreground">
                        {exp.hypothesis}
                      </h3>
                      <StatusBadge 
                        status={
                          exp.status === 'running' ? 'info' : 
                          exp.status === 'completed' ? 'success' : 'neutral'
                        } 
                        label={exp.status} 
                      />
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      {exp.metric && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {exp.metric}
                        </span>
                      )}
                      {exp.variants && exp.variants.length > 0 && (
                        <span>{exp.variants.length} variants</span>
                      )}
                    </div>

                    {/* Variants */}
                    {exp.variants && exp.variants.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {exp.variants.map((variant, i) => (
                          <span 
                            key={i}
                            className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                          >
                            {variant}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setSelectedExperiment(exp); setDetailsOpen(true); }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {exp.status === 'backlog' && (
                        <DropdownMenuItem onClick={() => handleStartExperiment(exp.id)}>
                          Start Experiment
                        </DropdownMenuItem>
                      )}
                      {exp.status === 'running' && (
                        <DropdownMenuItem onClick={() => handleEndExperiment(exp.id)}>
                          End Experiment
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(exp.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Details Modal */}
      <ExperimentDetailsModal
        experiment={selectedExperiment}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onStart={handleStartExperiment}
        onEnd={handleEndExperiment}
      />
    </div>
  );
}
