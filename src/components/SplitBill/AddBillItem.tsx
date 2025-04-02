
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Participant, BillItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface AddBillItemProps {
  isAdding?: boolean;
  participants: Participant[];
  newItemName?: string;
  newItemAmount?: string;
  newItemParticipants?: string[];
  onNewItemNameChange?: (value: string) => void;
  onNewItemAmountChange?: (value: string) => void;
  onParticipantToggle?: (id: string) => void;
  onSelectAll?: () => void;
  onAdd?: () => void;
  onCancel?: () => void;
  newItemRate?: string;
  newItemQuantity?: string;
  onNewItemRateChange?: (value: string) => void;
  onNewItemQuantityChange?: (value: string) => void;
  useRateQuantity?: boolean;
  onToggleRateQuantity?: () => void;
  onAddItem?: (item: BillItem) => void; // Added for compatibility
}

const AddBillItem: React.FC<AddBillItemProps> = ({
  isAdding: externalIsAdding,
  participants,
  newItemName: externalNewItemName,
  newItemAmount: externalNewItemAmount,
  newItemParticipants: externalNewItemParticipants,
  onNewItemNameChange,
  onNewItemAmountChange,
  onParticipantToggle,
  onSelectAll,
  onAdd,
  onCancel,
  newItemRate: externalNewItemRate,
  newItemQuantity: externalNewItemQuantity,
  onNewItemRateChange,
  onNewItemQuantityChange,
  useRateQuantity: externalUseRateQuantity,
  onToggleRateQuantity,
  onAddItem
}) => {
  // Internal state management if not provided externally
  const [internalIsAdding, setInternalIsAdding] = useState(false);
  const [internalNewItemName, setInternalNewItemName] = useState("");
  const [internalNewItemAmount, setInternalNewItemAmount] = useState("");
  const [internalNewItemParticipants, setInternalNewItemParticipants] = useState<string[]>([]);
  const [internalNewItemRate, setInternalNewItemRate] = useState("");
  const [internalNewItemQuantity, setInternalNewItemQuantity] = useState("");
  const [internalUseRateQuantity, setInternalUseRateQuantity] = useState(false);

  // Use external values if provided, otherwise use internal state
  const isAdding = externalIsAdding !== undefined ? externalIsAdding : internalIsAdding;
  const newItemName = externalNewItemName !== undefined ? externalNewItemName : internalNewItemName;
  const newItemAmount = externalNewItemAmount !== undefined ? externalNewItemAmount : internalNewItemAmount;
  const newItemParticipants = externalNewItemParticipants !== undefined ? externalNewItemParticipants : internalNewItemParticipants;
  const newItemRate = externalNewItemRate !== undefined ? externalNewItemRate : internalNewItemRate;
  const newItemQuantity = externalNewItemQuantity !== undefined ? externalNewItemQuantity : internalNewItemQuantity;
  const useRateQuantity = externalUseRateQuantity !== undefined ? externalUseRateQuantity : internalUseRateQuantity;

  // Handler functions
  const handleNewItemNameChange = (value: string) => {
    if (onNewItemNameChange) {
      onNewItemNameChange(value);
    } else {
      setInternalNewItemName(value);
    }
  };

  const handleNewItemAmountChange = (value: string) => {
    if (onNewItemAmountChange) {
      onNewItemAmountChange(value);
    } else {
      setInternalNewItemAmount(value);
    }
  };

  const handleParticipantToggle = (id: string) => {
    if (onParticipantToggle) {
      onParticipantToggle(id);
    } else {
      setInternalNewItemParticipants(prev => 
        prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
      );
    }
  };

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll();
    } else {
      if (internalNewItemParticipants.length === participants.length) {
        setInternalNewItemParticipants([]);
      } else {
        setInternalNewItemParticipants(participants.map(p => p.id));
      }
    }
  };

  const handleNewItemRateChange = (value: string) => {
    if (onNewItemRateChange) {
      onNewItemRateChange(value);
    } else {
      setInternalNewItemRate(value);
    }
  };

  const handleNewItemQuantityChange = (value: string) => {
    if (onNewItemQuantityChange) {
      onNewItemQuantityChange(value);
    } else {
      setInternalNewItemQuantity(value);
    }
  };

  const handleToggleRateQuantity = () => {
    if (onToggleRateQuantity) {
      onToggleRateQuantity();
    } else {
      setInternalUseRateQuantity(prev => !prev);
    }
  };

  // Add item handler
  const handleAdd = () => {
    if (onAdd) {
      onAdd();
    } else if (onAddItem) {
      // Create a new item
      const newItem: BillItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newItemName,
        amount: parseFloat(newItemAmount) || 0,
        participants: newItemParticipants,
        rate: useRateQuantity ? parseFloat(newItemRate) || 0 : undefined,
        quantity: useRateQuantity ? parseInt(newItemQuantity) || 0 : undefined
      };
      
      onAddItem(newItem);
      
      // Reset form
      setInternalIsAdding(false);
      setInternalNewItemName("");
      setInternalNewItemAmount("");
      setInternalNewItemParticipants([]);
      setInternalNewItemRate("");
      setInternalNewItemQuantity("");
      setInternalUseRateQuantity(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setInternalIsAdding(false);
    }
  };

  const handleToggleForm = () => {
    setInternalIsAdding(prev => !prev);
  };

  // Effect to update amount when using rate * quantity
  useEffect(() => {
    if (useRateQuantity && newItemRate && newItemQuantity) {
      const rate = parseFloat(newItemRate);
      const quantity = parseFloat(newItemQuantity);
      if (!isNaN(rate) && !isNaN(quantity)) {
        handleNewItemAmountChange((rate * quantity).toFixed(2));
      }
    }
  }, [newItemRate, newItemQuantity, useRateQuantity]);

  if (!isAdding) {
    return (
      <Button 
        variant="outline" 
        className="w-full"
        onClick={onCancel ? handleCancel : handleToggleForm}
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
            onChange={(e) => handleNewItemNameChange(e.target.value)}
            placeholder="e.g., Pizza, Drinks"
          />
        </div>
        
        <div className="flex items-center space-x-2 my-2">
          <Checkbox 
            id="useRateQuantity" 
            checked={useRateQuantity}
            onCheckedChange={handleToggleRateQuantity}
          />
          <Label 
            htmlFor="useRateQuantity" 
            className="text-sm cursor-pointer"
          >
            Use Rate × Quantity
          </Label>
        </div>
        
        {useRateQuantity ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="itemRate">Rate</Label>
              <Input
                id="itemRate"
                value={newItemRate}
                onChange={(e) => handleNewItemRateChange(e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0.01"
              />
            </div>
            <div>
              <Label htmlFor="itemQuantity">Quantity</Label>
              <Input
                id="itemQuantity"
                value={newItemQuantity}
                onChange={(e) => handleNewItemQuantityChange(e.target.value)}
                placeholder="1"
                type="number"
                step="1"
                min="1"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="itemAmount">Total Amount</Label>
              <Input
                id="itemAmount"
                value={newItemAmount}
                readOnly
                className="bg-muted/20"
              />
            </div>
          </div>
        ) : (
          <div>
            <Label htmlFor="itemAmount">Amount</Label>
            <Input
              id="itemAmount"
              value={newItemAmount}
              onChange={(e) => handleNewItemAmountChange(e.target.value)}
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0.01"
            />
          </div>
        )}
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Split between</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleSelectAll}
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
                  onCheckedChange={() => handleParticipantToggle(participant.id)}
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
          onClick={handleAdd}
          disabled={!newItemName.trim() || !newItemAmount || newItemParticipants.length === 0 || 
            (useRateQuantity && (!newItemRate || !newItemQuantity))}
          className="flex-1"
        >
          Add
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel ? handleCancel : handleToggleForm}
        >
          Cancel
        </Button>
      </div>
    </motion.div>
  );
};

export default AddBillItem;
