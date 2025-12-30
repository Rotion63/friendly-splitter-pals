import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTutorial } from "./TutorialProvider";
import { useLanguage } from "./LanguageProvider";

const TutorialTrigger: React.FC = () => {
  const { isFirstTime, startTutorial, setFirstTimeComplete, isActive } = useTutorial();
  const { t } = useLanguage();

  if (isActive) return null;

  return (
    <AnimatePresence>
      {isFirstTime && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-36 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:w-80"
        >
          <div className="bg-card border border-border rounded-xl shadow-xl p-5 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={setFirstTimeComplete}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1">
                  {t("First time here?", "पहिलो पटक यहाँ?")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "Take a quick tour to learn how to split bills with friends!",
                    "साथीहरूसँग बिल कसरी विभाजन गर्ने भनेर जान्न छिटो टुर लिनुहोस्!"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={startTutorial} 
                className="flex-1 gap-2"
                size="sm"
              >
                <HelpCircle className="h-4 w-4" />
                {t("Start Tutorial", "ट्यूटोरियल सुरु गर्नुहोस्")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={setFirstTimeComplete}
              >
                {t("Skip", "छोड्नुहोस्")}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TutorialTrigger;
