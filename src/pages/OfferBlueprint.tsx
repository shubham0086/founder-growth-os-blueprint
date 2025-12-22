import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Target, 
  Sparkles, 
  Check, 
  Edit3, 
  Shield,
  Star,
  Zap,
  Plus,
  Loader2,
  Trash2
} from "lucide-react";
import { Json } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOfferBlueprint } from "@/hooks/useOfferBlueprint";
import { toast } from "sonner";

interface Tier {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular: boolean;
}

interface Objection {
  objection: string;
  response: string;
}

export default function OfferBlueprint() {
  const { blueprint, loading, createBlueprint, updateBlueprint } = useOfferBlueprint();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    promise: '',
    mechanism: '',
    proof: '',
  });
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [objections, setObjections] = useState<Objection[]>([]);

  useEffect(() => {
    if (blueprint) {
      setFormData({
        promise: blueprint.promise || '',
        mechanism: blueprint.mechanism || '',
        proof: blueprint.proof || '',
      });
      setTiers((blueprint.tiers as unknown as Tier[]) || []);
      setObjections((blueprint.objections as unknown as Objection[]) || []);
    }
  }, [blueprint]);

  const handleSave = async () => {
    try {
      if (blueprint) {
        await updateBlueprint(blueprint.id, {
          promise: formData.promise,
          mechanism: formData.mechanism,
          proof: formData.proof,
          tiers: tiers as unknown as Json,
          objections: objections as unknown as Json,
        });
      } else {
        await createBlueprint({
          name: 'Main Offer',
          promise: formData.promise,
          mechanism: formData.mechanism,
          proof: formData.proof,
          tiers: tiers as unknown as Json,
          objections: objections as unknown as Json,
        });
      }
      toast.success('Blueprint saved');
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to save blueprint');
    }
  };

  const handleApprove = async () => {
    if (!blueprint) return;
    try {
      await updateBlueprint(blueprint.id, { status: 'approved' });
      toast.success('Blueprint approved');
    } catch (err) {
      toast.error('Failed to approve blueprint');
    }
  };

  const addTier = () => {
    setTiers([...tiers, {
      name: 'New Tier',
      price: '₹0',
      period: '/month',
      features: [],
      popular: false,
    }]);
  };

  const addObjection = () => {
    setObjections([...objections, {
      objection: '',
      response: '',
    }]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!blueprint && !isEditing) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Offer Blueprint</h1>
            <p className="text-muted-foreground">Define your offer, pricing, and objection handling.</p>
          </div>
        </div>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-1">No offer blueprint yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create your offer blueprint to define your value proposition</p>
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Blueprint
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground">
              Offer Blueprint
            </h1>
            <StatusBadge 
              status={blueprint?.status === 'approved' ? 'success' : 'warning'} 
              label={blueprint?.status === 'approved' ? 'Approved' : `Draft v${blueprint?.version || 1}`} 
            />
          </div>
          <p className="text-muted-foreground">
            Define your offer, pricing, and objection handling.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => {
            if (isEditing) handleSave();
            else setIsEditing(true);
          }}>
            <Edit3 className="h-4 w-4" />
            {isEditing ? "Save Changes" : "Edit"}
          </Button>
          {blueprint && blueprint.status !== 'approved' && (
            <Button className="gap-2 gradient-primary text-primary-foreground" onClick={handleApprove}>
              <Check className="h-4 w-4" />
              Approve Blueprint
            </Button>
          )}
        </div>
      </div>

      {/* Core Promise Section */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Core Promise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Main Promise
              </label>
              <Textarea 
                className="bg-background/50 border-border min-h-[100px]"
                value={formData.promise}
                onChange={(e) => setFormData(prev => ({ ...prev, promise: e.target.value }))}
                placeholder="What transformation do you promise?"
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Mechanism (How it works)
              </label>
              <Textarea 
                className="bg-background/50 border-border min-h-[80px]"
                value={formData.mechanism}
                onChange={(e) => setFormData(prev => ({ ...prev, mechanism: e.target.value }))}
                placeholder="How do you deliver on your promise?"
                readOnly={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              Proof & Guarantee
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Social Proof
              </label>
              <Textarea 
                className="bg-background/50 border-border min-h-[80px]"
                value={formData.proof}
                onChange={(e) => setFormData(prev => ({ ...prev, proof: e.target.value }))}
                placeholder="Testimonials, ratings, results..."
                readOnly={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Tiers */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            Pricing Tiers
          </h2>
          {isEditing && (
            <Button variant="outline" size="sm" onClick={addTier}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tier
            </Button>
          )}
        </div>

        {tiers.length === 0 ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">No pricing tiers defined</p>
              {isEditing && (
                <Button variant="outline" onClick={addTier}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tier
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {tiers.map((tier, index) => (
              <Card 
                key={index}
                className={`relative overflow-hidden transition-all duration-300 ${
                  tier.popular 
                    ? 'border-primary/50 bg-gradient-to-b from-primary/5 to-card/50 shadow-lg shadow-primary/5' 
                    : 'bg-card/50 border-border/50 hover:border-border'
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    {isEditing ? (
                      <Input 
                        className="text-center font-semibold mb-2"
                        value={tier.name}
                        onChange={(e) => {
                          const updated = [...tiers];
                          updated[index].name = e.target.value;
                          setTiers(updated);
                        }}
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {tier.name}
                      </h3>
                    )}
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-foreground">
                        {tier.price}
                      </span>
                      <span className="text-muted-foreground">{tier.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-6 ${tier.popular ? 'gradient-primary text-primary-foreground' : ''}`}
                    variant={tier.popular ? "default" : "outline"}
                  >
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Objection Handling */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Objection Responses
          </CardTitle>
          {isEditing && (
            <Button variant="outline" size="sm" onClick={addObjection}>
              <Plus className="h-4 w-4 mr-2" />
              Add Objection
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {objections.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No objections defined</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {objections.map((item, index) => (
                <div key={index} className="p-4 rounded-xl bg-background/50 border border-border/50">
                  {isEditing ? (
                    <>
                      <Input 
                        className="mb-2"
                        value={item.objection}
                        onChange={(e) => {
                          const updated = [...objections];
                          updated[index].objection = e.target.value;
                          setObjections(updated);
                        }}
                        placeholder="Objection..."
                      />
                      <Textarea 
                        value={item.response}
                        onChange={(e) => {
                          const updated = [...objections];
                          updated[index].response = e.target.value;
                          setObjections(updated);
                        }}
                        placeholder="Response..."
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-destructive mb-2">
                        "{item.objection}"
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.response}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
