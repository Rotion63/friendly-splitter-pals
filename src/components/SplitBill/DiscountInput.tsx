
import React, { useState, useEffect } from "react";
import { Receipt, Percent } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

interface DiscountInputProps {
  totalAmount: number;
  discount: number;
  onDiscountChange: (amount: number) => void;
}

const DiscountInput: React.FC<DiscountInputProps> = ({
  totalAmount,
  discount,
  onDiscountChange
}) => {
  const [discountType, setDiscountType] = useState<"amount" | "percent">("amount");
  const [inputValue, setInputValue] = useState<string>(discount.toString());
  
  // Update input value when discount changes externally
  useEffect(() => {
    if (discountType === "amount") {
      setInputValue(discount.toString());
    } else {
      // Convert amount to percentage
      const percentage = totalAmount > 0 ? (discount / totalAmount) * 100 : 0;
      setInputValue(percentage.toFixed(2));
    }
  }, [discount, discountType, totalAmount]);
  
  const handleDiscountChange = (value: string) => {
    setInputValue(value);
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      onDiscountChange(0);
      return;
    }
    
    let actualDiscount = 0;
    if (discountType === "amount") {
      actualDiscount = Math.min(numValue, totalAmount);
    } else {
      // Convert percentage to amount
      const percentage = Math.min(numValue, 100);
      actualDiscount = (percentage / 100) * totalAmount;
    }
    
    onDiscountChange(actualDiscount);
  };
  
  const toggleDiscountType = () => {
    if (discountType === "amount") {
      setDiscountType("percent");
      // Convert amount to percentage
      const percentage = totalAmount > 0 ? (discount / totalAmount) * 100 : 0;
      setInputValue(percentage.toFixed(2));
    } else {
      setDiscountType("amount");
      setInputValue(discount.toString());
    }
  };
  
  const effectiveAmount = totalAmount - discount;
  
  return (
    <div className="glass-panel rounded-xl p-4 mb-6">
      <h2 className="text-lg font-medium mb-3">Discount</h2>
      <p className="text-sm text-muted-foreground mb-3">
        Apply a discount to reduce the total bill amount
      </p>
      
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 relative">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => handleDiscountChange(e.target.value)}
            min="0"
            max={discountType === "amount" ? totalAmount.toString() : "100"}
            step={discountType === "amount" ? "0.01" : "0.1"}
            className="pr-10"
          />
          <div className="absolute right-3 top-0 bottom-0 flex items-center pointer-events-none">
            {discountType === "amount" ? "$" : "%"}
          </div>
        </div>
        
        <button 
          onClick={toggleDiscountType}
          className="bg-muted p-2 rounded-md hover:bg-muted/80 transition-colors"
          title={`Switch to ${discountType === "amount" ? "percentage" : "amount"}`}
        >
          {discountType === "amount" ? 
            <Percent className="h-5 w-5" /> : 
            <Receipt className="h-5 w-5" />
          }
        </button>
      </div>
      
      {discount > 0 && (
        <div className="flex justify-between text-sm p-2 bg-green-50 rounded-md">
          <span>Final amount after discount:</span>
          <span className="font-medium text-green-600">{formatCurrency(effectiveAmount)}</span>
        </div>
      )}
    </div>
  );
};

export default DiscountInput;
