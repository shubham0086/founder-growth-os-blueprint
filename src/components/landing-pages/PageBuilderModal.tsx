import { useState } from "react";
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
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Image, 
  Type, 
  List,
  MessageSquare,
  Star,
  ArrowRight,
  Save,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Section {
  id: string;
  type: 'hero' | 'features' | 'testimonial' | 'cta' | 'text';
  content: Record<string, string>;
}

interface PageBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: {
    id: string;
    title: string;
    slug: string;
    sections: Section[] | null;
  };
  onSave: (sections: Section[]) => Promise<void>;
}

const sectionTypes = [
  { type: 'hero', label: 'Hero Section', icon: Image, description: 'Main headline with CTA' },
  { type: 'features', label: 'Features', icon: List, description: 'List key benefits' },
  { type: 'testimonial', label: 'Testimonial', icon: MessageSquare, description: 'Customer quote' },
  { type: 'cta', label: 'Call to Action', icon: ArrowRight, description: 'Conversion button' },
  { type: 'text', label: 'Text Block', icon: Type, description: 'Rich text content' },
] as const;

const defaultContent: Record<string, Record<string, string>> = {
  hero: { headline: 'Your Headline Here', subheadline: 'Supporting text that explains your offer', buttonText: 'Get Started' },
  features: { feature1: 'Fast Results', feature2: 'Expert Support', feature3: 'Proven System' },
  testimonial: { quote: '"This changed my business..."', author: 'John Doe', role: 'Business Owner' },
  cta: { headline: 'Ready to get started?', buttonText: 'Book a Call', subtext: 'Free consultation' },
  text: { content: 'Add your content here...' },
};

export function PageBuilderModal({ open, onOpenChange, page, onSave }: PageBuilderModalProps) {
  const [sections, setSections] = useState<Section[]>(
    (page.sections as Section[]) || []
  );
  const [saving, setSaving] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const addSection = (type: Section['type']) => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      type,
      content: { ...defaultContent[type] },
    };
    setSections([...sections, newSection]);
    setSelectedSection(newSection.id);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
    if (selectedSection === id) setSelectedSection(null);
  };

  const updateSectionContent = (id: string, key: string, value: string) => {
    setSections(sections.map(s => 
      s.id === id ? { ...s, content: { ...s.content, [key]: value } } : s
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(sections);
      toast.success('Page saved successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const selectedSectionData = sections.find(s => s.id === selectedSection);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit: {page.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Sections List */}
          <div className="w-64 flex flex-col gap-4 overflow-auto">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Page Sections</Label>
              {sections.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No sections yet. Add one below.
                </p>
              ) : (
                <div className="space-y-2">
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      onClick={() => setSelectedSection(section.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                        selectedSection === section.id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border/50 hover:border-border'
                      }`}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-sm capitalize">{section.type}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSection(section.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border/50 pt-4">
              <Label className="text-xs text-muted-foreground mb-2 block">Add Section</Label>
              <div className="space-y-1">
                {sectionTypes.map((st) => (
                  <Button
                    key={st.type}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-auto py-2"
                    onClick={() => addSection(st.type)}
                  >
                    <st.icon className="h-4 w-4" />
                    <div className="text-left">
                      <div className="text-sm">{st.label}</div>
                      <div className="text-xs text-muted-foreground">{st.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Section Editor */}
          <div className="flex-1 border-l border-border/50 pl-4 overflow-auto">
            {selectedSectionData ? (
              <div className="space-y-4">
                <h3 className="font-medium capitalize">{selectedSectionData.type} Settings</h3>
                {Object.entries(selectedSectionData.content).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                    {value.length > 50 ? (
                      <Textarea
                        value={value}
                        onChange={(e) => updateSectionContent(selectedSectionData.id, key, e.target.value)}
                        className="bg-background/50"
                      />
                    ) : (
                      <Input
                        value={value}
                        onChange={(e) => updateSectionContent(selectedSectionData.id, key, e.target.value)}
                        className="bg-background/50"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Type className="h-12 w-12 mb-4 opacity-50" />
                <p>Select a section to edit</p>
                <p className="text-sm">or add a new section from the left panel</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}