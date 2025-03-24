
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import AddParticipant from "@/components/SplitBill/AddParticipant";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Participant } from "@/lib/types";
import { getFriends } from "@/lib/friendsStorage";
import { UserPlus, AlertCircle } from "lucide-react";
import { createEmptyBill, saveBill } from "@/lib/billStorage";
import { Alert, AlertDescription } from "@/components/ui/alert";

const NewSplit: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [friends, setFriends] = useState<Participant[]>([]);
  const [showAddFriends, setShowAddFriends] = useState(false);
  
  useEffect(() => {
    // Load friends from storage
    const friendsList = getFriends();
    setFriends(friendsList);
    
    // Auto-add the first friend (yourself) if available
    if (friendsList.length > 0) {
      setParticipants([friendsList[0]]);
    }
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
    
    if (!title.trim()) {
      toast.error("Please enter a title for your split");
      return;
    }
    
    if (participants.length < 2) {
      toast.error("You need at least 2 participants to split a bill");
      return;
    }
    
    const newBill = createEmptyBill(title, participants);
    
    // Save bill to storage
    saveBill(newBill);
    console.log("New bill created:", newBill);
    
    // Navigate to bill details page
    navigate(`/split-details/${newBill.id}`);
  };
  
  // Function to determine if we should show friend addition guidance
  const showFriendGuidance = participants.length < 2 && friends.length === 0;
  
  // Fix bug by stopping event propagation
  const toggleShowFriends = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAddFriends(!showAddFriends);
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
          
          {showFriendGuidance && (
            <Alert variant="default" className="bg-muted/50 border-primary/20">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription>
                You need at least 2 participants to split a bill. Add yourself and a friend to continue.
              </AlertDescription>
            </Alert>
          )}
          
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
                  onClick={toggleShowFriends}
                  type="button"
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
                      type="button"
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
            disabled={!title.trim() || participants.length < 2}
          >
            Continue
          </Button>
        </motion.form>
      </div>
    </Layout>
  );
};

export default NewSplit;
