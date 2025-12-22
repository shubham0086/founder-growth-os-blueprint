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
  Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const templates = [
  { id: "local", name: "Local Service", description: "Perfect for gyms, clinics, coaching" },
  { id: "d2c", name: "D2C Product", description: "Ideal for physical products" },
  { id: "b2b", name: "B2B Service", description: "Great for agencies, consultants" },
];

const pages = [
  {
    id: 1,
    title: "Fitness Transformation Program",
    slug: "transform-90-days",
    template: "Local Service",
    status: "published" as const,
    views: 1247,
    conversions: 47,
    lastEdited: "2 hours ago",
  },
  {
    id: 2,
    title: "Free Fitness Assessment",
    slug: "free-assessment",
    template: "Local Service",
    status: "draft" as const,
    views: 0,
    conversions: 0,
    lastEdited: "1 day ago",
  },
  {
    id: 3,
    title: "Corporate Wellness Program",
    slug: "corporate-wellness",
    template: "B2B Service",
    status: "draft" as const,
    views: 0,
    conversions: 0,
    lastEdited: "3 days ago",
  },
];

export default function LandingPages() {
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
        <Button className="gap-2 gradient-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
          Generate New Page
        </Button>
      </div>

      {/* Templates */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Start from Template</h2>
        <div className="grid grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card 
              key={template.id}
              className="bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
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
                      /{page.slug} • {page.template}
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        {page.views.toLocaleString()} views
                      </div>
                      <div className="text-muted-foreground">
                        {page.conversions} conversions
                      </div>
                      <div className="text-muted-foreground">
                        {page.views > 0 ? ((page.conversions / page.views) * 100).toFixed(1) : 0}% CVR
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </Button>
                    {page.status === 'published' && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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
      </div>
    </div>
  );
}
