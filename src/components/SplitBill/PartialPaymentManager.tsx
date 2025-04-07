
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Receipt, Wallet, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Participant, PartialPayment } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";

interface PartialPaymentManagerProps {
  participants: Participant[];
  partialPayments: PartialPayment[];
  totalAmount: number;
  onPartialPaymentsChange: (payments: PartialPayment[]) => void;
}

const PartialPaymentManager: React.FC<PartialPaymentManagerProps> = ({
  participants,
  partialPayments,
  totalAmount,
  onPartialPaymentsChange
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedPayer, setSelectedPayer] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const { t } = useLanguage();
  
  const totalPaid = partialPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = totalAmount - totalPaid;
  
  const handleAddPayment = () => {
    if (!selectedPayer || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || amount > remainingAmount) return;
    
    const newPayment: PartialPayment = {
      payerId: selectedPayer,
      amount: amount
    };
    
    onPartialPaymentsChange([...partialPayments, newPayment]);
    setSelectedPayer("");
    setPaymentAmount("");
    setIsAdding(false);
  };
  
  const handleRemovePayment = (index: number) => {
    const newPayments = [...partialPayments];
    newPayments.splice(index, 1);
    onPartialPaymentsChange(newPayments);
  };
  
  return (
    <div className="glass-panel rounded-xl p-4 mb-6">
      <h2 className="text-lg font-medium mb-3">{t("Payment Distribution", "भुक्तानी वितरण")}</h2>
      <p className="text-sm text-muted-foreground mb-3">
        {t("Record how much each person contributed to the bill", "रेकर्ड गर्नुहोस् प्रत्येक व्यक्तिले बिलमा कति योगदान दिए")}
      </p>
      
      {partialPayments.length > 0 ? (
        <div className="space-y-2 mb-4">
          {partialPayments.map((payment, index) => {
            const payer = participants.find(p => p.id === payment.payerId);
            return (
              <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-soft dark:bg-gray-800">
                <div className="flex items-center">
                  <HandCoins className="h-4 w-4 text-primary mr-2" />
                  <span className="font-medium">{payer?.name || t("Unknown", "अज्ञात")}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">{formatCurrency(payment.amount)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePayment(index)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          
          <div className="flex justify-between px-3 py-2 text-sm">
            <span>{t("Remaining to be paid:", "भुक्तानी बाँकी:")}</span>
            <span className={remainingAmount > 0 ? "text-orange-500 font-medium" : "text-green-500 font-medium"}>
              {formatCurrency(remainingAmount)}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground mb-4">
          <Wallet className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>{t("No partial payments recorded", "कुनै आंशिक भुक्तान रेकर्ड गरिएको छैन")}</p>
        </div>
      )}
      
      {isAdding ? (
        <div className="bg-muted/20 rounded-lg p-3 mb-3">
          <div className="mb-2">
            <label className="text-sm font-medium">{t("Who paid?", "कसले तिर्यो?")}</label>
            <select 
              className="w-full p-2 rounded-md border mt-1 bg-background"
              value={selectedPayer}
              onChange={(e) => setSelectedPayer(e.target.value)}
            >
              <option value="">{t("Select a person", "व्यक्ति छान्नुहोस्")}</option>
              {participants.map(participant => (
                <option key={participant.id} value={participant.id}>
                  {participant.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
            <label className="text-sm font-medium">{t("Amount paid", "तिरेको रकम")}</label>
            <Input
              type="number"
              placeholder="0.00"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="mt-1"
              step="0.01"
              min="0"
              max={remainingAmount.toString()}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAdding(false)}
            >
              {t("Cancel", "रद्द गर्नुहोस्")}
            </Button>
            <Button 
              size="sm"
              onClick={handleAddPayment}
              disabled={!selectedPayer || !paymentAmount || parseFloat(paymentAmount) <= 0}
            >
              {t("Add Payment", "भुक्तानी थप्नुहोस्")}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsAdding(true)}
          disabled={remainingAmount <= 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("Add Partial Payment", "आंशिक भुक्तानी थप्नुहोस्")}
        </Button>
      )}
    </div>
  );
};

export default PartialPaymentManager;
