
import React from "react";
import { ChevronRight, Calendar, Users, Receipt } from "lucide-react";
import { Trip } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { getBills } from "@/lib/billStorage";

interface TripCardProps {
  trip: Trip;
  onClick: () => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onClick }) => {
  // Calculate total amount for each trip
  const getTripTotal = (tripId: string) => {
    const allBills = getBills();
    const tripBills = allBills.filter(bill => bill.tripId === tripId);
    return tripBills.reduce((total, bill) => total + bill.totalAmount, 0);
  };

  return (
    <div 
      className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{trip.name}</h3>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
        {trip.description && (
          <p>{trip.description}</p>
        )}
        
        {(trip.startDate || trip.endDate) && (
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : ""}
              {trip.startDate && trip.endDate ? " - " : ""}
              {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : ""}
            </span>
          </div>
        )}
        
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1" />
          <span>{trip.participants.length} participants</span>
        </div>
        
        <div className="flex items-center">
          <Receipt className="h-4 w-4 mr-1" />
          <span>
            {trip.bills.length} bills ({formatCurrency(getTripTotal(trip.id))})
          </span>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
