
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Participant } from "@/lib/types";
import { Check, X } from "lucide-react";

interface BillItemFormProps {
  participants: Participant[];
  onAddItem: (
    name: string, 
    amount: number, 
    participants: string[],
    rate?: number,
    quantity?: number
  ) => void;
  onCancel: () => void;
}

const BillItemForm: React.FC<BillItemFormProps> = ({
  participants,
  onAddItem,
  onCancel
}) => {
  const [itemName, setItemName] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(
    participants.map(p => p.id)
  );
  const [useRateQuantity, setUseRateQuantity] = useState(false);
  const [itemRate, setItemRate] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");

  const handleToggleParticipant = (participantId: string) => {
    if (selectedParticipantIds.includes(participantId)) {
      setSelectedParticipantIds(selectedParticipantIds.filter(id => id !== participantId));
    } else {
      setSelectedParticipantIds([...selectedParticipantIds, participantId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedParticipantIds.length === participants.length) {
      setSelectedParticipantIds([]);
    } else {
      setSelectedParticipantIds(participants.map(p => p.id));
    }
  };

  const handleToggleRateQuantity = () => {
    setUseRateQuantity(!useRateQuantity);
    if (!useRateQuantity) {
      setItemRate(itemAmount);
      setItemQuantity("1");
    } else {
      // If switching back, calculate amount based on rate and quantity
      if (itemRate && itemQuantity) {
        const calculatedAmount = (parseFloat(itemRate) * parseFloat(itemQuantity)).toFixed(2);
        setItemAmount(calculatedAmount);
      }
    }
  };

  const handleAddItem = () => {
    if (!itemName.trim() || !itemAmount || selectedParticipantIds.length === 0) {
      return;
    }

    const amount = parseFloat(itemAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    if (useRateQuantity) {
      const rate = parseFloat(itemRate);
      const quantity = parseFloat(itemQuantity);
      if (isNaN(rate) || rate <= 0 || isNaN(quantity) || quantity <= 0) {
        return;
      }
      onAddItem(itemName, amount, selectedParticipantIds, rate, quantity);
    } else {
      onAddItem(itemName, amount, selectedParticipantIds);
    }

    setItemName("");
    setItemAmount("");
    setSelectedParticipantIds(participants.map(p => p.id));
    setItemRate("");
    setItemQuantity("1");
  };

  const handleRateOrQuantityChange = (
    type: "rate" | "quantity", 
    value: string
  ) => {
    if (type === "rate") {
      setItemRate(value);
    } else {
      setItemQuantity(value);
    }

    // Update amount field based on rate and quantity
    if (type === "rate" && value && itemQuantity) {
      const calculatedAmount = (parseFloat(value) * parseFloat(itemQuantity)).toFixed(2);
      setItemAmount(calculatedAmount);
    } else if (type === "quantity" && value && itemRate) {
      const calculatedAmount = (parseFloat(itemRate) * parseFloat(value)).toFixed(2);
      setItemAmount(calculatedAmount);
    }
  };

  return (
    <div className="border p-4 rounded-md shadow-sm bg-white mb-4">
      <h4 className="font-medium text-base mb-4">Add Item</h4>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Item Name</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="E.g., Dinner, Taxi, etc."
          />
        </div>
        
        {useRateQuantity ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm mb-1">Rate</label>
              <input
                type="number"
                value={itemRate}
                onChange={(e) => handleRateOrQuantityChange("rate", e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Price per unit"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Quantity</label>
              <input
                type="number"
                value={itemQuantity}
                onChange={(e) => handleRateOrQuantityChange("quantity", e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Number of units"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm mb-1">Amount</label>
            <input
              type="number"
              value={itemAmount}
              onChange={(e) => setItemAmount(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter amount"
              step="0.01"
              min="0"
            />
          </div>
        )}
        
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useRateQuantity}
              onChange={handleToggleRateQuantity}
              className="mr-2"
            />
            <span className="text-sm">Use Rate × Quantity</span>
          </label>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm">Who consumed this?</label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-primary hover:underline"
            >
              {selectedParticipantIds.length === participants.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          
          <div className="max-h-40 overflow-y-auto border rounded-md">
            {participants.map(participant => (
              <div 
                key={participant.id}
                className="flex items-center p-2 hover:bg-muted/20"
              >
                <input
                  type="checkbox"
                  id={`participant-${participant.id}`}
                  checked={selectedParticipantIds.includes(participant.id)}
                  onChange={() => handleToggleParticipant(participant.id)}
                  className="mr-2"
                />
                <label 
                  htmlFor={`participant-${participant.id}`}
                  className="flex-grow cursor-pointer"
                >
                  {participant.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleAddItem}
            disabled={!itemName.trim() || !itemAmount || selectedParticipantIds.length === 0}
          >
            <Check className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BillItemForm;
