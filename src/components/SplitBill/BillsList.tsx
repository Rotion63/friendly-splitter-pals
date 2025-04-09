
import React from "react";
import { useNavigate } from "react-router-dom";
import { Bill } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit2, ArrowRight } from "lucide-react";
import DeleteBillButton from "@/components/SplitBill/DeleteBillButton";
import { useLanguage } from "@/components/LanguageProvider";

interface BillsListProps {
  bills: Bill[];
  onDelete: (billId: string) => void;
}

const BillsList: React.FC<BillsListProps> = ({ bills, onDelete }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const handleEditBill = (billId: string) => {
    navigate(`/split-details/${billId}`);
  };
  
  const handleViewBill = (billId: string) => {
    navigate(`/split-summary/${billId}`);
  };
  
  return (
    <div className="space-y-3">
      {bills.map(bill => (
        <div 
          key={bill.id} 
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{bill.title}</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(bill.date).toLocaleDateString()} - {formatCurrency(bill.totalAmount)}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleEditBill(bill.id)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleViewBill(bill.id)}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <DeleteBillButton
                onDelete={() => onDelete(bill.id)}
              />
            </div>
          </div>
        </div>
      ))}
      
      {bills.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          {t("No bills added yet", "अहिलेसम्म कुनै बिल थपिएको छैन")}
        </div>
      )}
    </div>
  );
};

export default BillsList;
