
import React from "react";
import { Bill } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Receipt, Edit2, ArrowRight } from "lucide-react";
import DeleteBillButton from "./DeleteBillButton";

interface BillsListProps {
  bills: Bill[];
  onEditBill: (billId: string) => void;
  onViewBill: (billId: string) => void;
  onDeleteBill: (billId: string) => void;
}

const BillsList: React.FC<BillsListProps> = ({ 
  bills, 
  onEditBill, 
  onViewBill, 
  onDeleteBill 
}) => {
  if (bills.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No bills added to this trip yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-4">
      {bills.map(bill => (
        <div 
          key={bill.id} 
          className="bg-white rounded-lg p-4 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{bill.title}</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(bill.date).toLocaleDateString()} - {formatCurrency(bill.totalAmount)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {bill.participants.length} participants
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEditBill(bill.id)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onViewBill(bill.id)}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <DeleteBillButton
                onDelete={() => onDeleteBill(bill.id)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BillsList;
