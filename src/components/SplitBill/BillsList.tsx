
import React from "react";
import { Bill } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Receipt, Edit2, ArrowRight, MapPin } from "lucide-react";
import DeleteBillButton from "./DeleteBillButton";
import { getTripById } from "@/lib/tripStorage";

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
  // Helper to get trip name from trip ID
  const getTripName = (tripId: string | undefined) => {
    if (!tripId) return null;
    
    const trip = getTripById(tripId);
    return trip?.name || null;
  };

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
      {bills.map(bill => {
        const tripName = getTripName(bill.tripId);
        
        return (
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
                {bill.tripId && tripName && (
                  <p className="text-xs flex items-center text-primary/70 mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {tripName}
                  </p>
                )}
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
        );
      })}
    </div>
  );
};

export default BillsList;
