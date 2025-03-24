
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { calculateSplits, formatCurrency } from "@/lib/utils";
import { Bill } from "@/lib/types";
import { ArrowDown, ArrowUp, User, Receipt, Percent, Wallet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { getBillById } from "@/lib/billStorage";

const SplitSummary: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bill, setBill] = useState<Bill | null>(null);
  const [splits, setSplits] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }
    
    // Get the bill from local storage
    const foundBill = getBillById(id);
    
    if (foundBill) {
      setBill(foundBill);
      setSplits(calculateSplits(foundBill));
    } else {
      toast({
        title: "Bill not found",
        description: "The requested bill could not be found.",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [id, navigate]);
  
  const handleShare = () => {
    // In a real app, implement sharing functionality
    toast({
      title: "Coming soon",
      description: "Sharing functionality will be available in the next version.",
    });
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
  
  const paidByPerson = bill.paidBy ? bill.participants.find(p => p.id === bill.paidBy) : null;
  const hasDiscount = bill.discount && bill.discount > 0;
  const hasPartialPayments = bill.partialPayments && bill.partialPayments.length > 0;
  const effectiveAmount = bill.totalAmount - (bill.discount || 0);
  
  // Get actual bill amounts per participant (what each person consumed)
  const individualConsumption: Record<string, number> = {};
  bill.participants.forEach(p => {
    individualConsumption[p.id] = 0;
  });
  
  // Calculate what each person consumed
  bill.items.forEach(item => {
    if (item.participants.length > 0) {
      // If there's a discount, we need to proportionally reduce each item
      const discountFactor = effectiveAmount / bill.totalAmount;
      const adjustedAmount = item.amount * discountFactor;
      const perPersonAmount = adjustedAmount / item.participants.length;
      
      item.participants.forEach(pId => {
        individualConsumption[pId] = (individualConsumption[pId] || 0) + perPersonAmount;
      });
    }
  });
  
  return (
    <Layout showBackButton title="Summary">
      <div className="py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel rounded-xl p-4 mb-6 text-center"
        >
          <h2 className="text-xl font-medium mb-1">{bill.title}</h2>
          <p className="text-muted-foreground mb-4">
            {new Date(bill.date).toLocaleDateString()}
          </p>
          
          <div className="text-3xl font-bold mb-2">
            {formatCurrency(bill.totalAmount)}
          </div>
          
          {hasDiscount && (
            <div className="flex items-center justify-center gap-1 text-green-600 mb-2">
              <Percent className="h-4 w-4" />
              <span className="text-sm">
                Discount: {formatCurrency(bill.discount || 0)}
              </span>
            </div>
          )}
          
          {hasDiscount && (
            <div className="text-xl font-medium mb-4">
              Final: {formatCurrency(effectiveAmount)}
            </div>
          )}
          
          {hasPartialPayments ? (
            <div className="text-sm text-muted-foreground">
              <Wallet className="h-4 w-4 inline-block mr-1" />
              <span>Paid by multiple people</span>
            </div>
          ) : paidByPerson ? (
            <p className="text-sm text-muted-foreground">
              Paid by {paidByPerson.name}
            </p>
          ) : null}
        </motion.div>
        
        {/* Payment Contributions Section */}
        {(hasPartialPayments || paidByPerson) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-6"
          >
            <h3 className="text-lg font-medium mb-3">Payment Contributions</h3>
            <div className="space-y-2 mb-4">
              {hasPartialPayments && bill.partialPayments?.map((payment, index) => {
                const payer = bill.participants.find(p => p.id === payment.payerId);
                return (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-soft">
                    <span>{payer?.name || "Unknown"}</span>
                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                  </div>
                );
              })}
              
              {!hasPartialPayments && paidByPerson && (
                <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-soft">
                  <span>{paidByPerson.name}</span>
                  <span className="font-medium">
                    {formatCurrency(effectiveAmount)}
                  </span>
                </div>
              )}
              
              {hasPartialPayments && bill.paidBy && (
                <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-soft">
                  <span>{paidByPerson?.name || "Unknown"}</span>
                  <span className="font-medium">
                    {formatCurrency(
                      effectiveAmount - 
                      (bill.partialPayments?.reduce((sum, p) => sum + p.amount, 0) || 0)
                    )}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Individual Consumption Section - What each person actually consumed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-lg font-medium mb-3">Individual Consumption</h3>
          <div className="space-y-2 mb-4">
            {Object.entries(individualConsumption).map(([participantId, amount], index) => {
              const participant = bill.participants.find(p => p.id === participantId);
              if (!participant || amount === 0) return null;
              
              return (
                <div key={participantId} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-soft">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center mr-3 bg-muted">
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
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
        
        {/* Who Owes What Section */}
        <h3 className="text-lg font-medium mb-3">Settlement Details</h3>
        
        <div className="space-y-3 mb-6">
          {Object.entries(splits).map(([participantId, amount], index) => {
            const participant = bill.participants.find(p => p.id === participantId);
            if (!participant) return null;
            
            // Skip if the amount is negligible (very close to zero)
            if (Math.abs(amount) < 0.01) {
              return (
                <motion.div
                  key={participantId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.1,
                  }}
                  className="flex items-center justify-between p-4 rounded-lg bg-white shadow-soft"
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center mr-3 bg-muted/20 text-green-600">
                      {participant.avatar ? (
                        <img 
                          src={participant.avatar} 
                          alt={participant.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{participant.name}</div>
                      <div className="text-xs text-green-600">Settled up</div>
                    </div>
                  </div>
                  
                  <div className="text-green-600">
                    <span>{formatCurrency(0)}</span>
                  </div>
                </motion.div>
              );
            }
            
            const isReceivingMoney = amount > 0;
            const isPayingMoney = amount < 0;
            const formattedAmount = formatCurrency(Math.abs(amount));
            
            let targetPersonName = "";
            if (hasPartialPayments) {
              // In case of partial payments, simplify by showing owing to or receiving from the person who paid most
              // Find the person who contributed the most
              let maxContributor = paidByPerson?.id || "";
              let maxAmount = 0;
              
              if (bill.partialPayments && bill.partialPayments.length > 0) {
                bill.partialPayments.forEach(payment => {
                  if (payment.amount > maxAmount) {
                    maxAmount = payment.amount;
                    maxContributor = payment.payerId;
                  }
                });
              }
              
              const maxPerson = bill.participants.find(p => p.id === maxContributor);
              targetPersonName = maxPerson?.name || "";
            } else if (paidByPerson) {
              targetPersonName = paidByPerson.name;
            }
            
            return (
              <motion.div
                key={participantId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.1,
                }}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  isReceivingMoney
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-white shadow-soft"
                }`}
              >
                <div className="flex items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                    isReceivingMoney ? "bg-primary/20 text-primary" : "bg-muted"
                  }`}>
                    {participant.avatar ? (
                      <img 
                        src={participant.avatar} 
                        alt={participant.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{participant.name}</div>
                    {isReceivingMoney && (
                      <div className="text-xs text-primary">
                        Receives money
                        {targetPersonName && <span> from others</span>}
                      </div>
                    )}
                    {isPayingMoney && (
                      <div className="text-xs text-destructive">
                        Owes money
                        {targetPersonName && <span> to {targetPersonName}</span>}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={`flex items-center ${
                  isReceivingMoney
                    ? "text-primary font-medium"
                    : isPayingMoney 
                      ? "text-destructive font-medium"
                      : "text-muted-foreground"
                }`}>
                  {isReceivingMoney ? (
                    <ArrowDown className="h-4 w-4 mr-1" />
                  ) : isPayingMoney ? (
                    <ArrowUp className="h-4 w-4 mr-1" />
                  ) : null}
                  <span>
                    {formattedAmount}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <Button 
          className="w-full"
          onClick={handleShare}
        >
          Share Results
        </Button>
      </div>
    </Layout>
  );
};

export default SplitSummary;
