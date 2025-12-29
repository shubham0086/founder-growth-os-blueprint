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
  Loader2,
  Users,
  TrendingUp,
  Shield,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useResearch, Competitor } from "@/hooks/useResearch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

function CompetitorCard({ 
  comp, 
  analyzing, 
  onAnalyze 
}: { 
  comp: Competitor; 
  analyzing: string | null;
  onAnalyze: (id: string, url: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(comp.status === 'analyzed');
  const analysis = comp.analysis;

  return (
    <div className="rounded-xl border border-border/50 bg-background/50 hover:border-border transition-all overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-semibold text-muted-foreground shrink-0">
          {comp.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-foreground">{analysis?.companyName || comp.name}</h3>
            <StatusBadge 
              status={comp.status === 'analyzed' ? 'success' : comp.status === 'analyzing' ? 'warning' : comp.status === 'error' ? 'error' : 'neutral'} 
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
            {analysis?.pricingRange && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {analysis.pricingRange}
              </span>
            )}
          </div>
          {analysis?.tagline && (
            <p className="text-sm text-muted-foreground mt-1 italic">"{analysis.tagline}"</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {comp.status === 'analyzed' && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => comp.url && onAnalyze(comp.id, comp.url)}
            disabled={analyzing === comp.id}
          >
            {analyzing === comp.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded analysis */}
      {comp.status === 'analyzed' && analysis && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-2 border-t border-border/50 bg-muted/20">
              <div className="grid grid-cols-2 gap-4">
                {/* Main Offer */}
                {analysis.mainOffer && (
                  <div className="col-span-2">
                    <h4 className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Main Offer</h4>
                    <p className="text-sm text-foreground">{analysis.mainOffer}</p>
                  </div>
                )}

                {/* Pricing */}
                {(analysis.pricingModel || analysis.pricingRange) && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Pricing
                    </h4>
                    <p className="text-sm text-foreground">
                      {analysis.pricingModel && <span className="font-medium">{analysis.pricingModel}</span>}
                      {analysis.pricingModel && analysis.pricingRange && ' • '}
                      {analysis.pricingRange}
                    </p>
                  </div>
                )}

                {/* Target Audience */}
                {analysis.targetAudience && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide flex items-center gap-1">
                      <Users className="h-3 w-3" /> Target Audience
                    </h4>
                    <p className="text-sm text-foreground">{analysis.targetAudience}</p>
                  </div>
                )}

                {/* USPs */}
                {analysis.uniqueSellingPoints && analysis.uniqueSellingPoints.length > 0 && (
                  <div className="col-span-2">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Unique Selling Points
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.uniqueSellingPoints.map((usp, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                          {usp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Strengths
                    </h4>
                    <ul className="text-sm text-foreground space-y-1">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weaknesses */}
                {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Potential Weaknesses</h4>
                    <ul className="text-sm text-foreground space-y-1">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-500 mt-1">⚠</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Marketing Angles */}
                {analysis.marketingAngles && analysis.marketingAngles.length > 0 && (
                  <div className="col-span-2">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" /> Marketing Angles They Use
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.marketingAngles.map((angle, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md">
                          {angle}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

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
                  <CompetitorCard 
                    key={comp.id} 
                    comp={comp} 
                    analyzing={analyzing}
                    onAnalyze={analyzeCompetitor}
                  />
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
