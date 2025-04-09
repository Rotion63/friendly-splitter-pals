
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Lightning, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";
import { useLanguage } from "@/components/LanguageProvider";

const SplitTypeSelection: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <AppLayout showBackButton title={t("New Split", "नयाँ बिल")}>
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">{t("Choose Split Type", "स्प्लिट प्रकार चयन गर्नुहोस्")}</h1>
        
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/quick-split">
              <Card className="p-5 hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Lightning size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{t("Quick Split", "द्रुत स्प्लिट")}</h3>
                    <p className="text-muted-foreground text-sm">
                      {t("Split a bill quickly among friends", "साथीहरू बीच छिटो बिल विभाजन गर्नुहोस्")}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Link to="/friends-and-groups">
              <Card className="p-5 hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{t("Friends & Groups", "मित्रहरू र समूहहरू")}</h3>
                    <p className="text-muted-foreground text-sm">
                      {t("Manage friends and groups for easier splitting", "सजिलो विभाजनको लागि मित्रहरू र समूहहरू व्यवस्थापन गर्नुहोस्")}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SplitTypeSelection;
