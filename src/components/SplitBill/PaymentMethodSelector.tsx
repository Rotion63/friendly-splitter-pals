
import React from "react";
import { Button } from "@/components/ui/button";
import { Participant } from "@/lib/types";
import PaidBySelector from "./PaidBySelector";
import PartialPaymentManager from "./PartialPaymentManager";
import { PartialPayment } from "@/lib/types";

interface PaymentMethodSelectorProps {
  participants: Participant[];
  paidBy: string;
  usePartialPayment: boolean;
  partialPayments: PartialPayment[];
  totalAmount: number;
  remainingAmount: number;
  discount: number;
  onPaidByChange: (id: string) => void;
  onUsePartialPaymentChange: (use: boolean) => void;
  onPartialPaymentsChange: (payments: PartialPayment[]) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  participants,
  paidBy,
  usePartialPayment,
  partialPayments,
  totalAmount,
  remainingAmount,
  discount,
  onPaidByChange,
  onUsePartialPaymentChange,
  onPartialPaymentsChange
}) => {
  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-xl p-4">
        <h2 className="text-lg font-medium mb-3">Payment Method</h2>
        <div className="flex space-x-2 mb-4">
          <Button
            variant={!usePartialPayment ? "default" : "outline"}
            className="flex-1"
            onClick={() => onUsePartialPaymentChange(false)}
          >
            Single Payer
          </Button>
          <Button
            variant={usePartialPayment ? "default" : "outline"}
            className="flex-1"
            onClick={() => onUsePartialPaymentChange(true)}
          >
            Multiple Payers
          </Button>
        </div>
      </div>
      
      {usePartialPayment ? (
        <PartialPaymentManager 
          participants={participants}
          partialPayments={partialPayments}
          totalAmount={totalAmount - discount}
          onPartialPaymentsChange={onPartialPaymentsChange}
        />
      ) : (
        <PaidBySelector 
          participants={participants}
          paidBy={paidBy}
          onPaidByChange={onPaidByChange}
        />
      )}
      
      {usePartialPayment && remainingAmount > 0 && (
        <PaidBySelector 
          participants={participants}
          paidBy={paidBy}
          onPaidByChange={onPaidByChange}
          label="Who paid the remaining amount?"
        />
      )}
    </div>
  );
};

export default PaymentMethodSelector;
