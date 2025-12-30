import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, SkipForward, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTutorial } from "./TutorialProvider";
import { useLanguage } from "./LanguageProvider";

interface HighlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TutorialOverlay: React.FC = () => {
  const { 
    isActive, 
    currentStep, 
    currentStepData, 
    totalSteps, 
    nextStep, 
    prevStep, 
    endTutorial 
  } = useTutorial();
  const { t } = useLanguage();
  const [highlightPos, setHighlightPos] = useState<HighlightPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const updateHighlightPosition = useCallback(() => {
    if (!currentStepData?.targetSelector) {
      setHighlightPos(null);
      return;
    }

    const element = document.querySelector(currentStepData.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 8;
      setHighlightPos({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });

      // Calculate tooltip position
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      let tooltipTop = rect.bottom + 16;
      let tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;

      const position = currentStepData.position || "bottom";
      
      switch (position) {
        case "top":
          tooltipTop = rect.top - tooltipHeight - 16;
          break;
        case "left":
          tooltipTop = rect.top + rect.height / 2 - tooltipHeight / 2;
          tooltipLeft = rect.left - tooltipWidth - 16;
          break;
        case "right":
          tooltipTop = rect.top + rect.height / 2 - tooltipHeight / 2;
          tooltipLeft = rect.right + 16;
          break;
        case "bottom":
        default:
          break;
      }

      // Keep within viewport
      tooltipLeft = Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, tooltipLeft));
      tooltipTop = Math.max(16, Math.min(window.innerHeight - tooltipHeight - 16, tooltipTop));

      setTooltipPosition({ top: tooltipTop, left: tooltipLeft });
    } else {
      setHighlightPos(null);
    }
  }, [currentStepData]);

  useEffect(() => {
    if (isActive && currentStepData) {
      // Initial position update
      updateHighlightPosition();

      // Set up observer for dynamic content
      const observer = new MutationObserver(() => {
        requestAnimationFrame(updateHighlightPosition);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      // Update on resize
      window.addEventListener("resize", updateHighlightPosition);
      window.addEventListener("scroll", updateHighlightPosition);

      return () => {
        observer.disconnect();
        window.removeEventListener("resize", updateHighlightPosition);
        window.removeEventListener("scroll", updateHighlightPosition);
      };
    }
  }, [isActive, currentStepData, updateHighlightPosition]);

  if (!isActive || !currentStepData) return null;

  const isCentered = !highlightPos || currentStepData.position === "center";
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] pointer-events-none"
      >
        {/* Dark overlay with cutout */}
        <svg className="absolute inset-0 w-full h-full pointer-events-auto">
          <defs>
            <mask id="tutorial-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {highlightPos && (
                <rect
                  x={highlightPos.left}
                  y={highlightPos.top}
                  width={highlightPos.width}
                  height={highlightPos.height}
                  rx="12"
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

        {/* Highlight border */}
        {highlightPos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute border-2 border-primary rounded-xl pointer-events-none"
            style={{
              top: highlightPos.top,
              left: highlightPos.left,
              width: highlightPos.width,
              height: highlightPos.height,
              boxShadow: "0 0 0 4px rgba(var(--primary-rgb), 0.3), 0 0 20px rgba(var(--primary-rgb), 0.4)",
            }}
          >
            {/* Pulsing ring animation */}
            <motion.div
              className="absolute inset-0 border-2 border-primary rounded-xl"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`absolute bg-card border border-border rounded-xl shadow-xl p-5 pointer-events-auto ${
            isCentered ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : ""
          }`}
          style={
            isCentered
              ? { width: "min(90vw, 360px)" }
              : {
                  top: tooltipPosition.top,
                  left: tooltipPosition.left,
                  width: "min(90vw, 320px)",
                }
          }
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">
                {t("Step", "चरण")} {currentStep + 1} / {totalSteps}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={endTutorial}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Content */}
          <h3 className="text-lg font-bold mb-2">{currentStepData.title}</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Action indicator */}
          {currentStepData.action === "click" && (
            <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 rounded-lg px-3 py-2 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t("Tap the highlighted element to continue", "जारी राख्न हाइलाइट गरिएको तत्वमा ट्याप गर्नुहोस्")}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("Back", "पछाडि")}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={endTutorial}
                className="gap-1 text-muted-foreground"
              >
                <SkipForward className="h-4 w-4" />
                {t("Skip", "छोड्नुहोस्")}
              </Button>

              <Button size="sm" onClick={nextStep} className="gap-1">
                {currentStep === totalSteps - 1 
                  ? t("Finish", "समाप्त") 
                  : t("Next", "अर्को")}
                {currentStep < totalSteps - 1 && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TutorialOverlay;
