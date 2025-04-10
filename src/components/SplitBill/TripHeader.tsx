
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Receipt, Edit2 } from "lucide-react";
import { Trip } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface TripHeaderProps {
  trip: Trip;
  billsCount: number;
  totalSpent: number;
  onEditTrip: () => void;
}

const TripHeader: React.FC<TripHeaderProps> = ({
  trip,
  billsCount,
  totalSpent,
  onEditTrip
}) => {
  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold">{trip.name}</h2>
          {trip.description && (
            <p className="text-muted-foreground mt-1">{trip.description}</p>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onEditTrip}
        >
          <Edit2 className="h-4 w-4 mr-1" /> Edit
        </Button>
      </div>
      
      <div className="space-y-2 text-sm">
        {(trip.startDate || trip.endDate) && (
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : ""}
              {trip.startDate && trip.endDate ? " - " : ""}
              {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : ""}
            </span>
          </div>
        )}
        
        <div className="flex items-center text-muted-foreground">
          <Users className="h-4 w-4 mr-2" />
          <span>{trip.participants.length} participants</span>
        </div>
        
        <div className="flex items-center text-muted-foreground">
          <Receipt className="h-4 w-4 mr-2" />
          <span>
            {billsCount} {billsCount === 1 ? "bill" : "bills"} - Total: {formatCurrency(totalSpent)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TripHeader;
