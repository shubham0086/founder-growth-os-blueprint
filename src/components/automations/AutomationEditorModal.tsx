import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Automation {
  id: string;
  name: string;
  trigger_event: string;
  channel: string;
  template: string | null;
  delay_hours: number | null;
  sequence_order: number | null;
}

interface AutomationEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation: Automation;
  onSave: (updates: Partial<Automation>) => Promise<void>;
}

const templatePlaceholders = {
  email: `Hi {{name}},

Thanks for reaching out! I wanted to personally follow up on your inquiry.

{{custom_message}}

Looking forward to helping you achieve your goals.

Best,
{{business_name}}`,
  whatsapp: `Hi {{name}}! 👋

Thanks for your interest. Quick question - what's the best time for a quick call this week?

Reply with your preferred time and I'll set it up.`,
  sms: `Hi {{name}}, this is {{business_name}}. Thanks for reaching out! Reply YES to schedule a free consultation.`,
};

export function AutomationEditorModal({ open, onOpenChange, automation, onSave }: AutomationEditorModalProps) {
  const [name, setName] = useState(automation.name);
  const [triggerEvent, setTriggerEvent] = useState(automation.trigger_event);
  const [channel, setChannel] = useState(automation.channel);
  const [template, setTemplate] = useState(automation.template || '');
  const [delayHours, setDelayHours] = useState(automation.delay_hours || 0);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!template && channel) {
      setTemplate(templatePlaceholders[channel as keyof typeof templatePlaceholders] || '');
    }
  }, [channel]);

  const handleGenerateTemplate = async () => {
    setGenerating(true);
    try {
      // Simulate AI generation with a template based on trigger
      const triggerTemplates: Record<string, string> = {
        new_lead: `Hi {{name}},

Welcome! I noticed you just signed up. I'm here to help you get the most out of our services.

Here's what happens next:
1. I'll review your needs
2. We'll schedule a quick discovery call
3. Create a custom plan for you

What's the best time to chat?

Best,
{{business_name}}`,
        lead_not_responded: `Hi {{name}},

Just checking in - I sent you a message yesterday and wanted to make sure it didn't get lost.

I know things get busy! If you have 5 minutes, I'd love to hear about your goals.

No pressure at all - just reply when you're ready.

Cheers,
{{business_name}}`,
        lead_contacted: `Hi {{name}},

Great chatting with you! As promised, here's what we discussed:

{{summary}}

Next steps:
- {{next_step}}

Let me know if you have any questions!

{{business_name}}`,
        lead_inactive: `Hi {{name}},

It's been a while since we connected. I hope you're doing well!

I wanted to share some new updates that might interest you:
- {{update_1}}
- {{update_2}}

Would love to reconnect - are you available for a quick call this week?

{{business_name}}`,
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      setTemplate(triggerTemplates[triggerEvent] || templatePlaceholders[channel as keyof typeof templatePlaceholders] || '');
      toast.success('Template generated!');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        name,
        trigger_event: triggerEvent,
        channel,
        template: template || null,
        delay_hours: delayHours || null,
      });
      toast.success('Automation saved');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Automation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Welcome Sequence"
              />
            </div>
            <div className="space-y-2">
              <Label>Delay (hours)</Label>
              <Input
                type="number"
                value={delayHours}
                onChange={(e) => setDelayHours(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trigger</Label>
              <Select value={triggerEvent} onValueChange={setTriggerEvent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_lead">New lead captured</SelectItem>
                  <SelectItem value="lead_not_responded">Lead not responded (24h)</SelectItem>
                  <SelectItem value="lead_contacted">Lead stage = Contacted</SelectItem>
                  <SelectItem value="lead_inactive">Lead inactive (14 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={(v) => {
                setChannel(v);
                setTemplate(templatePlaceholders[v as keyof typeof templatePlaceholders] || '');
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Message Template</Label>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-primary"
                onClick={handleGenerateTemplate}
                disabled={generating}
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate with AI
              </Button>
            </div>
            <Textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="min-h-[200px] font-mono text-sm bg-background/50"
              placeholder="Write your message template here..."
            />
            <p className="text-xs text-muted-foreground">
              Use {`{{name}}`}, {`{{email}}`}, {`{{business_name}}`} as placeholders
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}