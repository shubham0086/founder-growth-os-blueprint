import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Lead } from "@/hooks/useLeads";
import { 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Globe,
  Tag,
  Clock,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface LeadDetailsModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRescore: (leadId: string, leadName: string) => void;
  onSendMessage: (lead: Lead) => void;
  onBookCall: (lead: Lead) => void;
}

const stageConfig = {
  new: { status: "info" as const, label: "New" },
  contacted: { status: "warning" as const, label: "Contacted" },
  booked: { status: "info" as const, label: "Booked" },
  qualified: { status: "success" as const, label: "Qualified" },
  won: { status: "success" as const, label: "Won" },
  lost: { status: "error" as const, label: "Lost" },
};

const getScoreColor = (score: number) => {
  if (score >= 70) return "text-green-500";
  if (score >= 40) return "text-yellow-500";
  return "text-muted-foreground";
};

const getScoreLabel = (score: number) => {
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
};

const getScoreBg = (score: number) => {
  if (score >= 70) return "bg-green-500/10";
  if (score >= 40) return "bg-yellow-500/10";
  return "bg-muted";
};

// Scoring breakdown calculation
const getScoreBreakdown = (lead: Lead) => {
  const breakdown = [];
  
  // Source scoring (0-30)
  const sourceScores: Record<string, number> = {
    google_ads: 30, meta_ads: 28, facebook: 25, instagram: 25,
    linkedin: 22, referral: 20, organic: 15, direct: 10
  };
  const source = (lead.source || "unknown").toLowerCase().replace(/[\s-]/g, "_");
  const sourceScore = sourceScores[source] ?? 5;
  breakdown.push({ label: "Source", value: sourceScore, max: 30 });
  
  // Contact (0-25)
  let contactScore = 0;
  if (lead.email) contactScore += 15;
  if (lead.phone) contactScore += 10;
  breakdown.push({ label: "Contact Info", value: contactScore, max: 25 });
  
  // Attribution (0-20) - simplified since we don't have UTM in the Lead type
  const attrScore = 10; // Base attribution
  breakdown.push({ label: "Attribution", value: attrScore, max: 20 });
  
  // Stage (0-25)
  const stageScores: Record<string, number> = {
    new: 0, contacted: 5, booked: 15, qualified: 20, won: 25, lost: 0
  };
  const stageScore = stageScores[lead.stage] ?? 0;
  breakdown.push({ label: "Stage Progress", value: stageScore, max: 25 });
  
  return breakdown;
};

export function LeadDetailsModal({ 
  lead, 
  open, 
  onOpenChange, 
  onRescore,
  onSendMessage,
  onBookCall 
}: LeadDetailsModalProps) {
  if (!lead) return null;

  const stageInfo = stageConfig[lead.stage as keyof typeof stageConfig] || stageConfig.new;
  const scoreBreakdown = getScoreBreakdown(lead);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-lg">
              {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xl">{lead.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={stageInfo.status} label={stageInfo.label} />
                <span className={`text-sm font-medium ${getScoreColor(lead.score || 0)}`}>
                  {lead.score || 0} pts • {getScoreLabel(lead.score || 0)}
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Contact Information</h4>
              {lead.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                    {lead.phone}
                  </a>
                </div>
              )}
              {!lead.email && !lead.phone && (
                <p className="text-sm text-muted-foreground">No contact info available</p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Lead Details</h4>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Source:</span>
                <span className="text-foreground">{lead.source || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span className="text-foreground">{lead.createdAt}</span>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Score Breakdown</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 text-xs"
                onClick={() => onRescore(lead.id, lead.name)}
              >
                <Sparkles className="h-3 w-3" />
                Rescore
              </Button>
            </div>
            
            <div className={`p-4 rounded-lg ${getScoreBg(lead.score || 0)}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-2xl font-bold ${getScoreColor(lead.score || 0)}`}>
                  {lead.score || 0}/100
                </span>
                <span className={`text-sm font-medium ${getScoreColor(lead.score || 0)}`}>
                  {getScoreLabel(lead.score || 0)} Lead
                </span>
              </div>
              
              <div className="space-y-2">
                {scoreBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24">{item.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-background overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {item.value}/{item.max}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => onSendMessage(lead)}
            >
              <MessageSquare className="h-4 w-4" />
              Send Message
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => onBookCall(lead)}
            >
              <Calendar className="h-4 w-4" />
              Book Call
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
