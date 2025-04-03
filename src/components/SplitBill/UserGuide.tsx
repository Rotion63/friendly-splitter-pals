
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, ReceiptText, Plus, Calculator, DollarSign, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserGuideProps {
  onDismiss?: () => void;
}

const UserGuide: React.FC<UserGuideProps> = ({ onDismiss = () => {} }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Add Friends",
      description: "Start by adding friends to your list so you can easily split bills with them.",
      icon: <Users className="h-6 w-6 text-primary" />
    },
    {
      title: "Create a Bill",
      description: "Tap the '+' button to create a new bill with the friends you want to split with.",
      icon: <ReceiptText className="h-6 w-6 text-primary" />
    },
    {
      title: "Add Items",
      description: "Add all the items that need to be split, like food, groceries, or other expenses.",
      icon: <Plus className="h-6 w-6 text-primary" />
    },
    {
      title: "Set Amounts",
      description: "Enter the price for each item and select who participated in that expense.",
      icon: <DollarSign className="h-6 w-6 text-primary" />
    },
    {
      title: "Calculate",
      description: "Choose who paid the bill, then calculate the split to see who owes what.",
      icon: <Calculator className="h-6 w-6 text-primary" />
    }
  ];
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onDismiss();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden"
    >
      <div className="relative p-4 pb-6">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <h3 className="text-lg font-medium mb-1 mt-1">Welcome to Split!</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Here's how to use the app in {steps.length} simple steps:
        </p>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="text-center px-4"
          >
            <div className="bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              {steps[currentStep].icon}
            </div>
            <h4 className="text-lg font-medium mb-2">
              {currentStep + 1}. {steps[currentStep].title}
            </h4>
            <p className="text-sm text-muted-foreground mb-6">
              {steps[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>
        
        <div className="flex justify-between items-center mt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 w-6 rounded-full ${
                  index === currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          
          <Button 
            size="sm" 
            onClick={nextStep}
            className="gap-1"
          >
            {currentStep < steps.length - 1 ? "Next" : "Done"}
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserGuide;
