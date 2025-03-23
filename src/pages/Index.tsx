
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import BillCard from "@/components/SplitBill/BillCard";
import NewSplitButton from "@/components/SplitBill/NewSplitButton";
import FriendsList from "@/components/SplitBill/FriendsList";
import UserGuide from "@/components/SplitBill/UserGuide";
import { generateId } from "@/lib/utils";
import { Bill, Participant } from "@/lib/types";
import { getFriends, addFriend, removeFriend } from "@/lib/friendsStorage";
import { getBills, removeBill, saveBill } from "@/lib/billStorage";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [friends, setFriends] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDummyBill, setShowDummyBill] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Load friends from storage
    setFriends(getFriends());
    
    // Load real bills from storage
    const realBills = getBills();
    
    // Create one dummy bill if no real bills exist
    const dummyBill: Bill = {
      id: "dummy-bill",
      title: "Dinner with Friends (Example)",
      date: new Date().toISOString(),
      totalAmount: 126.80,
      participants: [
        { id: "dummy-p1", name: "You" },
        { id: "dummy-p2", name: "Friend 1" },
        { id: "dummy-p3", name: "Friend 2" }
      ],
      items: [
        { id: "dummy-item1", name: "Shared Appetizers", amount: 24.95, participants: ["dummy-p1", "dummy-p2", "dummy-p3"] },
        { id: "dummy-item2", name: "Main Courses", amount: 78.85, participants: ["dummy-p1", "dummy-p2", "dummy-p3"] },
        { id: "dummy-item3", name: "Dessert", amount: 23.00, participants: ["dummy-p1", "dummy-p2"] }
      ],
      paidBy: "dummy-p1",
      isDummy: true
    };
    
    // Save the dummy bill to localStorage if there are no real bills
    if (realBills.length === 0 && showDummyBill) {
      const existingDummyBill = getBills().find(bill => bill.id === "dummy-bill");
      if (!existingDummyBill) {
        saveBill(dummyBill);
      }
    }
    
    setTimeout(() => {
      if (realBills.length > 0) {
        setBills(realBills);
        setShowDummyBill(false);
      } else if (showDummyBill) {
        setBills([dummyBill]);
      }
      setLoading(false);
    }, 800);
    
    // Show guide for first-time users
    const hasSeenGuide = localStorage.getItem('hasSeenGuide');
    if (!hasSeenGuide) {
      setShowGuide(true);
    }
  }, [showDummyBill]);

  const handleDeleteBill = (id: string) => {
    if (id === "dummy-bill") {
      setShowDummyBill(false);
      setBills([]);
      removeBill(id); // Remove from storage too
    } else {
      removeBill(id);
      setBills(bills.filter(bill => bill.id !== id));
    }
    toast.success("Bill deleted successfully");
  };

  const handleAddFriend = (friend: Participant) => {
    const updatedFriends = addFriend(friend);
    setFriends(updatedFriends);
    toast.success(`${friend.name} added to your friends`);
  };

  const handleRemoveFriend = (id: string) => {
    const updatedFriends = removeFriend(id);
    setFriends(updatedFriends);
    toast.success("Friend removed");
  };
  
  const handleDismissGuide = () => {
    setShowGuide(false);
    localStorage.setItem('hasSeenGuide', 'true');
  };

  return (
    <Layout>
      <div className="py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Split</h1>
          <p className="text-muted-foreground">
            Share expenses with friends easily
          </p>
        </motion.div>

        {showGuide && <UserGuide onDismiss={handleDismissGuide} />}

        <FriendsList 
          friends={friends}
          onAddFriend={handleAddFriend}
          onRemoveFriend={handleRemoveFriend}
        />

        {loading ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/50 h-32 animate-pulse-soft" />
          </div>
        ) : bills.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Recent Splits</h2>
              {bills.length === 1 && bills[0].isDummy && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground"
                  onClick={() => handleDeleteBill("dummy-bill")}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Remove Example
                </Button>
              )}
            </div>
            
            {bills[0]?.isDummy && (
              <div className="bg-muted/30 rounded-lg py-2 px-3 mb-3 flex items-center text-sm text-muted-foreground">
                <Info className="h-4 w-4 mr-2 flex-shrink-0" />
                <p>This is an example bill. Click to explore how bill splitting works.</p>
              </div>
            )}
            
            <div>
              {bills.map((bill, index) => (
                <BillCard 
                  key={bill.id} 
                  bill={bill}
                  index={index}
                  onDelete={handleDeleteBill}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted/50 rounded-full p-6 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">No splits yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first split to get started
            </p>
          </div>
        )}
      </div>
      
      <NewSplitButton />
    </Layout>
  );
};

export default Index;
