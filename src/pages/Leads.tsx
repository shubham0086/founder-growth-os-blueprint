import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Search, 
  User,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  MessageSquare,
  Upload,
  Download,
  Plus,
  Loader2,
  Sparkles,
  TrendingUp
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLeads, Lead } from "@/hooks/useLeads";
import { ImportLeadsModal } from "@/components/data-import/ImportLeadsModal";
import { AddLeadModal } from "@/components/data-import/AddLeadModal";
import { LeadDetailsModal } from "@/components/leads/LeadDetailsModal";
import { LeadFilters, SortField, SortOrder } from "@/components/leads/LeadFilters";
import { exportToCsv } from "@/lib/exportCsv";
import { toast } from "sonner";

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

export default function Leads() {
  const { leads, loading, scoring, refetch, scoreLeads } = useLeads();
  const [searchQuery, setSearchQuery] = useState("");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Filter & Sort state
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Get unique stages and sources for filter options
  const availableStages = Object.keys(stageConfig);
  const availableSources = useMemo(() => {
    const sources = new Set<string>();
    leads.forEach(lead => {
      if (lead.source) sources.add(lead.source);
    });
    return Array.from(sources).sort();
  }, [leads]);

  // Apply filters and sorting
  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(lead =>
        lead.name.toLowerCase().includes(query) ||
        (lead.email && lead.email.toLowerCase().includes(query))
      );
    }

    // Stage filter
    if (selectedStages.length > 0) {
      result = result.filter(lead => selectedStages.includes(lead.stage));
    }

    // Source filter
    if (selectedSources.length > 0) {
      result = result.filter(lead => lead.source && selectedSources.includes(lead.source));
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'score':
          comparison = (a.score || 0) - (b.score || 0);
          break;
        case 'createdAt':
          comparison = new Date(a.rawCreatedAt).getTime() - new Date(b.rawCreatedAt).getTime();
          break;
        case 'stage':
          const stageOrder = ['new', 'contacted', 'booked', 'qualified', 'won', 'lost'];
          comparison = stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [leads, searchQuery, selectedStages, selectedSources, sortField, sortOrder]);

  const handleExport = () => {
    if (leads.length === 0) {
      toast.error("No leads to export");
      return;
    }

    const exportData = leads.map(lead => ({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      source: lead.source || '',
      stage: lead.stage,
      score: lead.score || 0,
      created_at: lead.rawCreatedAt,
    }));

    exportToCsv(`leads-export-${new Date().toISOString().split('T')[0]}.csv`, exportData);
    toast.success("Leads exported successfully");
  };

  const handleScoreLeads = async () => {
    try {
      const result = await scoreLeads();
      if (result) {
        if (result.updated > 0) {
          toast.success(`Updated ${result.updated} lead scores`);
        } else {
          toast.info("All lead scores are up to date");
        }
      }
    } catch (error) {
      toast.error("Failed to score leads");
    }
  };

  const handleScoreLead = async (leadId: string, leadName: string) => {
    try {
      const result = await scoreLeads(leadId);
      if (result && result.details.length > 0) {
        const detail = result.details[0];
        toast.success(`${leadName}: ${detail.oldScore} → ${detail.newScore}`);
      } else {
        toast.info(`${leadName} score is up to date`);
      }
    } catch (error) {
      toast.error("Failed to score lead");
    }
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailsModalOpen(true);
  };

  const handleSendMessage = (lead: Lead) => {
    if (lead.email) {
      window.open(`mailto:${lead.email}?subject=Following up on your inquiry`, '_blank');
      toast.success(`Opening email client for ${lead.name}`);
    } else if (lead.phone) {
      window.open(`sms:${lead.phone}`, '_blank');
      toast.success(`Opening messaging for ${lead.name}`);
    } else {
      toast.error("No contact information available");
    }
  };

  const handleBookCall = (lead: Lead) => {
    // For now, show a toast - in production this would integrate with a calendar
    toast.success(`Booking request initiated for ${lead.name}`, {
      description: "Calendar integration coming soon. For now, reach out directly.",
      action: lead.email ? {
        label: "Send Email",
        onClick: () => window.open(`mailto:${lead.email}?subject=Schedule a Call`, '_blank')
      } : undefined
    });
  };

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  const handleClearFilters = () => {
    setSelectedStages([]);
    setSelectedSources([]);
  };

  const getStageCounts = () => {
    const counts: Record<string, number> = {};
    Object.keys(stageConfig).forEach(stage => {
      counts[stage] = leads.filter(l => l.stage === stage).length;
    });
    return counts;
  };

  const stageCounts = getStageCounts();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Leads Inbox
          </h1>
          <p className="text-muted-foreground">
            Manage and nurture your leads through the pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  className="gap-2" 
                  onClick={handleScoreLeads}
                  disabled={scoring || leads.length === 0}
                >
                  {scoring ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Score All
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Auto-score leads based on source, contact info, and attribution</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setImportModalOpen(true)}>
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button className="gap-2 gradient-primary text-primary-foreground" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-6 gap-4">
        {Object.entries(stageConfig).map(([stage, config]) => (
          <div 
            key={stage}
            className={`p-4 rounded-xl bg-card/50 border text-center transition-all cursor-pointer ${
              selectedStages.includes(stage) 
                ? 'border-primary bg-primary/5' 
                : 'border-border/50 hover:border-border'
            }`}
            onClick={() => {
              if (selectedStages.includes(stage)) {
                setSelectedStages(selectedStages.filter(s => s !== stage));
              } else {
                setSelectedStages([...selectedStages, stage]);
              }
            }}
          >
            <p className="text-2xl font-bold text-foreground">{stageCounts[stage] || 0}</p>
            <StatusBadge status={config.status} label={config.label} className="mt-2" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-10 bg-card border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <LeadFilters
          stages={availableStages}
          sources={availableSources}
          selectedStages={selectedStages}
          selectedSources={selectedSources}
          sortField={sortField}
          sortOrder={sortOrder}
          onStageChange={setSelectedStages}
          onSourceChange={setSelectedSources}
          onSortChange={handleSortChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Leads Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Lead</TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold">Source</TableHead>
              <TableHead className="font-semibold">Stage</TableHead>
              <TableHead className="font-semibold">Score</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Loading leads...</p>
                </TableCell>
              </TableRow>
            ) : filteredAndSortedLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <User className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-foreground font-medium mb-1">
                    {leads.length === 0 ? "No leads yet" : "No leads match your filters"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {leads.length === 0 
                      ? "Import leads from CSV or add them manually"
                      : "Try adjusting your search or filter criteria"
                    }
                  </p>
                  {leads.length === 0 ? (
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="outline" onClick={() => setImportModalOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                      </Button>
                      <Button onClick={() => setAddModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Lead
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedLeads.map((lead) => {
                const stageInfo = stageConfig[lead.stage as keyof typeof stageConfig] || stageConfig.new;
                return (
                  <TableRow 
                    key={lead.id} 
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => handleViewDetails(lead)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground">
                          {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{lead.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {lead.email && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </p>
                        )}
                        {lead.phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{lead.source || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge 
                        status={stageInfo.status} 
                        label={stageInfo.label} 
                      />
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 cursor-help">
                              <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    (lead.score || 0) >= 70 ? 'bg-green-500' : 
                                    (lead.score || 0) >= 40 ? 'bg-yellow-500' : 'bg-muted-foreground'
                                  }`}
                                  style={{ width: `${lead.score || 0}%` }}
                                />
                              </div>
                              <span className={`text-sm font-medium ${getScoreColor(lead.score || 0)}`}>
                                {lead.score || 0}
                              </span>
                              <span className={`text-xs ${getScoreColor(lead.score || 0)}`}>
                                {getScoreLabel(lead.score || 0)}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              Score based on: source, contact info, UTM data, stage
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{lead.createdAt}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSendMessage(lead); }}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleBookCall(lead); }}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Call
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(lead); }}>
                            <User className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleScoreLead(lead.id, lead.name); }}>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Rescore Lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <ImportLeadsModal 
        open={importModalOpen} 
        onOpenChange={setImportModalOpen} 
        onSuccess={refetch}
      />
      <AddLeadModal 
        open={addModalOpen} 
        onOpenChange={setAddModalOpen} 
        onSuccess={refetch}
      />
      <LeadDetailsModal
        lead={selectedLead}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        onRescore={handleScoreLead}
        onSendMessage={handleSendMessage}
        onBookCall={handleBookCall}
      />
    </div>
  );
}
