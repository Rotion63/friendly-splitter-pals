
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import BillCard from "@/components/SplitBill/BillCard";
import NewSplitButton from "@/components/SplitBill/NewSplitButton";
import UserGuide from "@/components/SplitBill/UserGuide";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bill } from "@/lib/types";
import { getBills, deleteBill } from "@/lib/billStorage";
import { Button } from "@/components/ui/button";
import { Settings, MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [activeBills, setActiveBills] = useState<Bill[]>([]);
  const [settledBills, setSettledBills] = useState<Bill[]>([]);
  const [activeTab, setActiveTab] = useState("active");
  const [showGuide, setShowGuide] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadedBills = getBills();
    setBills(loadedBills);

    const active: Bill[] = [];
    const settled: Bill[] = [];

    loadedBills.forEach(bill => {
      const isFullySettled = bill.settlements?.every(settlement => settlement.settled) ?? false;
      
      if (isFullySettled && bill.settlements && bill.settlements.length > 0) {
        settled.push(bill);
      } else {
        active.push(bill);
      }
    });

    setActiveBills(active);
    setSettledBills(settled);

    // Check if this is the first time opening the app
    const hasSeenGuide = localStorage.getItem('hasSeenGuide');
    if (!hasSeenGuide) {
      setShowGuide(true);
      localStorage.setItem('hasSeenGuide', 'true');
    }
  }, []);

  const handleViewBill = (billId: string) => {
    navigate(`/split-details/${billId}`);
  };

  const handleEditBill = (billId: string) => {
    navigate(`/split-details/${billId}`);
  };

  const handleDeleteBill = (billId: string) => {
    deleteBill(billId);
    const updatedBills = getBills();
    setBills(updatedBills);
    
    const active: Bill[] = [];
    const settled: Bill[] = [];

    updatedBills.forEach(bill => {
      const isFullySettled = bill.settlements?.every(settlement => settlement.settled) ?? false;
      
      if (isFullySettled && bill.settlements && bill.settlements.length > 0) {
        settled.push(bill);
      } else {
        active.push(bill);
      }
    });

    setActiveBills(active);
    setSettledBills(settled);
  };

  const handleCloseGuide = () => {
    setShowGuide(false);
  };

  return (
    <AppLayout title="कति भो बिल ?">
      <div className="py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bill Splitter</h1>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => navigate('/settings')}
              className="p-2"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Your Bills</h2>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => navigate('/places-and-groups')}
              className="text-primary"
            >
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">Places & Groups</span>
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Bills</TabsTrigger>
            <TabsTrigger value="settled">Settled Bills</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-4">
            <AnimatePresence>
              {activeBills.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <p>No active bills yet. Create your first bill!</p>
                </motion.div>
              ) : (
                <motion.div
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
            <AnimatePresence>
              {settledBills.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <p>No settled bills yet</p>
                </motion.div>
              ) : (
                <motion.div
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

        {showGuide && (
          <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 ${isMobile ? 'h-[calc(100vh-4rem)]' : ''}`}>
            <div className="bg-background rounded-lg max-w-lg w-full max-h-[80vh] overflow-auto">
              <div className="p-4">
                <UserGuide onDismiss={handleCloseGuide} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HomePage;
