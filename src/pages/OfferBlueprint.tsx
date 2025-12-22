import { useState } from "react";
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
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tiers = [
  {
    name: "Starter",
    price: "₹2,999",
    period: "/month",
    features: [
      "Access to gym facilities",
      "Basic fitness assessment",
      "Group classes included",
      "Mobile app access",
    ],
    popular: false,
  },
  {
    name: "Transform",
    price: "₹4,999",
    period: "/month",
    features: [
      "Everything in Starter",
      "Personal trainer (2x/week)",
      "Custom meal plan",
      "Progress tracking",
      "Priority booking",
    ],
    popular: true,
  },
  {
    name: "Elite",
    price: "₹9,999",
    period: "/month",
    features: [
      "Everything in Transform",
      "Daily personal training",
      "Nutrition coaching",
      "Recovery sessions",
      "VIP locker room",
      "Guest passes (2/month)",
    ],
    popular: false,
  },
];

export default function OfferBlueprint() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground">
              Offer Blueprint
            </h1>
            <StatusBadge status="warning" label="Draft v1.2" />
          </div>
          <p className="text-muted-foreground">
            Define your offer, pricing, and objection handling.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setIsEditing(!isEditing)}>
            <Edit3 className="h-4 w-4" />
            {isEditing ? "Save Changes" : "Edit"}
          </Button>
          <Button className="gap-2 gradient-primary text-primary-foreground">
            <Check className="h-4 w-4" />
            Approve Blueprint
          </Button>
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
                defaultValue="Transform your body and mindset in 90 days with personalized training, proven methods, and dedicated support — or your money back."
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Mechanism (How it works)
              </label>
              <Textarea 
                className="bg-background/50 border-border min-h-[80px]"
                defaultValue="Our 3-phase Transform Method combines personalized workouts, habit coaching, and nutrition guidance with weekly check-ins to ensure consistent progress."
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
                defaultValue="500+ successful transformations • 4.9★ Google rating • Featured in Times of India • 95% client satisfaction"
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Guarantee
              </label>
              <Input 
                className="bg-background/50 border-border"
                defaultValue="90-Day Money Back Guarantee — See results or get a full refund"
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
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            AI Optimize Pricing
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {tiers.map((tier, index) => (
            <Card 
              key={tier.name}
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
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {tier.name}
                  </h3>
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
      </div>

      {/* Objection Handling */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Objection Responses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              { objection: "It's too expensive", response: "Our Transform plan costs less than ₹170/day — less than a fancy coffee. Plus, the 90-day guarantee means zero risk." },
              { objection: "I don't have time", response: "Our sessions are just 45 minutes, 3x/week. We have slots from 6 AM to 10 PM. Most members find time they didn't know they had." },
              { objection: "I've tried before and failed", response: "That's exactly why we assign dedicated coaches. 95% of our members who complete 90 days see significant results." },
              { objection: "Results take too long", response: "Our clients typically see measurable changes in 2-3 weeks. Our 90-day program is designed for lasting transformation, not quick fixes that fade." },
            ].map((item, index) => (
              <div key={index} className="p-4 rounded-xl bg-background/50 border border-border/50">
                <p className="text-sm font-medium text-destructive mb-2">
                  "{item.objection}"
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.response}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
