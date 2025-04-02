
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import FriendsList from "@/components/SplitBill/FriendsList";
import BillCard from "@/components/SplitBill/BillCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bill, Participant } from "@/lib/types";
import { getBills } from "@/lib/billStorage";
import { getFriends, addFriend, removeFriend } from "@/lib/friendsStorage";
import { Button } from "@/components/ui/button";
import { Settings, Users } from "lucide-react";
import UserGuide from "@/components/SplitBill/UserGuide";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [friends, setFriends] = useState<Participant[]>([]);
  const [activeBills, setActiveBills] = useState<Bill[]>([]);
  const [settledBills, setSettledBills] = useState<Bill[]>([]);
  const [activeTab, setActiveTab] = useState("active");
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    // Load bills
    const loadedBills = getBills();
    setBills(loadedBills);

    // Separate active and settled bills
    const active: Bill[] = [];
    const settled: Bill[] = [];

    loadedBills.forEach(bill => {
      // Check if all settlements are marked as settled
      const isFullySettled = bill.settlements?.every(settlement => settlement.settled) ?? false;
      
      if (isFullySettled && bill.settlements && bill.settlements.length > 0) {
        settled.push(bill);
      } else {
        active.push(bill);
      }
    });

    setActiveBills(active);
    setSettledBills(settled);

    // Load friends
    setFriends(getFriends());
  }, []);

  const handleAddFriend = (friend: Participant) => {
    const updatedFriends = addFriend(friend);
    setFriends(updatedFriends);
  };

  const handleRemoveFriend = (id: string) => {
    const updatedFriends = removeFriend(id);
    setFriends(updatedFriends);
  };

  const handleViewBill = (billId: string) => {
    navigate(`/split-summary/${billId}`);
  };

  const handleEditBill = (billId: string) => {
    navigate(`/split-details/${billId}`);
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
        
        <FriendsList
          friends={friends}
          onAddFriend={handleAddFriend}
          onRemoveFriend={handleRemoveFriend}
        />

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Your Bills</h2>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => navigate('/places-and-groups')}
              className="text-primary"
            >
              <Users className="h-4 w-4 mr-1" />
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
                >
                  <UserGuide onDismiss={handleCloseGuide} />
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
                      onView={() => handleViewBill(bill.id)}
                      onEdit={() => handleEditBill(bill.id)}
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
                      onView={() => handleViewBill(bill.id)}
                      onEdit={() => handleEditBill(bill.id)}
                      settled={true}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default HomePage;
