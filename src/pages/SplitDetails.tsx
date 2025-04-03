import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Bill, BillItem, PartialPayment, MenuItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateId } from "@/lib/utils";
import BillItemList from "@/components/SplitBill/BillItemList";
import AddBillItem from "@/components/SplitBill/AddBillItem";
import PaidBySelector from "@/components/SplitBill/PaidBySelector";
import PartialPaymentManager from "@/components/SplitBill/PartialPaymentManager";
import DiscountInput from "@/components/SplitBill/DiscountInput";
import BillScanner from "@/components/SplitBill/BillScanner";
import MenuSelector from "@/components/SplitBill/MenuSelector";
import { createEmptyBill, getBillById, saveBill } from "@/lib/billStorage";
import { formatCurrency } from "@/lib/utils";
import { Camera, Receipt, Plus, ArrowUp } from "lucide-react";

const SplitDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [activeTab, setActiveTab] = useState("manual");
  const [showBillScanner, setShowBillScanner] = useState(false);
  
  const tripId = new URLSearchParams(location.search).get('tripId');
  
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
      
      if (tripId && !foundBill.tripId) {
        const updatedBill = { ...foundBill, tripId };
        saveBill(updatedBill);
        setBill(updatedBill);
      }
    } else {
      toast.error("Bill not found");
      navigate("/");
    }
  }, [id, navigate, tripId]);
  
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
      if (!updatedBill.partialPayments) {
        updatedBill.partialPayments = [];
      }
    }
    
    saveBill(updatedBill);
    navigate(`/split-summary/${bill.id}`);
  };

  const handleViewSummary = () => {
    if (bill) {
      navigate(`/split-summary/${bill.id}`);
    }
  };
  
  const handleBillScanned = (items: { name: string; amount: number }[]) => {
    if (!bill) return;
    
    let newTotalAmount = bill.totalAmount;
    const newItems = [...bill.items];
    
    items.forEach(item => {
      const newItem: BillItem = {
        id: generateId("item-"),
        name: item.name,
        amount: item.amount,
        participants: bill.participants.map(p => p.id) // Default to all participants
      };
      
      newItems.push(newItem);
      newTotalAmount += item.amount;
    });
    
    const updatedBill = {
      ...bill,
      items: newItems,
      totalAmount: newTotalAmount
    };
    
    setBill(updatedBill);
    saveBill(updatedBill);
  };
  
  const handleMenuItemSelected = (menuItem: MenuItem) => {
    if (!bill) return;
    
    const newItem: BillItem = {
      id: generateId("item-"),
      name: menuItem.name,
      amount: menuItem.price,
      participants: bill.participants.map(p => p.id) // Default to all participants
    };
    
    const updatedBill = {
      ...bill,
      items: [...bill.items, newItem],
      totalAmount: bill.totalAmount + menuItem.price
    };
    
    setBill(updatedBill);
    saveBill(updatedBill);
  };
  
  const handleBackToTrip = () => {
    if (bill?.tripId) {
      navigate(`/trip/${bill.tripId}`);
    }
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
    <AppLayout showBackButton title={bill?.title || "Loading..."}>
      {bill.tripId && (
        <div className="pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-muted-foreground"
            onClick={handleBackToTrip}
          >
            <ArrowUp className="h-3 w-3 mr-1 rotate-315" />
            Back to trip
          </Button>
        </div>
      )}
      
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
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual">Manual</TabsTrigger>
              <TabsTrigger value="scan">Scan Receipt</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual">
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
            </TabsContent>
            
            <TabsContent value="scan">
              <div className="p-4 border rounded-md mt-3">
                <Button 
                  variant="outline" 
                  className="w-full py-6 flex items-center justify-center gap-2"
                  onClick={() => setShowBillScanner(true)}
                >
                  <Camera className="h-5 w-5" />
                  Scan or Upload Receipt
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Use OCR to automatically extract items from your receipt
                </p>
              </div>
              <BillScanner 
                isOpen={showBillScanner}
                onClose={() => setShowBillScanner(false)}
                onBillProcessed={handleBillScanned}
              />
            </TabsContent>
            
            <TabsContent value="menu">
              <div className="mt-3">
                <MenuSelector onMenuItemSelected={handleMenuItemSelected} />
              </div>
            </TabsContent>
          </Tabs>
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
        
        <div className="flex space-x-2 mt-6">
          <Button 
            className="flex-1 py-6"
            onClick={handleCalculateSplit}
            disabled={bill?.items.length === 0}
          >
            Calculate Split
          </Button>
          
          <Button 
            className="flex-1 py-6"
            variant="outline"
            onClick={handleViewSummary}
            disabled={bill?.items.length === 0}
          >
            View Summary
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default SplitDetails;
