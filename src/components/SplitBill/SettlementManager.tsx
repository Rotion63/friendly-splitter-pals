
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bill, Participant, Settlement } from "@/lib/types";
import { formatCurrency, calculateOptimizedSettlements } from "@/lib/utils";
import { saveBill } from "@/lib/billStorage";
import { toast } from "sonner";

interface SettlementManagerProps {
  bill: Bill;
  onBillUpdated: (updatedBill: Bill) => void;
}

const SettlementManager: React.FC<SettlementManagerProps> = ({ bill, onBillUpdated }) => {
  const [showAllSettlements, setShowAllSettlements] = useState(false);
  
  // Use the optimized settlements calculation
  useEffect(() => {
    if (!bill.settlements || bill.settlements.length === 0) {
      const optimizedSettlements = calculateOptimizedSettlements(bill);
      if (optimizedSettlements.length > 0) {
        const updatedBill = {
          ...bill,
          settlements: optimizedSettlements
        };
        saveBill(updatedBill);
        onBillUpdated(updatedBill);
      }
    }
  }, [bill, onBillUpdated]);
  
  // Initialize settlements array if it doesn't exist
  if (!bill.settlements) {
    bill.settlements = [];
  }
  
  // Get unique payers and receivers from settlements data
  const settlements = bill.settlements || [];
  
  const markAsSettled = (payerId: string, receiverId: string) => {
    // Find existing settlement or create a new one
    const existingSettlementIndex = settlements.findIndex(
      s => s.payerId === payerId && s.receiverId === receiverId
    );
    
    let updatedSettlements = [...settlements];
    
    if (existingSettlementIndex >= 0) {
      // Toggle settled status
      updatedSettlements[existingSettlementIndex] = {
        ...updatedSettlements[existingSettlementIndex],
        settled: !updatedSettlements[existingSettlementIndex].settled
      };
    }
    
    const updatedBill = {
      ...bill,
      settlements: updatedSettlements
    };
    
    saveBill(updatedBill);
    onBillUpdated(updatedBill);
    
    const payer = bill.participants.find(p => p.id === payerId);
    const receiver = bill.participants.find(p => p.id === receiverId);
    
    toast.success(`Marked payment between ${payer?.name} and ${receiver?.name} as settled`);
  };
  
  // Helper to check if a payment is settled
  const isSettled = (payerId: string, receiverId: string): boolean => {
    return !!settlements.find(
      s => s.payerId === payerId && s.receiverId === receiverId && s.settled
    );
  };
  
  // Group settlements by payer for a cleaner UI
  const getSettlementsByPayer = () => {
    const result: Record<string, { receiverId: string, amount: number }[]> = {};
    
    bill.participants.forEach(participant => {
      const participantId = participant.id;
      
      // Find settlements where this participant is the payer
      const participantSettlements = settlements.filter(
        s => s.payerId === participantId
      );
      
      if (participantSettlements.length > 0) {
        result[participantId] = participantSettlements.map(s => ({
          receiverId: s.receiverId,
          amount: s.amount
        }));
      }
    });
    
    return result;
  };
  
  // For dynamic generation of settlement UI
  const getSettlementComponent = (
    payerId: string,
    receiverId: string,
    amount: number
  ) => {
    const payer = bill.participants.find(p => p.id === payerId);
    const receiver = bill.participants.find(p => p.id === receiverId);
    const settled = isSettled(payerId, receiverId);
    
    if (!payer || !receiver) return null;
    
    return (
      <div 
        key={`${payerId}-${receiverId}`}
        className={`flex items-center justify-between p-3 rounded-lg ${
          settled ? "bg-green-50 border border-green-100" : "bg-white"
        } mb-2`}
      >
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            {payer.avatar ? (
              <img 
                src={payer.avatar} 
                alt={payer.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            {receiver.avatar ? (
              <img 
                src={receiver.avatar} 
                alt={receiver.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <div>
            <span className="text-sm font-medium">{payer.name} → {receiver.name}</span>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(amount)}
            </div>
          </div>
        </div>
        
        <Button
          variant={settled ? "default" : "outline"}
          size="sm"
          className={settled ? "bg-green-600 hover:bg-green-700" : ""}
          onClick={() => markAsSettled(payerId, receiverId)}
        >
          {settled ? (
            <>
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Settled
            </>
          ) : "Mark Settled"}
        </Button>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Settlement Tracking</h3>
        {settlements.length > 3 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAllSettlements(!showAllSettlements)}
          >
            {showAllSettlements ? "Show Less" : "Show All"}
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {settlements.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No settlements to track yet
          </p>
        ) : (
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {Object.entries(getSettlementsByPayer()).map(([payerId, receiverList]) => {
              const payer = bill.participants.find(p => p.id === payerId);
              
              if (!payer) return null;
              
              return (
                <div key={payerId} className="space-y-2">
                  {receiverList.slice(0, showAllSettlements ? undefined : 3).map(item => (
                    getSettlementComponent(payerId, item.receiverId, item.amount)
                  ))}
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SettlementManager;
