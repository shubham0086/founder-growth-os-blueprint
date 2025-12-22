import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Rocket, 
  Building2, 
  Target, 
  Globe, 
  Plug,
  ArrowRight,
  Check,
  Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const steps = [
  { id: 1, title: "Business Info", icon: Building2 },
  { id: 2, title: "Your Goal", icon: Target },
  { id: 3, title: "Market", icon: Globe },
  { id: 4, title: "Integrations", icon: Plug },
];

const industries = [
  "Fitness / Gym",
  "Healthcare / Clinic",
  "Education / Coaching",
  "Home Services",
  "E-commerce / D2C",
  "B2B Services",
  "Other",
];

const goals = [
  "Generate more leads",
  "Reduce cost per lead",
  "Increase conversions",
  "Build brand awareness",
  "Launch a new offer",
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleComplete = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            <Rocket className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">Founder Growth OS</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all ${
                currentStep > step.id 
                  ? 'bg-primary text-primary-foreground' 
                  : currentStep === step.id
                  ? 'bg-primary/20 text-primary border-2 border-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="bg-card/50 border-border/50 overflow-hidden">
          <CardContent className="p-8">
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Tell us about your business</h2>
                  <p className="text-muted-foreground">We'll customize your growth system based on this.</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Business Name
                  </label>
                  <Input placeholder="e.g., Acme Fitness" className="bg-background/50" />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">
                    Industry
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {industries.map((industry) => (
                      <button
                        key={industry}
                        onClick={() => setSelectedIndustry(industry)}
                        className={`p-3 rounded-lg border text-sm text-left transition-all ${
                          selectedIndustry === industry
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border/50 bg-background/50 text-muted-foreground hover:border-border'
                        }`}
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">What's your main goal?</h2>
                  <p className="text-muted-foreground">Select all that apply.</p>
                </div>
                
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`w-full p-4 rounded-lg border text-left transition-all flex items-center justify-between ${
                        selectedGoals.includes(goal)
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border/50 bg-background/50 text-muted-foreground hover:border-border'
                      }`}
                    >
                      <span>{goal}</span>
                      {selectedGoals.includes(goal) && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Monthly ad budget (optional)
                  </label>
                  <Input placeholder="e.g., ₹50,000" className="bg-background/50" />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Define your market</h2>
                  <p className="text-muted-foreground">Help us understand your target audience.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Region / City
                    </label>
                    <Input placeholder="e.g., Mumbai" className="bg-background/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Language
                    </label>
                    <Input placeholder="e.g., English, Hindi" className="bg-background/50" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Competitor URLs (one per line)
                  </label>
                  <Textarea 
                    placeholder="https://competitor1.com&#10;https://competitor2.com" 
                    className="bg-background/50 min-h-[100px]" 
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Connect your tools</h2>
                  <p className="text-muted-foreground">AI integrations are already set up. Connect ad platforms later.</p>
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: "Perplexity AI", status: "connected", icon: "🔮" },
                    { name: "Firecrawl", status: "connected", icon: "🔥" },
                    { name: "ElevenLabs", status: "connected", icon: "🔊" },
                  ].map((integration) => (
                    <div
                      key={integration.name}
                      className="p-4 rounded-lg border border-success/30 bg-success/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{integration.icon}</span>
                        <span className="font-medium text-foreground">{integration.name}</span>
                      </div>
                      <span className="text-sm text-success flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Connected
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  You can connect Google Ads, Meta Ads, and other platforms in Settings.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentStep(s => s - 1)}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              
              {currentStep < 4 ? (
                <Button 
                  onClick={() => setCurrentStep(s => s + 1)}
                  className="gap-2"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete}
                  className="gap-2 gradient-primary text-primary-foreground"
                >
                  <Sparkles className="h-4 w-4" />
                  Start Research Scan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
