
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { MenuItem, Participant } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useBillManager } from "@/hooks/useBillManager";
import { getTripById } from "@/lib/tripStorage";
import BillItemList from "@/components/SplitBill/BillItemList";
import AddParticipant from "@/components/SplitBill/AddParticipant";
import DiscountInput from "@/components/SplitBill/DiscountInput";
import BillItemEntry from "@/components/SplitBill/BillItemEntry";
import BillHeader from "@/components/SplitBill/BillHeader";
import PaymentMethodSelector from "@/components/SplitBill/PaymentMethodSelector";
import BillActions from "@/components/SplitBill/BillActions";

const SplitDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const tripId = new URLSearchParams(location.search).get('tripId');
  const [showParticipantManager, setShowParticipantManager] = useState(false);
  const [tripDetails, setTripDetails] = useState<{ id: string, name: string } | null>(null);

  const {
    bill,
    paidBy,
    partialPayments,
    usePartialPayment,
    discount,
    isLoading,
    
    setPaidBy,
    setUsePartialPayment,
    
    addItem,
    removeItem,
    addMenuItems,
    
    addParticipant,
    removeParticipant,
    
    updatePartialPayments,
    updateDiscount,
    finalizePayment,
    deleteBill,
    
    getRemainingAmount,
  } = useBillManager({ 
    billId: id, 
    tripId, 
    onNavigate: navigate 
  });

  // Load trip details if bill has a tripId
  useEffect(() => {
    if (bill?.tripId) {
      const trip = getTripById(bill.tripId);
      if (trip) {
        setTripDetails({
          id: trip.id,
          name: trip.name
        });
      }
    }
  }, [bill?.tripId]);

  const handleAddItem = (
    name: string, 
    amount: number, 
    participantIds: string[],
    rate?: number,
    quantity?: number
  ) => {
    addItem(name, amount, participantIds, rate, quantity);
  };

  const handleBillScanned = (items: { name: string; amount: number }[]) => {
    // Convert the scanned items to the expected format
    const convertedItems = items.map(item => ({
      name: item.name,
      price: item.amount // Map amount to price
    }));
    
    addMenuItems(convertedItems);
  };

  const handleMenuScanned = (items: { name: string; price: number }[]) => {
    addMenuItems(items);
  };

  const handleMenuItemSelected = (menuItem: MenuItem) => {
    if (!bill) return;
    
    addItem(
      menuItem.name, 
      menuItem.price, 
      bill.participants.map(p => p.id)
    );
  };

  const handleCalculateSplit = () => {
    if (finalizePayment()) {
      navigate(`/split-summary/${id}`);
    }
  };

  const handleViewSummary = () => {
    navigate(`/split-summary/${id}`);
  };

  const handleBackToTrip = () => {
    if (bill?.tripId) {
      navigate(`/trip/${bill.tripId}`);
    }
  };

  if (isLoading || !bill) {
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

  const remainingAmount = getRemainingAmount();

  return (
    <AppLayout showBackButton title={bill.title}>
      <BillHeader 
        title={bill.title}
        onBackToTrip={handleBackToTrip}
        onDelete={deleteBill}
        tripId={bill.tripId}
        showParticipantManager={showParticipantManager}
        onToggleParticipantManager={() => setShowParticipantManager(!showParticipantManager)}
      />
      
      <div className="py-4">
        {!showParticipantManager ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {bill.participants.map(participant => (
              <div 
                key={participant.id}
                className="bg-muted px-3 py-1 rounded-full text-sm"
              >
                {participant.name}
              </div>
            ))}
          </div>
        ) : (
          <AddParticipant
            participants={bill.participants}
            onAdd={addParticipant}
            onRemove={removeParticipant}
          />
        )}
        
        <div className="glass-panel rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Bill Items</h2>
            <span className="text-lg font-medium">
              {formatCurrency(bill.totalAmount)}
            </span>
          </div>
          
          <BillItemList 
            items={bill.items} 
            onRemoveItem={removeItem} 
          />
          
          <BillItemEntry 
            participants={bill.participants}
            onAddItem={handleAddItem}
            onBillScanned={handleBillScanned}
            onMenuScanned={handleMenuScanned}
            onMenuItemSelected={handleMenuItemSelected}
          />
        </div>
        
        <DiscountInput 
          totalAmount={bill.totalAmount}
          discount={discount}
          onDiscountChange={updateDiscount}
        />
        
        <PaymentMethodSelector 
          participants={bill.participants}
          paidBy={paidBy}
          usePartialPayment={usePartialPayment}
          partialPayments={partialPayments}
          totalAmount={bill.totalAmount}
          remainingAmount={remainingAmount}
          discount={discount}
          onPaidByChange={setPaidBy}
          onUsePartialPaymentChange={setUsePartialPayment}
          onPartialPaymentsChange={updatePartialPayments}
        />
        
        <BillActions 
          hasItems={bill.items.length > 0}
          onCalculateSplit={handleCalculateSplit}
          onViewSummary={handleViewSummary}
        />
      </div>
    </AppLayout>
  );
};

export default SplitDetails;
