
import { useState, useEffect } from "react";
import { Bill, BillItem, PartialPayment, Participant, MenuItem } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { getBillById, updateBill, saveBill, removeBill } from "@/lib/billStorage";
import { toast } from "sonner";

export interface UseBillManagerProps {
  billId: string | undefined;
  tripId?: string | null;
  onNavigate: (path: string) => void;
}

export function useBillManager({ billId, tripId, onNavigate }: UseBillManagerProps) {
  const [bill, setBill] = useState<Bill | null>(null);
  const [paidBy, setPaidBy] = useState<string>("");
  const [partialPayments, setPartialPayments] = useState<PartialPayment[]>([]);
  const [usePartialPayment, setUsePartialPayment] = useState(false);
  const [discount, setDiscount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load bill on mount
  useEffect(() => {
    if (!billId) {
      onNavigate("/");
      return;
    }
    
    const foundBill = getBillById(billId);
    
    if (foundBill) {
      setBill(foundBill);
      setPaidBy(foundBill.paidBy || foundBill.participants[0]?.id || "");
      
      if (foundBill.partialPayments && foundBill.partialPayments.length > 0) {
        setPartialPayments(foundBill.partialPayments);
        setUsePartialPayment(true);
      }
      
      setDiscount(foundBill.discount || 0);
      
      if (tripId && !foundBill.tripId) {
        const updatedBill = { ...foundBill, tripId };
        updateBill(updatedBill);
        setBill(updatedBill);
      }
    } else {
      toast.error("Bill not found");
      onNavigate("/");
    }
    
    setIsLoading(false);
  }, [billId, onNavigate, tripId]);
  
  // Reset partial payments when toggling use partial payment
  useEffect(() => {
    if (!usePartialPayment) {
      setPartialPayments([]);
    }
  }, [usePartialPayment]);

  // Item management
  const addItem = (
    newItemName: string, 
    newItemAmount: number, 
    newItemParticipants: string[],
    newItemRate?: number,
    newItemQuantity?: number
  ) => {
    if (!bill || !newItemName.trim() || isNaN(newItemAmount) || newItemAmount <= 0 || newItemParticipants.length === 0) {
      return;
    }
    
    let newItem: BillItem = {
      id: generateId("item-"),
      name: newItemName.trim(),
      amount: newItemAmount,
      participants: newItemParticipants,
    };
    
    if (newItemRate !== undefined && newItemQuantity !== undefined) {
      newItem.rate = newItemRate;
      newItem.quantity = newItemQuantity;
    }
    
    const updatedBill = {
      ...bill,
      items: [...bill.items, newItem],
      totalAmount: bill.totalAmount + newItemAmount,
    };
    
    setBill(updatedBill);
    updateBill(updatedBill);
    
    return true;
  };
  
  const removeItem = (itemId: string) => {
    if (!bill) return;
    
    const itemToRemove = bill.items.find(item => item.id === itemId);
    if (!itemToRemove) return;
    
    const updatedBill = {
      ...bill,
      items: bill.items.filter(item => item.id !== itemId),
      totalAmount: bill.totalAmount - itemToRemove.amount,
    };
    
    setBill(updatedBill);
    updateBill(updatedBill);
  };
  
  const addMenuItems = (menuItems: MenuItem[] | { name: string; price: number }[]) => {
    if (!bill) return;
    
    let newTotalAmount = bill.totalAmount;
    const newItems = [...bill.items];
    
    menuItems.forEach(item => {
      // Correctly handle both types of objects
      const itemPrice = 'price' in item ? item.price : ('amount' in item ? (item as any).amount : 0);
      
      const newItem: BillItem = {
        id: generateId("item-"),
        name: item.name,
        amount: itemPrice,
        participants: bill.participants.map(p => p.id)
      };
      
      newItems.push(newItem);
      newTotalAmount += itemPrice;
    });
    
    const updatedBill = {
      ...bill,
      items: newItems,
      totalAmount: newTotalAmount
    };
    
    setBill(updatedBill);
    updateBill(updatedBill);
    return true;
  };

  // Participant management
  const addParticipant = (participant: Participant) => {
    if (!bill) return;
    
    if (bill.participants.some(p => p.id === participant.id)) {
      toast.error(`${participant.name} is already in this bill`);
      return false;
    }
    
    const updatedBill = {
      ...bill,
      participants: [...bill.participants, participant]
    };
    
    setBill(updatedBill);
    updateBill(updatedBill);
    toast.success(`${participant.name} added to this bill`);
    return true;
  };
  
  const removeParticipant = (id: string) => {
    if (!bill) return;
    
    const isParticipantInItems = bill.items.some(item => 
      item.participants.includes(id)
    );
    
    if (isParticipantInItems) {
      toast.error("Cannot remove participant who is part of bill items");
      return false;
    }
    
    if (bill.paidBy === id) {
      toast.error("Cannot remove participant who paid for the bill");
      return false;
    }
    
    const hasPartialPayment = bill.partialPayments?.some(
      payment => payment.payerId === id
    );
    
    if (hasPartialPayment) {
      toast.error("Cannot remove participant who has made payments");
      return false;
    }
    
    const updatedBill = {
      ...bill,
      participants: bill.participants.filter(p => p.id !== id)
    };
    
    setBill(updatedBill);
    updateBill(updatedBill);
    toast.success("Participant removed");
    return true;
  };

  // Payment handling
  const updatePartialPayments = (payments: PartialPayment[]) => {
    setPartialPayments(payments);
    if (bill) {
      const updatedBill = {
        ...bill,
        partialPayments: payments
      };
      setBill(updatedBill);
      updateBill(updatedBill);
    }
  };
  
  const updateDiscount = (discountAmount: number) => {
    setDiscount(discountAmount);
    if (bill) {
      const updatedBill = {
        ...bill,
        discount: discountAmount
      };
      setBill(updatedBill);
      updateBill(updatedBill);
    }
  };
  
  const finalizePayment = () => {
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
      if (!updatedBill.partialPayments) {
        updatedBill.partialPayments = [];
      }
    }
    
    updateBill(updatedBill);
    return true;
  };
  
  const deleteBill = () => {
    if (!bill) return;
    
    removeBill(bill.id);
    toast.success("Bill deleted successfully");
    
    if (bill.tripId) {
      onNavigate(`/trip/${bill.tripId}`);
    } else {
      onNavigate("/");
    }
  };

  // Calculate remaining amount
  const getRemainingAmount = () => {
    if (!bill) return 0;
    
    const totalPaid = partialPayments.reduce((sum, payment) => sum + payment.amount, 0);
    return bill.totalAmount - totalPaid - discount;
  };

  return {
    bill,
    paidBy,
    partialPayments,
    usePartialPayment,
    discount,
    isLoading,
    
    // Setters
    setPaidBy,
    setUsePartialPayment,
    
    // Item management
    addItem,
    removeItem,
    addMenuItems,
    
    // Participant management
    addParticipant,
    removeParticipant,
    
    // Payment handling
    updatePartialPayments,
    updateDiscount,
    finalizePayment,
    deleteBill,
    
    // Utilities
    getRemainingAmount,
  };
}
