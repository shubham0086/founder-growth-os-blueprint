import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Search, 
  Plus, 
  ExternalLink, 
  Sparkles, 
  RefreshCw,
  Lightbulb,
  AlertCircle,
  Target,
  DollarSign,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useResearch } from "@/hooks/useResearch";

export default function Research() {
  const [newCompetitor, setNewCompetitor] = useState("");
  const { 
    competitors, 
    angles, 
    objections, 
    loading, 
    analyzing,
    addCompetitor, 
    analyzeCompetitor, 
    runFullScan 
  } = useResearch();
  const [isScanning, setIsScanning] = useState(false);

  const handleAddCompetitor = async () => {
    if (!newCompetitor.trim()) return;
    await addCompetitor(newCompetitor);
    setNewCompetitor("");
  };

  const handleRunFullScan = async () => {
    setIsScanning(true);
    await runFullScan();
    setIsScanning(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Research Hub
          </h1>
          <p className="text-muted-foreground">
            Analyze competitors, discover angles, and understand objections.
          </p>
        </div>
        <Button 
          className="gap-2 gradient-primary text-primary-foreground"
          onClick={handleRunFullScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isScanning ? 'Scanning...' : 'Run Full Scan'}
        </Button>
      </div>

      {/* Add Competitor */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter competitor URL (e.g., competitor.com)"
            className="pl-10 bg-card border-border"
            value={newCompetitor}
            onChange={(e) => setNewCompetitor(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCompetitor()}
          />
        </div>
        <Button variant="outline" className="gap-2" onClick={handleAddCompetitor}>
          <Plus className="h-4 w-4" />
          Add Competitor
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Competitors List */}
        <div className="col-span-2">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Competitors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background/50">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))
              ) : competitors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No competitors added yet.</p>
                  <p className="text-sm">Add a competitor URL above to start analyzing.</p>
                </div>
              ) : (
                competitors.map((comp) => (
                  <div
                    key={comp.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background/50 hover:border-border transition-all"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-semibold text-muted-foreground">
                      {comp.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">{comp.name}</h3>
                        <StatusBadge 
                          status={comp.status === 'analyzed' ? 'success' : comp.status === 'analyzing' ? 'warning' : 'neutral'} 
                          label={comp.status} 
                        />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {comp.url && (
                          <a href={`https://${comp.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                            {comp.url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {comp.pricing && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {comp.pricing}
                          </span>
                        )}
                      </div>
                      {comp.offer && (
                        <p className="text-sm text-muted-foreground mt-1">{comp.offer}</p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => comp.url && analyzeCompetitor(comp.id, comp.url)}
                      disabled={analyzing === comp.id}
                    >
                      {analyzing === comp.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Angles */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-400" />
                Discovered Angles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)
              ) : angles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Run a full scan to discover marketing angles.
                </p>
              ) : (
                angles.map((angle, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-background/50 border border-border/50 text-sm text-foreground cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    "{angle}"
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Objections */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Common Objections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)
              ) : objections.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Run a full scan to discover objections.
                </p>
              ) : (
                objections.map((obj, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
                  >
                    <span className="text-sm text-foreground">"{obj.objection}"</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {obj.frequency}%
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
