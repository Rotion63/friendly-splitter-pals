import { useState, useEffect, useCallback } from "react";
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
  const [isSaving, setIsSaving] = useState(false);

  // Load bill on mount - using useCallback to prevent recreation on each render
  const loadBill = useCallback(() => {
    if (!billId) {
      onNavigate("/");
      return;
    }
    
    setIsLoading(true);
    const foundBill = getBillById(billId);
    
    if (foundBill) {
      setBill(foundBill);
      setPaidBy(foundBill.paidBy || foundBill.participants[0]?.id || "");
      
      if (foundBill.partialPayments && foundBill.partialPayments.length > 0) {
        setPartialPayments(foundBill.partialPayments);
        setUsePartialPayment(true);
      } else {
        setPartialPayments([]);
        setUsePartialPayment(false);
      }
      
      setDiscount(foundBill.discount || 0);
      
      // Associate bill with trip if needed
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

  // Initial load
  useEffect(() => {
    loadBill();
  }, [loadBill]);
  
  // Reset partial payments when toggling use partial payment
  useEffect(() => {
    if (!usePartialPayment) {
      setPartialPayments([]);
    }
  }, [usePartialPayment]);

  // Save bill with debounce to prevent too many saves
  const saveBillWithDebounce = useCallback((updatedBill: Bill) => {
    if (isSaving) return;
    
    setIsSaving(true);
    setBill(updatedBill);
    updateBill(updatedBill);
    
    // Reset saving state after a small delay
    setTimeout(() => {
      setIsSaving(false);
    }, 300);
  }, [isSaving]);

  // Item management
  const addItem = useCallback((
    newItemName: string, 
    newItemAmount: number, 
    newItemParticipants: string[],
    newItemRate?: number,
    newItemQuantity?: number
  ) => {
    if (!bill || !newItemName.trim() || isNaN(newItemAmount) || newItemAmount <= 0 || newItemParticipants.length === 0) {
      return false;
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
    
    saveBillWithDebounce(updatedBill);
    return true;
  }, [bill, saveBillWithDebounce]);
  
  const removeItem = useCallback((itemId: string) => {
    if (!bill) return;
    
    const itemToRemove = bill.items.find(item => item.id === itemId);
    if (!itemToRemove) return;
    
    const updatedBill = {
      ...bill,
      items: bill.items.filter(item => item.id !== itemId),
      totalAmount: bill.totalAmount - itemToRemove.amount,
    };
    
    saveBillWithDebounce(updatedBill);
  }, [bill, saveBillWithDebounce]);
  
  // Updated to handle both price and amount properties
  const addMenuItems = useCallback((menuItems: MenuItem[] | { name: string; price: number }[] | { name: string; amount: number }[]) => {
    if (!bill) return false;
    
    let newTotalAmount = bill.totalAmount;
    const newItems = [...bill.items];
    
    menuItems.forEach(item => {
      // Handle both price and amount properties
      const itemPrice = 'price' in item ? item.price : ('amount' in item ? item.amount : 0);
      
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
    
    saveBillWithDebounce(updatedBill);
    return true;
  }, [bill, saveBillWithDebounce]);

  // Participant management
  const addParticipant = useCallback((participant: Participant) => {
    if (!bill) return false;
    
    if (bill.participants.some(p => p.id === participant.id)) {
      toast.error(`${participant.name} is already in this bill`);
      return false;
    }
    
    const updatedBill = {
      ...bill,
      participants: [...bill.participants, participant]
    };
    
    saveBillWithDebounce(updatedBill);
    toast.success(`${participant.name} added to this bill`);
    return true;
  }, [bill, saveBillWithDebounce]);
  
  const removeParticipant = useCallback((id: string) => {
    if (!bill) return false;
    
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
    
    saveBillWithDebounce(updatedBill);
    toast.success("Participant removed");
    return true;
  }, [bill, saveBillWithDebounce]);

  // Payment handling
  const updatePartialPayments = useCallback((payments: PartialPayment[]) => {
    if (!bill) return;
    
    const updatedBill = {
      ...bill,
      partialPayments: payments
    };
    
    setPartialPayments(payments);
    saveBillWithDebounce(updatedBill);
  }, [bill, saveBillWithDebounce]);
  
  const updateDiscount = useCallback((discountAmount: number) => {
    if (!bill) return;
    
    const updatedBill = {
      ...bill,
      discount: discountAmount
    };
    
    setDiscount(discountAmount);
    saveBillWithDebounce(updatedBill);
  }, [bill, saveBillWithDebounce]);
  
  const finalizePayment = useCallback(() => {
    if (!bill) return false;
    
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
      updatedBill.partialPayments = [];
    }
    
    updateBill(updatedBill);
    return true;
  }, [bill, discount, partialPayments, paidBy, usePartialPayment]);
  
  const deleteBill = useCallback(() => {
    if (!bill) return;
    
    removeBill(bill.id);
    toast.success("Bill deleted successfully");
    
    if (bill.tripId) {
      onNavigate(`/trip/${bill.tripId}`);
    } else {
      onNavigate("/");
    }
  }, [bill, onNavigate]);

  // Calculate remaining amount
  const getRemainingAmount = useCallback(() => {
    if (!bill) return 0;
    
    const totalPaid = partialPayments.reduce((sum, payment) => sum + payment.amount, 0);
    return bill.totalAmount - totalPaid - discount;
  }, [bill, partialPayments, discount]);

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
