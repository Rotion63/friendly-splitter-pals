
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useLanguage } from "@/components/LanguageProvider";
import { Card } from "@/components/ui/card";
import { 
  Receipt, 
  Map, 
  Home as HomeIcon, 
  Utensils,
  CalendarClock
} from "lucide-react";

const SplitTypeSelection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const splitOptions = [
    {
      id: "quick-split",
      title: t("Quick Split", "छिटो विभाजन"),
      description: t("Split a single bill or expense quickly", "एउटा बिल वा खर्च छिटो विभाजन गर्नुहोस्"),
      icon: Receipt,
      path: "/quick-split",
      color: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      id: "trip",
      title: t("Trips & Tours", "यात्रा र भ्रमण"),
      description: t("Track expenses for trips with multiple days", "धेरै दिनको यात्राको खर्च ट्र्याक गर्नुहोस्"),
      icon: Map,
      path: "/trip/new",
      color: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      badge: t("Multiple Days", "धेरै दिन")
    },
    {
      id: "recurring",
      title: t("Recurring Expenses", "नियमित खर्च"),
      description: t("Utilities, rent and other shared expenses", "उपयोगिता, भाडा र अन्य साझा खर्चहरू"),
      icon: HomeIcon,
      path: "/quick-split?mode=recurring",
      color: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      id: "dining",
      title: t("Dining Out", "बाहिर खाना"),
      description: t("Split restaurant bills with custom items", "रेस्टुरेन्ट बिलहरू कस्टम आइटमहरू सँग विभाजन गर्नुहोस्"),
      icon: Utensils,
      path: "/quick-split?mode=dining",
      color: "bg-amber-100 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400"
    },
    {
      id: "schedule",
      title: t("Scheduled Splits", "तय समयमा विभाजन"),
      description: t("Set up regular split reminders", "नियमित विभाजन रिमाइन्डर सेट गर्नुहोस्"),
      icon: CalendarClock,
      path: "/quick-split?mode=scheduled",
      color: "bg-rose-100 dark:bg-rose-900/20",
      iconColor: "text-rose-600 dark:text-rose-400"
    }
  ];

  const handleNavigate = (path: string) => {
    console.log("Navigating to:", path);
    navigate(path);
  };
  
  return (
    <AppLayout showBackButton title={t("New Split", "नयाँ विभाजन")}>
      <div className="py-6 space-y-5">
        <p className="text-lg font-medium text-center">
          {t("Choose a split type", "विभाजन प्रकार छान्नुहोस्")}
        </p>
        
        <div className="space-y-4">
          {splitOptions.map((option, index) => (
            <motion.div 
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => handleNavigate(option.path)}
              >
                <div className="p-4 flex items-center gap-4">
                  <div className={`rounded-full p-3 ${option.color}`}>
                    <option.icon className={`h-6 w-6 ${option.iconColor}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default SplitTypeSelection;
