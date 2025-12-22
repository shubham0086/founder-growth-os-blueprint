import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  FileText, 
  Video, 
  Palette, 
  Mail,
  Copy,
  MoreHorizontal,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const adCopies = [
  {
    id: 1,
    name: "Hook: Time Excuse Buster",
    content: "Think you don't have time to get fit? Our clients work 60+ hours a week and still transformed in 90 days. Here's how...",
    platform: "Meta",
    status: "approved" as const,
  },
  {
    id: 2,
    name: "Hook: Money Back Promise",
    content: "Transform your body in 90 days or get every rupee back. No questions asked. Join 500+ success stories.",
    platform: "Google",
    status: "draft" as const,
  },
  {
    id: 3,
    name: "Hook: Social Proof Lead",
    content: "Priya lost 12kg in 90 days while running her business. No extreme diets. No 2-hour workouts. Just a proven system.",
    platform: "Meta",
    status: "approved" as const,
  },
];

const videoScripts = [
  {
    id: 1,
    name: "UGC Testimonial Script",
    duration: "30 sec",
    type: "UGC",
    status: "approved" as const,
  },
  {
    id: 2,
    name: "Problem-Agitate-Solution",
    duration: "15 sec",
    type: "Hook",
    status: "draft" as const,
  },
];

const creativeBriefs = [
  {
    id: 1,
    name: "Before/After Carousel",
    format: "Carousel (5 slides)",
    platform: "Instagram",
    status: "approved" as const,
  },
  {
    id: 2,
    name: "Transformation Video",
    format: "Reels (30 sec)",
    platform: "Instagram/Meta",
    status: "draft" as const,
  },
];

export default function Assets() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Asset Factory
          </h1>
          <p className="text-muted-foreground">
            Generate ad copy, video scripts, and creative briefs.
          </p>
        </div>
        <Button className="gap-2 gradient-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
          Generate Assets
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ad-copy" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="ad-copy" className="gap-2 data-[state=active]:bg-background">
            <FileText className="h-4 w-4" />
            Ad Copy
          </TabsTrigger>
          <TabsTrigger value="video-scripts" className="gap-2 data-[state=active]:bg-background">
            <Video className="h-4 w-4" />
            Video Scripts
          </TabsTrigger>
          <TabsTrigger value="creative-briefs" className="gap-2 data-[state=active]:bg-background">
            <Palette className="h-4 w-4" />
            Creative Briefs
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2 data-[state=active]:bg-background">
            <Mail className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ad-copy" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Ad Copy Variants</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Copy
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {adCopies.map((copy) => (
              <Card key={copy.id} className="bg-card/50 border-border/50 hover:border-border transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{copy.name}</h3>
                      <StatusBadge 
                        status={copy.status === 'approved' ? 'success' : 'neutral'} 
                        label={copy.status} 
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy to Clipboard
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    "{copy.content}"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {copy.platform}
                    </span>
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="video-scripts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Video Scripts</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Script
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {videoScripts.map((script) => (
              <Card key={script.id} className="bg-card/50 border-border/50 hover:border-border transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10">
                      <Video className="h-6 w-6 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">{script.name}</h3>
                        <StatusBadge 
                          status={script.status === 'approved' ? 'success' : 'neutral'} 
                          label={script.status} 
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {script.duration} • {script.type}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">View Script</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="creative-briefs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Creative Briefs</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Brief
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {creativeBriefs.map((brief) => (
              <Card key={brief.id} className="bg-card/50 border-border/50 hover:border-border transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                      <Palette className="h-6 w-6 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">{brief.name}</h3>
                        <StatusBadge 
                          status={brief.status === 'approved' ? 'success' : 'neutral'} 
                          label={brief.status} 
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {brief.format} • {brief.platform}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">View Brief</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="email" className="flex items-center justify-center h-64">
          <div className="text-center">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">Email Templates</h3>
            <p className="text-sm text-muted-foreground mb-4">Generate email templates for follow-ups and nurture sequences.</p>
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Templates
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
