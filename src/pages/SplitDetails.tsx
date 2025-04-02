
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import AddBillItem from "@/components/SplitBill/AddBillItem";
import BillItemList from "@/components/SplitBill/BillItemList";
import AddParticipant from "@/components/SplitBill/AddParticipant";
import PaidBySelector from "@/components/SplitBill/PaidBySelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BillItem, Participant, Bill } from "@/lib/types";
import { getBill, updateBill } from "@/lib/billStorage";
import { Plus, AlertCircle, Receipt } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DiscountInput from "@/components/SplitBill/DiscountInput";
import AddReceiptButton from "@/components/SplitBill/AddReceiptButton";

const SplitDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [items, setItems] = useState<BillItem[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [title, setTitle] = useState("");
  const [paidBy, setPaidBy] = useState<Participant | null>(null);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [tip, setTip] = useState(0);
  
  // Load bill data
  useEffect(() => {
    if (!id) return;
    
    const loadedBill = getBill(id);
    if (!loadedBill) {
      toast.error("Bill not found!");
      navigate("/");
      return;
    }
    
    setBill(loadedBill);
    setItems(loadedBill.items || []);
    setParticipants(loadedBill.participants || []);
    setTitle(loadedBill.title);
    setPaidBy(loadedBill.paidBy || null);
    setDiscount(loadedBill.discount || 0);
    setTax(loadedBill.tax || 0);
    setTip(loadedBill.tip || 0);
  }, [id, navigate]);
  
  const handleAddItem = (item: BillItem) => {
    setItems([...items, item]);
  };
  
  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const handleAddParticipant = (participant: Participant) => {
    setParticipants([...participants, participant]);
  };
  
  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };
  
  const handlePaidByChange = (participant: Participant) => {
    setPaidBy(participant);
  };
  
  const handleSave = () => {
    if (!id || !bill) return;
    
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    
    if (!paidBy) {
      toast.error("Please select who paid for the bill");
      return;
    }
    
    const updatedBill: Bill = {
      ...bill,
      title,
      items,
      participants,
      paidBy,
      discount,
      tax,
      tip,
      totalAmount: calculateTotal()
    };
    
    updateBill(updatedBill);
    toast.success("Bill updated successfully!");
    navigate(`/split-summary/${id}`);
  };
  
  const calculateTotal = (): number => {
    const itemsTotal = items.reduce((sum, item) => sum + item.price, 0);
    const afterDiscount = itemsTotal - discount;
    const withTax = afterDiscount + tax;
    const withTip = withTax + tip;
    return withTip;
  };
  
  const handleItemsFromReceipt = (scannedItems: Array<{ name: string; price: number }>) => {
    // Generate IDs for the items and convert them to BillItems
    const newItems = scannedItems.map(item => ({
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: item.name,
      price: item.price,
      participants: [...participants], // Default to all participants
      shared: true
    }));
    
    setItems([...items, ...newItems]);
    toast.success(`Added ${newItems.length} items from receipt`);
  };
  
  if (!bill) {
    return (
      <AppLayout showBackButton title="Loading...">
        <div className="flex justify-center items-center h-80">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout showBackButton title="Edit Split Details">
      <div className="py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Split Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Dinner, Vacation, Groceries"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Participants</Label>
              <span className="text-sm text-muted-foreground">
                {participants.length} {participants.length === 1 ? 'person' : 'people'}
              </span>
            </div>
            
            <AddParticipant
              participants={participants}
              onAdd={handleAddParticipant}
              onRemove={handleRemoveParticipant}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Items</Label>
              <span className="text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            
            {items.length === 0 ? (
              <Alert variant="default" className="bg-muted/50 border-muted">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <AlertDescription>
                  Add items to your bill or scan a receipt to get started
                </AlertDescription>
              </Alert>
            ) : (
              <BillItemList
                items={items}
                participants={participants}
                onRemove={handleRemoveItem}
              />
            )}
            
            <AddBillItem
              onAddItem={handleAddItem}
              participants={participants}
            />
            
            <AddReceiptButton onItemsDetected={handleItemsFromReceipt} />
          </div>
          
          <div className="space-y-2">
            <Label>Additional Costs</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tax" className="text-sm">Tax</Label>
                <Input
                  id="tax"
                  type="number"
                  value={tax}
                  min={0}
                  step={0.01}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="tip" className="text-sm">Tip</Label>
                <Input
                  id="tip"
                  type="number"
                  value={tip}
                  min={0}
                  step={0.01}
                  onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <DiscountInput
              value={discount}
              onChange={setDiscount}
              max={items.reduce((sum, item) => sum + item.price, 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Who Paid?</Label>
            <PaidBySelector
              participants={participants}
              selectedParticipant={paidBy}
              onSelect={handlePaidByChange}
            />
          </div>
          
          <div className="bg-muted/20 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Discount:</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Tax:</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Tip:</span>
              <span>${tip.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold mt-4 pt-4 border-t border-muted">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
          
          <Button onClick={handleSave} className="w-full py-6">
            Calculate Split
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default SplitDetails;
