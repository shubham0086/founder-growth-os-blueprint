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
  MessageSquare
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

const leads = [
  {
    id: 1,
    name: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    phone: "+91 98765 43210",
    source: "Google Ads",
    stage: "new" as const,
    score: 85,
    createdAt: "2 mins ago",
  },
  {
    id: 2,
    name: "Rahul Verma",
    email: "rahul.v@outlook.com",
    phone: "+91 98765 43211",
    source: "Landing Page",
    stage: "contacted" as const,
    score: 72,
    createdAt: "1 hour ago",
  },
  {
    id: 3,
    name: "Anita Desai",
    email: "anita.desai@company.com",
    phone: "+91 98765 43212",
    source: "WhatsApp",
    stage: "booked" as const,
    score: 92,
    createdAt: "3 hours ago",
  },
  {
    id: 4,
    name: "Vikram Singh",
    email: "vikram.singh@gmail.com",
    phone: "+91 98765 43213",
    source: "Meta Ads",
    stage: "qualified" as const,
    score: 88,
    createdAt: "1 day ago",
  },
  {
    id: 5,
    name: "Meera Patel",
    email: "meera.p@yahoo.com",
    phone: "+91 98765 43214",
    source: "Referral",
    stage: "won" as const,
    score: 95,
    createdAt: "2 days ago",
  },
  {
    id: 6,
    name: "Arjun Nair",
    email: "arjun.nair@gmail.com",
    phone: "+91 98765 43215",
    source: "Google Ads",
    stage: "lost" as const,
    score: 45,
    createdAt: "3 days ago",
  },
];

const stageConfig = {
  new: { status: "info" as const, label: "New" },
  contacted: { status: "warning" as const, label: "Contacted" },
  booked: { status: "info" as const, label: "Booked" },
  qualified: { status: "success" as const, label: "Qualified" },
  won: { status: "success" as const, label: "Won" },
  lost: { status: "error" as const, label: "Lost" },
};

export default function Leads() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Button className="gap-2 gradient-primary text-primary-foreground">
          <User className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-6 gap-4">
        {Object.entries(stageConfig).map(([stage, config]) => {
          const count = leads.filter(l => l.stage === stage).length;
          return (
            <div 
              key={stage}
              className="p-4 rounded-xl bg-card/50 border border-border/50 text-center hover:border-border transition-all cursor-pointer"
            >
              <p className="text-2xl font-bold text-foreground">{count}</p>
              <StatusBadge status={config.status} label={config.label} className="mt-2" />
            </div>
          );
        })}
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
            {filteredLeads.map((lead) => (
              <TableRow 
                key={lead.id} 
                className="hover:bg-muted/30 cursor-pointer"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground">
                      {lead.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {lead.email}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {lead.phone}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{lead.source}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge 
                    status={stageConfig[lead.stage].status} 
                    label={stageConfig[lead.stage].label} 
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${lead.score}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{lead.score}</span>
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
