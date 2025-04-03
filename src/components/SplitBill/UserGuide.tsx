
import React from "react";
import { motion } from "framer-motion";
import { X, ArrowRight, PlusCircle, Users, Receipt, Calculator, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserGuideProps {
  onDismiss?: () => void;
}

const UserGuide: React.FC<UserGuideProps> = ({ onDismiss = () => {} }) => {
  const steps = [
    {
      title: "Add Friends",
      description: "Add your friends to split bills with them",
      icon: <Users className="h-7 w-7" />
    },
    {
      title: "Create Bill",
      description: "Tap + to create a new bill",
      icon: <PlusCircle className="h-7 w-7" />
    },
    {
      title: "Add Items",
      description: "Add all items that need to be split",
      icon: <Receipt className="h-7 w-7" />
    },
    {
      title: "Calculate",
      description: "See who owes what instantly",
      icon: <Calculator className="h-7 w-7" />
    }
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 mb-6"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-primary">How to use</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: index * 0.1 } 
            }}
            className="bg-white rounded-lg p-4 shadow-sm flex flex-col items-center text-center"
          >
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
              {step.icon}
            </div>
            <h4 className="font-medium mb-1">{step.title}</h4>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.4 } }}
        className="flex justify-end"
      >
        <Button 
          size="sm" 
          variant="default"
          onClick={onDismiss}
          className="gap-1"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default UserGuide;
