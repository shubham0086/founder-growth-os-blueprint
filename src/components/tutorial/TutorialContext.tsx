import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'input' | 'select';
  nextRoute?: string;
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  startTutorial: () => void;
  endTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  currentStepData: TutorialStep | null;
  progress: number;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const CAMPAIGN_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to AdPilot! 🚀',
    description: 'This quick tutorial will guide you through creating your first ad campaign. It only takes about 2 minutes!',
    position: 'bottom',
  },
  {
    id: 'dashboard-overview',
    title: 'Dashboard Overview',
    description: 'This is your command center. Here you can see key metrics, recent activity, and quick actions at a glance.',
    target: '[data-tutorial="dashboard-metrics"]',
    position: 'bottom',
  },
  {
    id: 'navigate-campaigns',
    title: 'Navigate to Campaigns',
    description: 'Click on "Campaigns" in the sidebar to manage your ad campaigns across Meta and Google platforms.',
    target: '[data-tutorial="nav-campaigns"]',
    position: 'right',
    action: 'click',
    nextRoute: '/campaigns',
  },
  {
    id: 'campaigns-overview',
    title: 'Campaign Plans',
    description: 'This is where all your campaigns live. You can see performance metrics, manage status, and create new campaigns.',
    target: '[data-tutorial="campaigns-header"]',
    position: 'bottom',
  },
  {
    id: 'create-campaign-button',
    title: 'Create Your First Campaign',
    description: 'Click the "Create Campaign" button to start setting up your first ad campaign.',
    target: '[data-tutorial="create-campaign-btn"]',
    position: 'left',
    action: 'click',
  },
  {
    id: 'campaign-name',
    title: 'Name Your Campaign',
    description: 'Give your campaign a descriptive name that helps you identify it later. For example: "Summer Sale 2024" or "Lead Gen - Facebook".',
    target: '[data-tutorial="campaign-name-input"]',
    position: 'bottom',
    action: 'input',
  },
  {
    id: 'select-platform',
    title: 'Choose Your Platform',
    description: 'Select where you want to run your ads. Meta includes Facebook and Instagram, while Google Ads covers Search, Display, and YouTube.',
    target: '[data-tutorial="campaign-platform-select"]',
    position: 'bottom',
    action: 'select',
  },
  {
    id: 'submit-campaign',
    title: 'Create the Campaign',
    description: 'Click "Create Campaign" to save your campaign. It will be created as a draft that you can edit and launch when ready.',
    target: '[data-tutorial="campaign-submit-btn"]',
    position: 'top',
    action: 'click',
  },
  {
    id: 'campaign-created',
    title: 'Campaign Created! 🎉',
    description: 'Congratulations! Your first campaign is now created. You can edit it, add targeting, set budgets, and launch it when you\'re ready.',
    position: 'bottom',
  },
  {
    id: 'explore-more',
    title: 'Explore More Features',
    description: 'Check out Leads to manage your pipeline, Automations for follow-up sequences, Reports for analytics, and Research for market insights. Happy marketing!',
    position: 'bottom',
  },
];

interface TutorialProviderProps {
  children: ReactNode;
}

export function TutorialProvider({ children }: TutorialProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps] = useState<TutorialStep[]>(CAMPAIGN_TUTORIAL_STEPS);

  const startTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
    localStorage.setItem('adpilot_tutorial_seen', 'in_progress');
  }, []);

  const endTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('adpilot_tutorial_seen', 'completed');
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTutorial();
    }
  }, [currentStep, steps.length, endTutorial]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  const currentStepData = isActive ? steps[currentStep] : null;
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        startTutorial,
        endTutorial,
        nextStep,
        prevStep,
        goToStep,
        currentStepData,
        progress,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
}
