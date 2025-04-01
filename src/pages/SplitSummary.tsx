import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { calculateSplits, formatCurrency } from "@/lib/utils";
import { Bill, Settlement } from "@/lib/types";
import { ArrowDown, ArrowUp, User, Receipt, Percent, Wallet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { getBillById, saveBill } from "@/lib/billStorage";
import SettlementManager from "@/components/SplitBill/SettlementManager";
import IndividualConsumption from "@/components/SplitBill/IndividualConsumption";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SplitSummary: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bill, setBill] = useState<Bill | null>(null);
  const [splits, setSplits] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("summary");
  
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
  
  const handleBillUpdate = (updatedBill: Bill) => {
    setBill(updatedBill);
    // Recalculate splits if needed
    setSplits(calculateSplits(updatedBill));
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
  
  // Render settlement status section
  const renderSettlementDetails = () => {
    return Object.entries(splits).map(([participantId, amount], index) => {
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
      
      // Check if this participant has all their payments settled
      const allSettled = bill.settlements?.filter(
        s => s.payerId === participantId && !s.settled
      ).length === 0;
      
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
              : allSettled && isPayingMoney
                ? "bg-green-50 border border-green-100"
                : "bg-white shadow-soft"
          }`}
        >
          <div className="flex items-center">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
              isReceivingMoney ? "bg-primary/20 text-primary" : 
              allSettled ? "bg-green-100 text-green-600" : "bg-muted"
            }`}>
              {participant.avatar ? (
                <img 
                  src={participant.avatar} 
                  alt={participant.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                allSettled && isPayingMoney ? <CheckCircle2 className="h-5 w-5" /> : <User className="h-5 w-5" />
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
                <div className={`text-xs ${allSettled ? "text-green-600" : "text-destructive"}`}>
                  {allSettled ? "All payments settled" : 
                    <>Owes money {targetPersonName && <span>to {targetPersonName}</span>}</>
                  }
                </div>
              )}
            </div>
          </div>
          
          <div className={`flex items-center ${
            isReceivingMoney
              ? "text-primary font-medium"
              : isPayingMoney 
                ? allSettled ? "text-green-600 font-medium" : "text-destructive font-medium"
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
    });
  };
  
  return (
    <AppLayout showBackButton title="Summary">
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
        
        {/* Tabbed Interface for better organization */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="settlement">Settlement</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-6 space-y-4">
            {/* Settlement Details Section */}
            <h3 className="text-lg font-medium mb-3">Settlement Overview</h3>
            <div className="space-y-3 mb-6">
              {renderSettlementDetails()}
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="mt-6 space-y-4">
            {/* Individual Consumption Section - Show this first */}
            <IndividualConsumption 
              bill={bill}
              individualConsumption={individualConsumption}
            />
            
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
          </TabsContent>
          
          <TabsContent value="settlement" className="mt-6">
            {/* Settlement Manager Section */}
            <SettlementManager 
              bill={bill}
              onBillUpdated={handleBillUpdate}
            />
          </TabsContent>
        </Tabs>
        
        <Button 
          className="w-full"
          onClick={handleShare}
        >
          Share Results
        </Button>
      </div>
    </AppLayout>
  );
};

export default SplitSummary;
