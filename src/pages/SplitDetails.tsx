import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
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
  const [newItemRate, setNewItemRate] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [useRateQuantity, setUseRateQuantity] = useState(false);
  
  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }
    
    const foundBill = getBillById(id);
    
    if (foundBill) {
      setBill(foundBill);
      setPaidBy(foundBill.paidBy || foundBill.participants[0]?.id || "");
      
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
    
    let newItem: BillItem = {
      id: generateId("item-"),
      name: newItemName.trim(),
      amount,
      participants: newItemParticipants,
    };
    
    if (useRateQuantity) {
      newItem.rate = parseFloat(newItemRate);
      newItem.quantity = parseFloat(newItemQuantity);
    }
    
    const updatedBill = {
      ...bill,
      items: [...bill.items, newItem],
      totalAmount: bill.totalAmount + amount,
    };
    
    setBill(updatedBill);
    saveBill(updatedBill);
    
    setNewItemName("");
    setNewItemAmount("");
    setNewItemParticipants([]);
    setNewItemRate("");
    setNewItemQuantity("1");
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
    saveBill(updatedBill);
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
  
  const handleToggleRateQuantity = () => {
    setUseRateQuantity(!useRateQuantity);
    if (!useRateQuantity) {
      setNewItemRate(newItemAmount || "0");
      setNewItemQuantity("1");
    }
  };
  
  const handleCalculateSplit = () => {
    if (!bill) return;
    
    const totalPaid = partialPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingAmount = bill.totalAmount - totalPaid - discount;
    
    let updatedBill: Bill = {
      ...bill,
      discount,
    };
    
    if (usePartialPayment) {
      updatedBill.partialPayments = partialPayments;
      
      if (remainingAmount > 0 && paidBy) {
        updatedBill.paidBy = paidBy;
      } else {
        delete updatedBill.paidBy;
      }
    } else {
      updatedBill.paidBy = paidBy;
      delete updatedBill.partialPayments;
    }
    
    saveBill(updatedBill);
    navigate(`/split-summary/${bill.id}`);
  };
  
  if (!bill) {
    return (
      <AppLayout showBackButton title="Loading...">
        <div className="flex items-center justify-center h-full py-12">
          <div className="animate-pulse-soft text-center">
            <div className="h-8 w-32 bg-muted/50 rounded mb-4 mx-auto" />
            <div className="h-32 w-full bg-muted/50 rounded" />
          </div>
        </div>
      </AppLayout>
    );
  }
  
  const totalPaid = partialPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = bill.totalAmount - totalPaid - discount;
  
  return (
    <AppLayout showBackButton title={bill.title}>
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
            newItemRate={newItemRate}
            newItemQuantity={newItemQuantity}
            onNewItemRateChange={setNewItemRate}
            onNewItemQuantityChange={setNewItemQuantity}
            useRateQuantity={useRateQuantity}
            onToggleRateQuantity={handleToggleRateQuantity}
          />
        </div>
        
        <DiscountInput 
          totalAmount={bill.totalAmount}
          discount={discount}
          onDiscountChange={handleDiscountChange}
        />
        
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
    </AppLayout>
  );
};

export default SplitDetails;
