import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import BillCard from "@/components/SplitBill/BillCard";
import NewSplitButton from "@/components/SplitBill/NewSplitButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bill } from "@/lib/types";
import { getBills, deleteBill } from "@/lib/billStorage";
import { getTripById } from "@/lib/tripStorage";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/components/LanguageProvider";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [activeTab, setActiveTab] = useState("active");
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  // Memoized bill loading function to prevent unnecessary reloads
  const loadBills = useCallback(() => {
    const loadedBills = getBills();
    
    // Enhance bills with trip names
    const enhancedBills = loadedBills.map(bill => {
      if (bill.tripId) {
        const trip = getTripById(bill.tripId);
        return {
          ...bill,
          tripName: trip?.name || ''
        };
      }
      return bill;
    });
    
    setBills(enhancedBills);
  }, []);

  // Add currency change event listener to refresh bills when currency changes
  useEffect(() => {
    const handleCurrencyChange = () => {
      loadBills();
    };
    
    window.addEventListener('currency-changed', handleCurrencyChange);
    return () => {
      window.removeEventListener('currency-changed', handleCurrencyChange);
    };
  }, [loadBills]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  // Memoize filtered bills to prevent recalculations
  const { activeBills, settledBills } = useMemo(() => {
    const active: Bill[] = [];
    const settled: Bill[] = [];

    bills.forEach(bill => {
      const isFullySettled = bill.settlements?.every(settlement => settlement.settled) ?? false;
      
      if (isFullySettled && bill.settlements && bill.settlements.length > 0) {
        settled.push(bill);
      } else {
        active.push(bill);
      }
    });

    return { activeBills: active, settledBills: settled };
  }, [bills]);

  const handleViewBill = useCallback((billId: string) => {
    navigate(`/split-details/${billId}`);
  }, [navigate]);

  const handleEditBill = useCallback((billId: string) => {
    navigate(`/split-details/${billId}`);
  }, [navigate]);

  const handleDeleteBill = useCallback((billId: string) => {
    deleteBill(billId);
    loadBills();
  }, [loadBills]);


  return (
    <AppLayout title="कति भो बिल ?">
      <div className="py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t("Bill Splitter", "बिल स्प्लिटर")}</h1>
        </div>
        
        <div className="mb-4">
          <h2 className="text-lg font-medium">{t("Your Bills", "तपाईंको बिलहरू")}</h2>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">{t("Active Bills", "सक्रिय बिलहरू")}</TabsTrigger>
            <TabsTrigger value="settled">{t("Settled Bills", "निपटाइएका बिलहरू")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-4">
            <AnimatePresence mode="wait">
              {activeBills.length === 0 ? (
                <motion.div
                  key="no-active-bills"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <p>{t("No active bills yet. Create your first bill!", "अहिलेसम्म कुनै सक्रिय बिल छैन। आफ्नो पहिलो बिल सिर्जना गर्नुहोस्!")}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="active-bills-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {activeBills.map((bill, index) => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      index={index}
                      onClick={() => handleViewBill(bill.id)}
                      onEdit={() => handleEditBill(bill.id)}
                      onDelete={() => handleDeleteBill(bill.id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="settled" className="mt-4">
            <AnimatePresence mode="wait">
              {settledBills.length === 0 ? (
                <motion.div
                  key="no-settled-bills"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <p>{t("No settled bills yet", "अहिले सम्म कुनै निपटाइएका बिलहरू छैनन्")}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="settled-bills-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {settledBills.map((bill, index) => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      index={index}
                      onClick={() => handleViewBill(bill.id)}
                      onEdit={() => handleEditBill(bill.id)}
                      onDelete={() => handleDeleteBill(bill.id)}
                      settled={true}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
        
        <NewSplitButton />

      </div>
    </AppLayout>
  );
};

export default HomePage;
