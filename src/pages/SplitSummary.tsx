
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { calculateSplits, formatCurrency } from "@/lib/utils";
import { Bill } from "@/lib/types";
import { ArrowDown, ArrowUp, User } from "lucide-react";
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
    
    // Get the bill from local storage instead of sample data
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
  
  const paidByPerson = bill.participants.find(p => p.id === bill.paidBy);
  
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
          
          <div className="text-3xl font-bold mb-4">
            {formatCurrency(bill.totalAmount)}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Paid by {paidByPerson?.name || "Unknown"}
          </p>
        </motion.div>
        
        <h3 className="text-lg font-medium mb-3">Split Summary</h3>
        
        <div className="space-y-3 mb-6">
          {Object.entries(splits).map(([participantId, amount], index) => {
            const participant = bill.participants.find(p => p.id === participantId);
            if (!participant) return null;
            
            const isReceivingMoney = amount > 0;
            const isPayingMoney = amount < 0;
            
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
                      <div className="text-xs text-primary">Receives money</div>
                    )}
                    {isPayingMoney && (
                      <div className="text-xs text-destructive">Owes money</div>
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
                  ) : (
                    <ArrowUp className="h-4 w-4 mr-1" />
                  )}
                  <span>
                    {formatCurrency(Math.abs(amount))}
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
