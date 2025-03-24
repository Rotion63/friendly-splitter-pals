
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Bill, BillItem, PartialPayment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { generateId } from "@/lib/utils";
import BillItemList from "@/components/SplitBill/BillItemList";
import AddBillItem from "@/components/SplitBill/AddBillItem";
import PaidBySelector from "@/components/SplitBill/PaidBySelector";
import PartialPaymentManager from "@/components/SplitBill/PartialPaymentManager";
import DiscountInput from "@/components/SplitBill/DiscountInput";
import { createEmptyBill, getBillById, saveBill } from "@/lib/billStorage";
import { formatCurrency } from "@/lib/utils";

const SplitDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bill, setBill] = useState<Bill | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [newItemParticipants, setNewItemParticipants] = useState<string[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [paidBy, setPaidBy] = useState<string>("");
  const [partialPayments, setPartialPayments] = useState<PartialPayment[]>([]);
  const [usePartialPayment, setUsePartialPayment] = useState(false);
  const [discount, setDiscount] = useState<number>(0);
  
  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }
    
    // Get bill from storage
    const foundBill = getBillById(id);
    
    if (foundBill) {
      setBill(foundBill);
      setPaidBy(foundBill.paidBy || foundBill.participants[0]?.id || "");
      
      // Initialize partial payments state
      if (foundBill.partialPayments && foundBill.partialPayments.length > 0) {
        setPartialPayments(foundBill.partialPayments);
        setUsePartialPayment(true);
      }
      
      setDiscount(foundBill.discount || 0);
    } else {
      toast.error("Bill not found");
      navigate("/");
    }
  }, [id, navigate]);
  
  useEffect(() => {
    // When usePartialPayment changes, update partial payments accordingly
    if (!usePartialPayment) {
      setPartialPayments([]);
    }
  }, [usePartialPayment]);
  
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
    saveBill(updatedBill); // Save updated bill to storage
    
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
    saveBill(updatedBill); // Save updated bill to storage
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
  
  const handlePartialPaymentsChange = (payments: PartialPayment[]) => {
    setPartialPayments(payments);
    if (bill) {
      const updatedBill = {
        ...bill,
        partialPayments: payments
      };
      setBill(updatedBill);
      saveBill(updatedBill);
    }
  };
  
  const handleDiscountChange = (discountAmount: number) => {
    setDiscount(discountAmount);
    if (bill) {
      const updatedBill = {
        ...bill,
        discount: discountAmount
      };
      setBill(updatedBill);
      saveBill(updatedBill);
    }
  };
  
  const handleCalculateSplit = () => {
    if (!bill) return;
    
    // Check if we need to set paidBy (for remaining amount after partial payments)
    const totalPaid = partialPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingAmount = bill.totalAmount - totalPaid - discount;
    
    let updatedBill: Bill = {
      ...bill,
      discount,
    };
    
    // Handle partial payments logic
    if (usePartialPayment) {
      updatedBill.partialPayments = partialPayments;
      
      // If there's remaining amount to be paid and we have a paidBy, include it
      if (remainingAmount > 0 && paidBy) {
        updatedBill.paidBy = paidBy;
      } else {
        // If everything is covered by partial payments, we don't need paidBy
        delete updatedBill.paidBy;
      }
    } else {
      // If not using partial payments, just set paidBy
      updatedBill.paidBy = paidBy;
      // Delete partialPayments if it exists
      delete updatedBill.partialPayments;
    }
    
    saveBill(updatedBill);
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
  
  // Calculate total after partial payments
  const totalPaid = partialPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = bill.totalAmount - totalPaid - discount;
  
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
        
        {/* Add the discount input */}
        <DiscountInput 
          totalAmount={bill.totalAmount}
          discount={discount}
          onDiscountChange={handleDiscountChange}
        />
        
        {/* Payment Method Selection */}
        <div className="glass-panel rounded-xl p-4 mb-6">
          <h2 className="text-lg font-medium mb-3">Payment Method</h2>
          <div className="flex space-x-2 mb-4">
            <Button
              variant={!usePartialPayment ? "default" : "outline"}
              className="flex-1"
              onClick={() => setUsePartialPayment(false)}
            >
              Single Payer
            </Button>
            <Button
              variant={usePartialPayment ? "default" : "outline"}
              className="flex-1"
              onClick={() => setUsePartialPayment(true)}
            >
              Multiple Payers
            </Button>
          </div>
        </div>
        
        {/* Conditional rendering based on payment method */}
        {usePartialPayment ? (
          <PartialPaymentManager 
            participants={bill.participants}
            partialPayments={partialPayments}
            totalAmount={bill.totalAmount - discount}
            onPartialPaymentsChange={handlePartialPaymentsChange}
          />
        ) : (
          <PaidBySelector 
            participants={bill.participants}
            paidBy={paidBy}
            onPaidByChange={setPaidBy}
          />
        )}
        
        {/* Show PaidBy for remaining amount only if there are partial payments */}
        {usePartialPayment && remainingAmount > 0 && (
          <PaidBySelector 
            participants={bill.participants}
            paidBy={paidBy}
            onPaidByChange={setPaidBy}
          />
        )}
        
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
