import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTutorial } from './TutorialContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TutorialOverlay() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    isActive, 
    currentStepData, 
    currentStep, 
    steps, 
    nextStep, 
    prevStep, 
    endTutorial,
    progress 
  } = useTutorial();
  
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const updatePositions = useCallback(() => {
    if (!currentStepData?.target) {
      setHighlightRect(null);
      setTooltipPosition({ top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 200 });
      return;
    }

    const element = document.querySelector(currentStepData.target);
    if (!element) {
      setHighlightRect(null);
      setTooltipPosition({ top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 200 });
      return;
    }

    const rect = element.getBoundingClientRect();
    setHighlightRect(rect);

    const padding = 16;
    let top = 0;
    let left = 0;

    switch (currentStepData.position) {
      case 'top':
        top = rect.top - 180;
        left = rect.left + rect.width / 2 - 200;
        break;
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - 200;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - 80;
        left = rect.left - 420;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - 80;
        left = rect.right + padding;
        break;
      default:
        top = rect.bottom + padding;
        left = rect.left;
    }

    // Keep tooltip in viewport
    left = Math.max(16, Math.min(left, window.innerWidth - 420));
    top = Math.max(16, Math.min(top, window.innerHeight - 200));

    setTooltipPosition({ top, left });
  }, [currentStepData]);

  useEffect(() => {
    if (!isActive) return;
    
    updatePositions();
    
    const handleResize = () => updatePositions();
    window.addEventListener('resize', handleResize);
    
    // Re-calculate after a short delay for DOM updates
    const timer = setTimeout(updatePositions, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [isActive, currentStepData, updatePositions, location.pathname]);

  // Handle navigation for steps that require route change
  useEffect(() => {
    if (!isActive || !currentStepData?.nextRoute) return;
    
    // Only navigate if we're not already on the target route
    if (location.pathname !== currentStepData.nextRoute) {
      // Navigation happens on next step click, not automatically
    }
  }, [isActive, currentStepData, location.pathname]);

  const handleNext = () => {
    if (currentStepData?.nextRoute && location.pathname !== currentStepData.nextRoute) {
      navigate(currentStepData.nextRoute);
      setTimeout(nextStep, 300);
    } else {
      nextStep();
    }
  };

  if (!isActive || !currentStepData) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dark overlay with cutout for highlighted element */}
      <div className="absolute inset-0 pointer-events-auto">
        <svg className="w-full h-full">
          <defs>
            <mask id="tutorial-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {highlightRect && (
                <rect
                  x={highlightRect.left - 8}
                  y={highlightRect.top - 8}
                  width={highlightRect.width + 16}
                  height={highlightRect.height + 16}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#tutorial-mask)"
          />
        </svg>
      </div>

      {/* Highlight ring around target element */}
      {highlightRect && (
        <div
          className="absolute border-2 border-primary rounded-lg pointer-events-none animate-pulse"
          style={{
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            boxShadow: '0 0 0 4px rgba(var(--primary), 0.3), 0 0 20px rgba(var(--primary), 0.4)',
          }}
        />
      )}

      {/* Tooltip Card */}
      <Card
        className={cn(
          "absolute w-[400px] p-5 bg-card border-border shadow-2xl pointer-events-auto",
          "animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
        )}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" />
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Content */}
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {currentStepData.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentStepData.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={endTutorial}
              className="text-muted-foreground"
            >
              Skip Tutorial
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1 gradient-primary text-primary-foreground"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={endTutorial}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </Card>
    </div>
  );
}
