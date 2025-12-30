import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  route?: string;
  action?: "click" | "input" | "observe";
  inputPlaceholder?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Bill Splitter! 🎉",
    description: "Let's walk through how to split bills with your friends. This quick tutorial will show you all the features.",
    position: "center",
    route: "/"
  },
  {
    id: "home-overview",
    title: "Home Screen",
    description: "This is your home screen. Here you'll see all your active and settled bills.",
    position: "center",
    route: "/"
  },
  {
    id: "new-split-button",
    title: "Create New Split",
    description: "Tap the + button to create a new bill split. Let's click it!",
    targetSelector: "[data-tutorial='new-split-button']",
    action: "click",
    position: "left",
    route: "/"
  },
  {
    id: "split-options",
    title: "Choose Split Type",
    description: "You can choose Quick Split for simple bills or Trip Split for travel expenses. Let's try Quick Split!",
    targetSelector: "[data-tutorial='quick-split-option']",
    action: "click",
    position: "bottom",
    route: "/new-split"
  },
  {
    id: "enter-title",
    title: "Enter Split Name",
    description: "Give your split a name like 'Dinner', 'Vacation', or 'Groceries'.",
    targetSelector: "[data-tutorial='split-title-input']",
    action: "input",
    inputPlaceholder: "e.g., Dinner with friends",
    position: "bottom",
    route: "/quick-split"
  },
  {
    id: "add-participants",
    title: "Add Participants",
    description: "Add the people who are splitting this bill. You need at least 2 participants.",
    targetSelector: "[data-tutorial='add-participant-section']",
    action: "observe",
    position: "bottom",
    route: "/quick-split"
  },
  {
    id: "add-friend-name",
    title: "Enter Friend's Name",
    description: "Type your friend's name here and press Add to include them.",
    targetSelector: "[data-tutorial='participant-name-input']",
    action: "input",
    inputPlaceholder: "Enter name",
    position: "bottom",
    route: "/quick-split"
  },
  {
    id: "continue-button",
    title: "Continue to Add Items",
    description: "Once you have participants, tap 'Continue Manually' to add bill items, or use 'Scan Menu' to scan a receipt.",
    targetSelector: "[data-tutorial='continue-button']",
    action: "observe",
    position: "top",
    route: "/quick-split"
  },
  {
    id: "add-items",
    title: "Add Bill Items",
    description: "Add each item from your bill - enter the name and price. You can also scan receipts!",
    position: "center",
    route: "/split-details"
  },
  {
    id: "calculate-split",
    title: "Calculate Split",
    description: "After adding all items, tap 'Calculate Split' to see who owes what!",
    position: "center",
    route: "/split-details"
  },
  {
    id: "tutorial-complete",
    title: "You're All Set! 🎊",
    description: "You now know the basics! Explore other features like groups, trips, and receipt scanning. Access this tutorial anytime from Settings > Help.",
    position: "center"
  }
];

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  currentStepData: TutorialStep | null;
  totalSteps: number;
  startTutorial: () => void;
  endTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipToStep: (stepId: string) => void;
  isFirstTime: boolean;
  setFirstTimeComplete: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenInteractiveTutorial');
    if (!hasSeenTutorial) {
      setIsFirstTime(true);
    }
  }, []);

  const startTutorial = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    navigate('/');
  }, [navigate]);

  const endTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  const setFirstTimeComplete = useCallback(() => {
    localStorage.setItem('hasSeenInteractiveTutorial', 'true');
    setIsFirstTime(false);
  }, []);

  const nextStep = useCallback(() => {
    const nextStepIndex = currentStep + 1;
    if (nextStepIndex >= tutorialSteps.length) {
      endTutorial();
      setFirstTimeComplete();
      return;
    }
    
    const nextStepData = tutorialSteps[nextStepIndex];
    
    // Navigate if needed
    if (nextStepData.route && !location.pathname.startsWith(nextStepData.route.replace(/\/:.*/, ''))) {
      // For dynamic routes like /split-details/:id, we just check if we're on that page type
      const baseRoute = nextStepData.route.split('/')[1];
      if (!location.pathname.includes(baseRoute)) {
        navigate(nextStepData.route);
      }
    }
    
    setCurrentStep(nextStepIndex);
  }, [currentStep, endTutorial, setFirstTimeComplete, location.pathname, navigate]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const prevStepData = tutorialSteps[currentStep - 1];
      if (prevStepData.route) {
        navigate(prevStepData.route);
      }
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, navigate]);

  const skipToStep = useCallback((stepId: string) => {
    const stepIndex = tutorialSteps.findIndex(s => s.id === stepId);
    if (stepIndex >= 0) {
      const stepData = tutorialSteps[stepIndex];
      if (stepData.route) {
        navigate(stepData.route);
      }
      setCurrentStep(stepIndex);
    }
  }, [navigate]);

  const currentStepData = isActive ? tutorialSteps[currentStep] : null;

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        currentStepData,
        totalSteps: tutorialSteps.length,
        startTutorial,
        endTutorial,
        nextStep,
        prevStep,
        skipToStep,
        isFirstTime,
        setFirstTimeComplete
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
};
