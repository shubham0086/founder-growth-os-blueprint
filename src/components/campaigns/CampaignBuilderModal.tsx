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
import { 
  Plus, 
  Trash2, 
  Save, 
  Loader2,
  Target,
  DollarSign,
  Users,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface AdGroup {
  id: string;
  name: string;
  targeting: {
    ages: string;
    genders: string;
    interests: string;
    locations: string;
  };
  dailyBudget: number;
  ads: { id: string; headline: string; description: string }[];
}

interface CampaignStructure {
  objective: string;
  adGroups: AdGroup[];
}

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: string;
  structure: Json | null;
  budget_rules: Json | null;
}

interface CampaignBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign;
  onSave: (updates: { structure: CampaignStructure; budget_rules: any }) => Promise<void>;
}

const objectives = [
  { value: 'lead_generation', label: 'Lead Generation' },
  { value: 'conversions', label: 'Conversions' },
  { value: 'traffic', label: 'Website Traffic' },
  { value: 'awareness', label: 'Brand Awareness' },
  { value: 'engagement', label: 'Engagement' },
];

const defaultAdGroup: Omit<AdGroup, 'id'> = {
  name: 'Ad Group 1',
  targeting: {
    ages: '25-54',
    genders: 'All',
    interests: '',
    locations: '',
  },
  dailyBudget: 500,
  ads: [],
};

export function CampaignBuilderModal({ open, onOpenChange, campaign, onSave }: CampaignBuilderModalProps) {
  const [saving, setSaving] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  
  const existingStructure = campaign.structure as unknown as CampaignStructure | null;
  
  const [objective, setObjective] = useState(existingStructure?.objective || 'lead_generation');
  const [adGroups, setAdGroups] = useState<AdGroup[]>(
    existingStructure?.adGroups || [{ ...defaultAdGroup, id: crypto.randomUUID() }]
  );
  const [dailyBudget, setDailyBudget] = useState(
    (campaign.budget_rules as unknown as { dailyBudget?: number })?.dailyBudget || 1000
  );

  const addAdGroup = () => {
    const newGroup: AdGroup = {
      ...defaultAdGroup,
      id: crypto.randomUUID(),
      name: `Ad Group ${adGroups.length + 1}`,
    };
    setAdGroups([...adGroups, newGroup]);
    setExpandedGroup(newGroup.id);
  };

  const removeAdGroup = (id: string) => {
    setAdGroups(adGroups.filter(g => g.id !== id));
  };

  const updateAdGroup = (id: string, updates: Partial<AdGroup>) => {
    setAdGroups(adGroups.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const updateTargeting = (id: string, field: keyof AdGroup['targeting'], value: string) => {
    setAdGroups(adGroups.map(g => 
      g.id === id 
        ? { ...g, targeting: { ...g.targeting, [field]: value } } 
        : g
    ));
  };

  const addAd = (groupId: string) => {
    setAdGroups(adGroups.map(g => 
      g.id === groupId 
        ? { 
            ...g, 
            ads: [...g.ads, { id: crypto.randomUUID(), headline: '', description: '' }] 
          } 
        : g
    ));
  };

  const updateAd = (groupId: string, adId: string, field: 'headline' | 'description', value: string) => {
    setAdGroups(adGroups.map(g => 
      g.id === groupId 
        ? { 
            ...g, 
            ads: g.ads.map(a => a.id === adId ? { ...a, [field]: value } : a)
          } 
        : g
    ));
  };

  const removeAd = (groupId: string, adId: string) => {
    setAdGroups(adGroups.map(g => 
      g.id === groupId 
        ? { ...g, ads: g.ads.filter(a => a.id !== adId) } 
        : g
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        structure: { objective, adGroups },
        budget_rules: { dailyBudget, adGroupBudgets: adGroups.map(g => ({ id: g.id, budget: g.dailyBudget })) },
      });
      toast.success('Campaign saved');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Campaign Builder: {campaign.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto space-y-6 py-4">
          {/* Campaign Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Campaign Objective</Label>
              <Select value={objective} onValueChange={setObjective}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {objectives.map(obj => (
                    <SelectItem key={obj.value} value={obj.value}>
                      {obj.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Daily Budget (₹)</Label>
              <Input
                type="number"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>

          {/* Ad Groups */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Ad Groups ({adGroups.length})</Label>
              <Button variant="outline" size="sm" onClick={addAdGroup} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Ad Group
              </Button>
            </div>

            {adGroups.map((group, index) => (
              <Card key={group.id} className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  {/* Group Header */}
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                  >
                    {expandedGroup === group.id ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <Input
                        value={group.name}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateAdGroup(group.id, { name: e.target.value });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium h-8 w-48"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ₹{group.dailyBudget}/day • {group.ads.length} ads
                    </span>
                    {adGroups.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAdGroup(group.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {expandedGroup === group.id && (
                    <div className="mt-4 space-y-4 pt-4 border-t border-border/50">
                      {/* Targeting */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Target className="h-4 w-4 text-primary" />
                          Targeting
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Age Range</Label>
                            <Input
                              value={group.targeting.ages}
                              onChange={(e) => updateTargeting(group.id, 'ages', e.target.value)}
                              placeholder="e.g., 25-54"
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Genders</Label>
                            <Select 
                              value={group.targeting.genders} 
                              onValueChange={(v) => updateTargeting(group.id, 'genders', v)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="All">All</SelectItem>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Locations</Label>
                            <Input
                              value={group.targeting.locations}
                              onChange={(e) => updateTargeting(group.id, 'locations', e.target.value)}
                              placeholder="e.g., Mumbai, Delhi"
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Interests</Label>
                            <Input
                              value={group.targeting.interests}
                              onChange={(e) => updateTargeting(group.id, 'interests', e.target.value)}
                              placeholder="e.g., Fitness, Health"
                              className="h-8"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Budget */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <DollarSign className="h-4 w-4 text-primary" />
                          Ad Group Budget
                        </div>
                        <Input
                          type="number"
                          value={group.dailyBudget}
                          onChange={(e) => updateAdGroup(group.id, { dailyBudget: parseInt(e.target.value) || 0 })}
                          className="w-32 h-8"
                          min={0}
                        />
                      </div>

                      {/* Ads */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Users className="h-4 w-4 text-primary" />
                            Ads ({group.ads.length})
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => addAd(group.id)} className="gap-1 h-7">
                            <Plus className="h-3 w-3" />
                            Add Ad
                          </Button>
                        </div>
                        
                        {group.ads.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-3">
                            No ads yet. Add one to get started.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {group.ads.map((ad, adIndex) => (
                              <div key={ad.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-muted-foreground">Ad {adIndex + 1}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => removeAd(group.id, ad.id)}
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </div>
                                <Input
                                  value={ad.headline}
                                  onChange={(e) => updateAd(group.id, ad.id, 'headline', e.target.value)}
                                  placeholder="Headline"
                                  className="h-8"
                                />
                                <Textarea
                                  value={ad.description}
                                  onChange={(e) => updateAd(group.id, ad.id, 'description', e.target.value)}
                                  placeholder="Ad description..."
                                  className="min-h-[60px] text-sm"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Campaign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}