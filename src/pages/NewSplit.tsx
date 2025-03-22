
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import AddParticipant from "@/components/SplitBill/AddParticipant";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { generateId } from "@/lib/utils";
import { Bill, Participant } from "@/lib/types";

const NewSplit: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([
    { id: generateId("p-"), name: "You" }
  ]);
  
  const handleAddParticipant = (participant: Participant) => {
    setParticipants([...participants, participant]);
  };
  
  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
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
