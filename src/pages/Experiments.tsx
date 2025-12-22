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
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const experiments = [
  {
    id: 1,
    hypothesis: "Video testimonials will outperform static images",
    metric: "Click-through rate",
    variants: ["Static Before/After", "30s Video Testimonial"],
    status: "running" as const,
    daysLeft: 4,
    currentResult: "+34% for Video",
    confidence: 92,
  },
  {
    id: 2,
    hypothesis: "'Free Assessment' CTA converts better than 'Book Now'",
    metric: "Form submissions",
    variants: ["Book Now", "Free Assessment", "Get Started"],
    status: "running" as const,
    daysLeft: 2,
    currentResult: "Assessment leading",
    confidence: 78,
  },
  {
    id: 3,
    hypothesis: "Social proof in hero increases conversions",
    metric: "Landing page CVR",
    variants: ["Without reviews", "With Google reviews badge"],
    status: "completed" as const,
    result: "+23% with reviews",
    winner: "With reviews",
  },
  {
    id: 4,
    hypothesis: "Price anchoring increases premium tier selection",
    metric: "Tier selection rate",
    variants: ["3 tiers equal weight", "Premium highlighted"],
    status: "backlog" as const,
  },
];

const weeklyPlan = [
  { day: "Mon", task: "Launch headline A/B test", done: true },
  { day: "Tue", task: "Review video ad performance", done: true },
  { day: "Wed", task: "Update landing page CTA", done: false },
  { day: "Thu", task: "Analyze CPL trends", done: false },
  { day: "Fri", task: "Weekly report & learnings", done: false },
];

export default function Experiments() {
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
        <Button className="gap-2 gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4" />
          New Experiment
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Experiments List */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Active & Backlog</h2>
          {experiments.map((exp) => (
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
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {exp.metric}
                      </span>
                      <span>
                        {exp.variants.length} variants
                      </span>
                      {exp.daysLeft && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {exp.daysLeft} days left
                        </span>
                      )}
                    </div>

                    {/* Variants */}
                    <div className="flex flex-wrap gap-2">
                      {exp.variants.map((variant, i) => (
                        <span 
                          key={i}
                          className={`text-xs px-2 py-1 rounded ${
                            exp.winner === variant 
                              ? 'bg-success/10 text-success border border-success/20' 
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {variant}
                          {exp.winner === variant && ' ✓'}
                        </span>
                      ))}
                    </div>

                    {/* Result */}
                    {(exp.currentResult || exp.result) && (
                      <div className="mt-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">
                          {exp.currentResult || exp.result}
                        </span>
                        {exp.confidence && (
                          <span className="text-xs text-muted-foreground">
                            ({exp.confidence}% confidence)
                          </span>
                        )}
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
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      {exp.status === 'backlog' && (
                        <DropdownMenuItem>Start Experiment</DropdownMenuItem>
                      )}
                      {exp.status === 'running' && (
                        <DropdownMenuItem>End Early</DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Plan */}
        <div className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                This Week's Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {weeklyPlan.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${
                    item.done ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.done ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      item.day
                    )}
                  </div>
                  <span className={`text-sm ${item.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {item.task}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Learnings */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Key Learnings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-success/5 border border-success/20 text-sm">
                <p className="text-success font-medium mb-1">What works</p>
                <p className="text-muted-foreground">Video testimonials convert 34% better than static images.</p>
              </div>
              <div className="p-3 rounded-lg bg-warning/5 border border-warning/20 text-sm">
                <p className="text-warning font-medium mb-1">Watch out</p>
                <p className="text-muted-foreground">CPL increases on weekends. Consider reducing weekend spend.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
