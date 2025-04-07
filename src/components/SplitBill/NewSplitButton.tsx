
import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const NewSplitButton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4,
        delay: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-28 right-8 z-50" // Increased bottom margin to position well above navbar
    >
      <Link 
        to="/new-split"
        className="flex items-center justify-center h-14 w-14 bg-primary rounded-full shadow-medium text-primary-foreground hover:shadow-strong transition-all duration-300"
      >
        <Plus className="h-7 w-7" />
      </Link>
    </motion.div>
  );
};

export default NewSplitButton;
