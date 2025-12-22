import { useEffect, useState } from 'react';
import { useTutorial } from './TutorialContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Sparkles, X, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialTriggerProps {
  showOnFirstVisit?: boolean;
}

export function TutorialTrigger({ showOnFirstVisit = true }: TutorialTriggerProps) {
  const { startTutorial, isActive } = useTutorial();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!showOnFirstVisit) return;
    
    const tutorialStatus = localStorage.getItem('adpilot_tutorial_seen');
    
    // Show prompt if tutorial hasn't been seen or started
    if (!tutorialStatus) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showOnFirstVisit]);

  const handleStart = () => {
    setShowPrompt(false);
    startTutorial();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('adpilot_tutorial_seen', 'dismissed');
  };

  if (isActive) return null;

  if (!showPrompt) {
    // Floating button to restart tutorial
    return (
      <Button
        onClick={startTutorial}
        variant="outline"
        size="sm"
        className="fixed bottom-6 right-6 z-50 gap-2 shadow-lg bg-card hover:bg-accent border-border"
      >
        <GraduationCap className="h-4 w-4" />
        Start Tutorial
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-300">
      <Card className={cn(
        "w-[480px] overflow-hidden border-border shadow-2xl",
        "animate-in zoom-in-95 slide-in-from-bottom-4 duration-500"
      )}>
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 pb-6">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Welcome to AdPilot!</h2>
              <p className="text-sm text-muted-foreground">Your AI-powered marketing automation hub</p>
            </div>
          </div>
        </div>

        <CardContent className="p-8 pt-6">
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Ready to supercharge your marketing? Take a quick 2-minute tour to learn how to:
          </p>

          <ul className="space-y-3 mb-8">
            {[
              'Create and manage ad campaigns',
              'Track leads through your pipeline',
              'Set up automated follow-ups',
              'Analyze performance metrics',
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-3 text-sm text-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleStart}
              className="flex-1 gap-2 gradient-primary text-primary-foreground"
            >
              <PlayCircle className="h-4 w-4" />
              Start Interactive Tour
            </Button>
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="text-muted-foreground"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            You can restart the tutorial anytime from the bottom-right corner
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
