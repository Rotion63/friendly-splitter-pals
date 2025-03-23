
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Participant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface AddBillItemProps {
  isAdding: boolean;
  participants: Participant[];
  newItemName: string;
  newItemAmount: string;
  newItemParticipants: string[];
  onNewItemNameChange: (value: string) => void;
  onNewItemAmountChange: (value: string) => void;
  onParticipantToggle: (id: string) => void;
  onSelectAll: () => void;
  onAdd: () => void;
  onCancel: () => void;
}

const AddBillItem: React.FC<AddBillItemProps> = ({
  isAdding,
  participants,
  newItemName,
  newItemAmount,
  newItemParticipants,
  onNewItemNameChange,
  onNewItemAmountChange,
  onParticipantToggle,
  onSelectAll,
  onAdd,
  onCancel,
}) => {
  if (!isAdding) {
    return (
      <Button 
        variant="outline" 
        className="w-full"
        onClick={onCancel}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Item
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border rounded-lg p-4 bg-white"
    >
      <h3 className="font-medium mb-3">Add Item</h3>
      
      <div className="space-y-3 mb-4">
        <div>
          <Label htmlFor="itemName">Name</Label>
          <Input
            id="itemName"
            value={newItemName}
            onChange={(e) => onNewItemNameChange(e.target.value)}
            placeholder="e.g., Pizza, Drinks"
          />
        </div>
        
        <div>
          <Label htmlFor="itemAmount">Amount</Label>
          <Input
            id="itemAmount"
            value={newItemAmount}
            onChange={(e) => onNewItemAmountChange(e.target.value)}
            placeholder="0.00"
            type="number"
            step="0.01"
            min="0.01"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Split between</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={onSelectAll}
            >
              {newItemParticipants.length === participants.length 
                ? "Deselect All" 
                : "Select All"}
            </Button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {participants.map((participant) => (
              <div 
                key={participant.id}
                className="flex items-center space-x-2"
              >
                <Checkbox 
                  id={`participant-${participant.id}`}
                  checked={newItemParticipants.includes(participant.id)}
                  onCheckedChange={() => onParticipantToggle(participant.id)}
                />
                <Label 
                  htmlFor={`participant-${participant.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {participant.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button
          onClick={onAdd}
          disabled={!newItemName.trim() || !newItemAmount || newItemParticipants.length === 0}
          className="flex-1"
        >
          Add
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </motion.div>
  );
};

export default AddBillItem;
