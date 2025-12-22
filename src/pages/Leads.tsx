import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Search, 
  Filter, 
  User,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  ArrowUpDown,
  MessageSquare,
  Upload,
  Download,
  Plus,
  Loader2
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
import { useLeads } from "@/hooks/useLeads";
import { ImportLeadsModal } from "@/components/data-import/ImportLeadsModal";
import { AddLeadModal } from "@/components/data-import/AddLeadModal";
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

export default function Leads() {
  const { leads, loading, refetch } = useLeads();
  const [searchQuery, setSearchQuery] = useState("");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            className="p-4 rounded-xl bg-card/50 border border-border/50 text-center hover:border-border transition-all cursor-pointer"
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
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" className="gap-2">
          <ArrowUpDown className="h-4 w-4" />
          Sort
        </Button>
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
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <User className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-foreground font-medium mb-1">No leads yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Import leads from CSV or add them manually
                  </p>
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
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => {
                const stageInfo = stageConfig[lead.stage as keyof typeof stageConfig] || stageConfig.new;
                return (
                  <TableRow 
                    key={lead.id} 
                    className="hover:bg-muted/30 cursor-pointer"
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
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${lead.score || 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{lead.score || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{lead.createdAt}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Call
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <User className="h-4 w-4 mr-2" />
                            View Details
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
    </div>
  );
}
