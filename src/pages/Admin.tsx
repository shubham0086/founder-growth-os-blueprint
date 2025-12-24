import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/safeClient';
import { useAuth } from '@/hooks/useAuth';
import { siteConfig } from '@/lib/siteConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Loader2, 
  Download, 
  Search, 
  RefreshCw, 
  Mail, 
  Phone, 
  Calendar,
  Building,
  Target,
  TrendingUp,
  Eye,
  LogOut
} from 'lucide-react';

interface PublicLead {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  business_type: string | null;
  revenue_range: string | null;
  goal: string | null;
  status: string;
  notes: string | null;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-500' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
  { value: 'qualified', label: 'Qualified', color: 'bg-green-500' },
  { value: 'proposal', label: 'Proposal', color: 'bg-purple-500' },
  { value: 'won', label: 'Won', color: 'bg-emerald-500' },
  { value: 'lost', label: 'Lost', color: 'bg-red-500' },
];

export default function Admin() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<PublicLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<PublicLead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  // Check if user is admin
  const isAdmin = user?.email === siteConfig.ADMIN_EMAIL;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/admin');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchLeads();
    }
  }, [user, isAdmin]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      // Note: This query will work because the authenticated user triggers the RLS policy
      const { data, error } = await supabase
        .from('public_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads((data as PublicLead[]) || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('public_leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
      toast.success('Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const saveNotes = async () => {
    if (!selectedLead) return;
    
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('public_leads')
        .update({ notes: editedNotes })
        .eq('id', selectedLead.id);

      if (error) throw error;
      
      setLeads(prev => prev.map(lead => 
        lead.id === selectedLead.id ? { ...lead, notes: editedNotes } : lead
      ));
      setSelectedLead(prev => prev ? { ...prev, notes: editedNotes } : null);
      toast.success('Notes saved');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Business Type', 'Revenue Range', 'Goal', 'Status', 'Source', 'Created At', 'Notes'];
    const rows = filteredLeads.map(lead => [
      lead.name,
      lead.email || '',
      lead.phone || '',
      lead.business_type || '',
      lead.revenue_range || '',
      lead.goal || '',
      lead.status,
      lead.source || '',
      format(new Date(lead.created_at), 'yyyy-MM-dd HH:mm'),
      lead.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('CSV exported');
  };

  const openLeadDrawer = (lead: PublicLead) => {
    setSelectedLead(lead);
    setEditedNotes(lead.notes || '');
    setDrawerOpen(true);
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchQuery || 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Badge variant="outline" className="gap-1.5">
        <span className={`h-2 w-2 rounded-full ${option?.color || 'bg-gray-500'}`} />
        {option?.label || status}
      </Badge>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Logged in as: {user.email}
            </p>
            <Button onClick={() => signOut()} variant="outline" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button onClick={() => signOut()} variant="ghost" size="sm">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lead Management</CardTitle>
                <CardDescription>
                  {leads.length} total leads • {filteredLeads.length} showing
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={fetchLeads} variant="outline" size="sm" disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={exportCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No leads found
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Goal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {lead.email && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {lead.business_type && (
                              <div className="flex items-center gap-1.5">
                                <Building className="h-3 w-3 text-muted-foreground" />
                                {lead.business_type}
                              </div>
                            )}
                            {lead.revenue_range && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <TrendingUp className="h-3 w-3" />
                                {lead.revenue_range}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.goal && (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Target className="h-3 w-3 text-muted-foreground" />
                              {lead.goal}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={lead.status} 
                            onValueChange={(value) => updateLeadStatus(lead.id, value)}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              {getStatusBadge(lead.status)}
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(lead.created_at), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openLeadDrawer(lead)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Lead Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {selectedLead && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedLead.name}</SheetTitle>
                <SheetDescription>
                  Lead details and notes
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedLead.email || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedLead.phone || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Business Type</Label>
                    <p className="font-medium">{selectedLead.business_type || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Revenue Range</Label>
                    <p className="font-medium">{selectedLead.revenue_range || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Goal</Label>
                    <p className="font-medium">{selectedLead.goal || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Source</Label>
                    <p className="font-medium">{selectedLead.source || 'N/A'}</p>
                  </div>
                  {(selectedLead.utm_source || selectedLead.utm_medium || selectedLead.utm_campaign) && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">UTM Parameters</Label>
                      <div className="text-sm space-y-0.5">
                        {selectedLead.utm_source && <p>Source: {selectedLead.utm_source}</p>}
                        {selectedLead.utm_medium && <p>Medium: {selectedLead.utm_medium}</p>}
                        {selectedLead.utm_campaign && <p>Campaign: {selectedLead.utm_campaign}</p>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Add notes about this lead..."
                    rows={4}
                  />
                  <Button 
                    onClick={saveNotes} 
                    disabled={savingNotes || editedNotes === (selectedLead.notes || '')}
                    size="sm"
                  >
                    {savingNotes ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Notes'
                    )}
                  </Button>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  {selectedLead.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`mailto:${selectedLead.email}`)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  )}
                  {selectedLead.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`tel:${selectedLead.phone}`)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
