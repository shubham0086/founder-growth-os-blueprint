import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Plus, 
  FileText, 
  ExternalLink, 
  Edit3, 
  Copy,
  MoreHorizontal,
  Eye,
  Sparkles,
  Loader2,
  Trash2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { useLandingPages, LandingPage } from "@/hooks/useLandingPages";
import { toast } from "sonner";
import { PageBuilderModal } from "@/components/landing-pages/PageBuilderModal";
import { Json } from "@/integrations/supabase/types";

const templates = [
  { id: "local", name: "Local Service", description: "Perfect for gyms, clinics, coaching" },
  { id: "d2c", name: "D2C Product", description: "Ideal for physical products" },
  { id: "b2b", name: "B2B Service", description: "Great for agencies, consultants" },
];

export default function LandingPages() {
  const { pages, loading, createPage, updatePage, deletePage } = useLandingPages();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPage, setNewPage] = useState({ title: '', slug: '' });
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);

  const handleCreate = async () => {
    try {
      await createPage({
        title: newPage.title,
        slug: newPage.slug || newPage.title.toLowerCase().replace(/\s+/g, '-'),
      });
      toast.success('Landing page created');
      setDialogOpen(false);
      setNewPage({ title: '', slug: '' });
    } catch (err) {
      toast.error('Failed to create page');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePage(id);
      toast.success('Page deleted');
    } catch (err) {
      toast.error('Failed to delete page');
    }
  };

  const handleSaveSections = async (sections: any[]) => {
    if (!editingPage) return;
    await updatePage(editingPage.id, { sections: sections as unknown as Json });
  };

  const handleDuplicate = async (page: LandingPage) => {
    try {
      await createPage({
        title: `${page.title} (Copy)`,
        slug: `${page.slug}-copy-${Date.now()}`,
        sections: page.sections,
      });
      toast.success('Page duplicated');
    } catch (err) {
      toast.error('Failed to duplicate page');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Landing Pages
          </h1>
          <p className="text-muted-foreground">
            Create high-converting landing pages for your offers.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
              Generate New Page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Landing Page</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Page Title</Label>
                <Input 
                  value={newPage.title}
                  onChange={(e) => setNewPage(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Free Fitness Assessment"
                />
              </div>
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input 
                  value={newPage.slug}
                  onChange={(e) => setNewPage(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g., free-assessment"
                />
              </div>
              <Button onClick={handleCreate} className="w-full">Create Page</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Start from Template</h2>
        <div className="grid grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card 
              key={template.id}
              className="bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
              onClick={() => {
                setNewPage({ title: template.name + ' Page', slug: template.id + '-page' });
                setDialogOpen(true);
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <Plus className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-medium text-foreground mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pages List */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Your Pages</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pages.length === 0 ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-foreground font-medium mb-1">No landing pages yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first landing page to start converting</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Page
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pages.map((page) => (
              <Card 
                key={page.id}
                className="bg-card/50 border-border/50 hover:border-border transition-all"
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-6">
                    {/* Thumbnail */}
                    <div className="w-40 h-24 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center shrink-0 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-b from-primary/5 to-transparent flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-foreground truncate">
                          {page.title}
                        </h3>
                        <StatusBadge 
                          status={page.status === 'published' ? 'success' : 'neutral'} 
                          label={page.status} 
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        /{page.slug}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => setEditingPage(page)}>
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </Button>
                      {page.status === 'published' && page.published_url && (
                        <Button variant="outline" size="sm" className="gap-2" asChild>
                          <a href={page.published_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            View
                          </a>
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDuplicate(page)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(page.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Page Builder Modal */}
      {editingPage && (
        <PageBuilderModal
          open={!!editingPage}
          onOpenChange={(open) => !open && setEditingPage(null)}
          page={{
            id: editingPage.id,
            title: editingPage.title,
            slug: editingPage.slug,
            sections: editingPage.sections as any,
          }}
          onSave={handleSaveSections}
        />
      )}
    </div>
  );
}
