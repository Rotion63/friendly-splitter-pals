
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import AddParticipant from "@/components/SplitBill/AddParticipant";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { generateId } from "@/lib/utils";
import { Bill, Participant } from "@/lib/types";
import { getFriends } from "@/lib/friendsStorage";
import { UserPlus } from "lucide-react";

const NewSplit: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([
    { id: generateId("p-"), name: "You" }
  ]);
  const [friends, setFriends] = useState<Participant[]>([]);
  const [showAddFriends, setShowAddFriends] = useState(false);
  
  useEffect(() => {
    // Load friends from storage
    setFriends(getFriends());
  }, []);
  
  const handleAddParticipant = (participant: Participant) => {
    setParticipants([...participants, participant]);
  };
  
  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const addFriendAsParticipant = (friend: Participant) => {
    // Check if friend is already a participant
    if (!participants.some(p => p.id === friend.id)) {
      setParticipants([...participants, friend]);
      toast.success(`${friend.name} added to this split`);
    } else {
      toast.error(`${friend.name} is already in this split`);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || participants.length === 0) {
      return;
    }
    
    const newBill: Bill = {
      id: generateId("bill-"),
      title: title.trim(),
      date: new Date().toISOString(),
      totalAmount: 0, // Will be updated as items are added
      participants,
      items: [],
      paidBy: participants[0].id, // Default to first person (You)
    };
    
    // In a real app, we would save this to storage
    console.log("New bill created:", newBill);
    
    // Navigate to bill details page
    navigate(`/split-details/${newBill.id}`);
  };
  
  return (
    <Layout showBackButton title="New Split">
      <div className="py-6">
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Split Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Dinner, Vacation, Groceries"
              className="text-lg"
              required
            />
          </div>
          
          <AddParticipant
            participants={participants}
            onAdd={handleAddParticipant}
            onRemove={handleRemoveParticipant}
          />
          
          {friends.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Add from friends</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAddFriends(!showAddFriends)}
                >
                  {showAddFriends ? 'Hide' : 'Show'}
                </Button>
              </div>
              
              {showAddFriends && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2"
                >
                  {friends.map(friend => (
                    <Button
                      key={friend.id}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => addFriendAsParticipant(friend)}
                      disabled={participants.some(p => p.id === friend.id)}
                    >
                      <span>{friend.name}</span>
                      <UserPlus className="h-3.5 w-3.5" />
                    </Button>
                  ))}
                </motion.div>
              )}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full py-6 text-lg"
            disabled={!title.trim() || participants.length === 0}
          >
            Continue
          </Button>
        </motion.form>
      </div>
    </Layout>
  );
};

export default NewSplit;
