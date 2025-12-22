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
  Plus,
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
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssets } from "@/hooks/useAssets";
import { toast } from "sonner";

export default function Assets() {
  const { assets, loading, generating, generateAsset, updateAssetStatus, deleteAsset, getAssetsByType } = useAssets();
  const [prompt, setPrompt] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentType, setCurrentType] = useState<'ad_copy' | 'video_script' | 'creative_brief' | 'email'>('ad_copy');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    await generateAsset(currentType, prompt);
    setPrompt("");
    setDialogOpen(false);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const adCopies = getAssetsByType('ad_copy');
  const videoScripts = getAssetsByType('video_script');
  const creativeBriefs = getAssetsByType('creative_brief');
  const emails = getAssetsByType('email');

  const openGenerateDialog = (type: 'ad_copy' | 'video_script' | 'creative_brief' | 'email') => {
    setCurrentType(type);
    setDialogOpen(true);
  };

  const getPlaceholder = () => {
    switch (currentType) {
      case 'ad_copy': return "e.g., Write a compelling ad for busy professionals who want to get fit in 90 days";
      case 'video_script': return "e.g., Create a 30-second UGC testimonial script for a weight loss success story";
      case 'creative_brief': return "e.g., Design a carousel post showing before/after transformation results";
      case 'email': return "e.g., Write a follow-up email for leads who booked a consultation but didn't show up";
      default: return "Describe what you want to generate...";
    }
  };

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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary text-primary-foreground" onClick={() => openGenerateDialog('ad_copy')}>
              <Sparkles className="h-4 w-4" />
              Generate Assets
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate {currentType.replace('_', ' ')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Textarea
                placeholder={getPlaceholder()}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
              <Button 
                className="w-full gap-2" 
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {generating ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ad-copy" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="ad-copy" className="gap-2 data-[state=active]:bg-background">
            <FileText className="h-4 w-4" />
            Ad Copy ({adCopies.length})
          </TabsTrigger>
          <TabsTrigger value="video-scripts" className="gap-2 data-[state=active]:bg-background">
            <Video className="h-4 w-4" />
            Video Scripts ({videoScripts.length})
          </TabsTrigger>
          <TabsTrigger value="creative-briefs" className="gap-2 data-[state=active]:bg-background">
            <Palette className="h-4 w-4" />
            Creative Briefs ({creativeBriefs.length})
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2 data-[state=active]:bg-background">
            <Mail className="h-4 w-4" />
            Email Templates ({emails.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ad-copy" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Ad Copy Variants</h2>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => openGenerateDialog('ad_copy')}>
              <Plus className="h-4 w-4" />
              New Copy
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
          ) : adCopies.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No ad copy generated yet.</p>
                <Button onClick={() => openGenerateDialog('ad_copy')} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Ad Copy
                </Button>
              </CardContent>
            </Card>
          ) : (
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
                          <DropdownMenuItem onClick={() => copy.content && handleCopy(copy.content)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy to Clipboard
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateAssetStatus(copy.id, 'approved')}>
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteAsset(copy.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      "{copy.content}"
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(copy.created_at).toLocaleDateString()}
                      </span>
                      <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => copy.content && handleCopy(copy.content)}>
                        <Copy className="h-3 w-3" />
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="video-scripts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Video Scripts</h2>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => openGenerateDialog('video_script')}>
              <Plus className="h-4 w-4" />
              New Script
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : videoScripts.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No video scripts generated yet.</p>
                <Button onClick={() => openGenerateDialog('video_script')} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Script
                </Button>
              </CardContent>
            </Card>
          ) : (
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
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {script.content}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => script.content && handleCopy(script.content)}>
                        View Script
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="creative-briefs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Creative Briefs</h2>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => openGenerateDialog('creative_brief')}>
              <Plus className="h-4 w-4" />
              New Brief
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : creativeBriefs.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Palette className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No creative briefs generated yet.</p>
                <Button onClick={() => openGenerateDialog('creative_brief')} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Brief
                </Button>
              </CardContent>
            </Card>
          ) : (
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
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {brief.content}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => brief.content && handleCopy(brief.content)}>
                        View Brief
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Email Templates</h2>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => openGenerateDialog('email')}>
              <Plus className="h-4 w-4" />
              New Email
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : emails.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No email templates generated yet.</p>
                <Button onClick={() => openGenerateDialog('email')} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Templates
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {emails.map((email) => (
                <Card key={email.id} className="bg-card/50 border-border/50 hover:border-border transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                        <Mail className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground">{email.name}</h3>
                          <StatusBadge 
                            status={email.status === 'approved' ? 'success' : 'neutral'} 
                            label={email.status} 
                          />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {email.content}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => email.content && handleCopy(email.content)}>
                        View Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
