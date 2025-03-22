
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { Bill, BillItem, Participant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, generateId, sampleBills } from "@/lib/utils";
import { Plus, Trash2, Receipt, User } from "lucide-react";

const SplitDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bill, setBill] = useState<Bill | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [newItemParticipants, setNewItemParticipants] = useState<string[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [paidBy, setPaidBy] = useState<string>("");
  
  useEffect(() => {
    // In a real app, fetch the bill from storage
    const foundBill = sampleBills.find(b => b.id === id) || sampleBills[0];
    
    if (foundBill) {
      setBill(foundBill);
      setPaidBy(foundBill.paidBy || foundBill.participants[0].id);
    }
  }, [id]);
  
  const handleAddItem = () => {
    if (!bill || !newItemName.trim() || !newItemAmount || newItemParticipants.length === 0) {
      return;
    }
    
    const amount = parseFloat(newItemAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    
    const newItem: BillItem = {
      id: generateId("item-"),
      name: newItemName.trim(),
      amount,
      participants: newItemParticipants,
    };
    
    const updatedBill = {
      ...bill,
      items: [...bill.items, newItem],
      totalAmount: bill.totalAmount + amount,
    };
    
    setBill(updatedBill);
    setNewItemName("");
    setNewItemAmount("");
    setNewItemParticipants([]);
    setIsAddingItem(false);
  };
  
  const handleRemoveItem = (itemId: string) => {
    if (!bill) return;
    
    const itemToRemove = bill.items.find(item => item.id === itemId);
    if (!itemToRemove) return;
    
    const updatedBill = {
      ...bill,
      items: bill.items.filter(item => item.id !== itemId),
      totalAmount: bill.totalAmount - itemToRemove.amount,
    };
    
    setBill(updatedBill);
  };
  
  const handleParticipantToggle = (participantId: string) => {
    if (newItemParticipants.includes(participantId)) {
      setNewItemParticipants(newItemParticipants.filter(id => id !== participantId));
    } else {
      setNewItemParticipants([...newItemParticipants, participantId]);
    }
  };
  
  const handleSelectAll = () => {
    if (!bill) return;
    
    if (newItemParticipants.length === bill.participants.length) {
      setNewItemParticipants([]);
    } else {
      setNewItemParticipants(bill.participants.map(p => p.id));
    }
  };
  
  const handleCalculateSplit = () => {
    if (!bill) return;
    
    const updatedBill = {
      ...bill,
      paidBy,
    };
    
    // In a real app, save the updated bill
    navigate(`/split-summary/${bill.id}`);
  };
  
  if (!bill) {
    return (
      <Layout showBackButton title="Loading...">
        <div className="flex items-center justify-center h-full py-12">
          <div className="animate-pulse-soft text-center">
            <div className="h-8 w-32 bg-muted/50 rounded mb-4 mx-auto" />
            <div className="h-32 w-full bg-muted/50 rounded" />
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout showBackButton title={bill.title}>
      <div className="py-6">
        <div className="glass-panel rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Bill Items</h2>
            <span className="text-lg font-medium">
              {formatCurrency(bill.totalAmount)}
            </span>
          </div>
          
          <AnimatePresence>
            {bill.items.length > 0 ? (
              <div className="space-y-3 mb-4">
                {bill.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between bg-white rounded-lg p-3 shadow-soft"
                  >
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{item.name}</span>
                        <span>{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Split among {item.participants.length} people
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 text-muted-foreground"
              >
                <Receipt className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No items yet</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {isAddingItem ? (
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
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g., Pizza, Drinks"
                  />
                </div>
                
                <div>
                  <Label htmlFor="itemAmount">Amount</Label>
                  <Input
                    id="itemAmount"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
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
                      onClick={handleSelectAll}
                    >
                      {newItemParticipants.length === bill.participants.length 
                        ? "Deselect All" 
                        : "Select All"}
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {bill.participants.map((participant) => (
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
                  onClick={handleAddItem}
                  disabled={!newItemName.trim() || !newItemAmount || newItemParticipants.length === 0}
                  className="flex-1"
                >
                  Add
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingItem(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsAddingItem(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>
        
        <div className="glass-panel rounded-xl p-4 mb-6">
          <h2 className="text-lg font-medium mb-3">Paid By</h2>
          
          <div className="space-y-2">
            {bill.participants.map((participant) => (
              <div 
                key={participant.id}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  paidBy === participant.id 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'bg-white hover:bg-muted/20'
                }`}
                onClick={() => setPaidBy(participant.id)}
              >
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-3">
                  {participant.avatar ? (
                    <img 
                      src={participant.avatar} 
                      alt={participant.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <span>{participant.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <Button 
          className="w-full py-6 text-lg"
          onClick={handleCalculateSplit}
          disabled={bill.items.length === 0}
        >
          Calculate Split
        </Button>
      </div>
    </Layout>
  );
};

export default SplitDetails;
