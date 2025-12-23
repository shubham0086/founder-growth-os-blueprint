import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Copy, Check, Trash2, FileText, Video, Palette, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Asset {
  id: string;
  name: string;
  type: string;
  content: string | null;
  status: string;
  tags: string[] | null;
  created_at: string;
}

interface AssetViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
}

const typeIcons = {
  ad_copy: FileText,
  video_script: Video,
  creative_brief: Palette,
  email: Mail,
};

const typeColors = {
  ad_copy: "bg-emerald-500/10 text-emerald-400",
  video_script: "bg-violet-500/10 text-violet-400",
  creative_brief: "bg-amber-500/10 text-amber-400",
  email: "bg-blue-500/10 text-blue-400",
};

export function AssetViewerModal({ open, onOpenChange, asset, onApprove, onDelete }: AssetViewerModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (asset.content) {
      navigator.clipboard.writeText(asset.content);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const Icon = typeIcons[asset.type as keyof typeof typeIcons] || FileText;
  const colorClass = typeColors[asset.type as keyof typeof typeColors] || "bg-muted text-muted-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                {asset.name}
                <StatusBadge 
                  status={asset.status === 'approved' ? 'success' : 'neutral'} 
                  label={asset.status} 
                />
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Created {new Date(asset.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto mt-4">
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
              {asset.content || 'No content available'}
            </pre>
          </div>
        </div>

        {asset.tags && asset.tags.length > 0 && (
          <div className="flex gap-2 mt-4">
            {asset.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-border/50 mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              onDelete(asset.id);
              onOpenChange(false);
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          
          <div className="flex gap-2">
            {asset.status !== 'approved' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onApprove(asset.id);
                  toast.success('Asset approved');
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
            <Button size="sm" className="gap-2" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Content'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}