
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Bill, BillItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { generateId, sampleBills } from "@/lib/utils";
import BillItemList from "@/components/SplitBill/BillItemList";
import AddBillItem from "@/components/SplitBill/AddBillItem";
import PaidBySelector from "@/components/SplitBill/PaidBySelector";
import { getFriends } from "@/lib/friendsStorage";

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
          
          <BillItemList 
            items={bill.items} 
            onRemoveItem={handleRemoveItem} 
          />
          
          <AddBillItem 
            isAdding={isAddingItem}
            participants={bill.participants}
            newItemName={newItemName}
            newItemAmount={newItemAmount}
            newItemParticipants={newItemParticipants}
            onNewItemNameChange={setNewItemName}
            onNewItemAmountChange={setNewItemAmount}
            onParticipantToggle={handleParticipantToggle}
            onSelectAll={handleSelectAll}
            onAdd={handleAddItem}
            onCancel={() => setIsAddingItem(!isAddingItem)}
          />
        </div>
        
        <PaidBySelector 
          participants={bill.participants}
          paidBy={paidBy}
          onPaidByChange={setPaidBy}
        />
        
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

// Missing import in the refactored file
import { formatCurrency } from "@/lib/utils";

export default SplitDetails;
