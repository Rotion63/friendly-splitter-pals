
import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Users, 
  Receipt, 
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trip, Participant } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { getBills } from "@/lib/billStorage";
import { getTrips } from "@/lib/tripStorage";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/LanguageProvider";

interface TripManagerProps {
  showCreate?: boolean;
}

const TripManager: React.FC<TripManagerProps> = ({ 
  showCreate = true 
}) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  useEffect(() => {
    // Load trips
    const loadedTrips = getTrips();
    console.log("Loaded trips:", loadedTrips);
    setTrips(loadedTrips);
  }, []);
  
  const handleTripClick = (tripId: string) => {
    navigate(`/trip/${tripId}`);
  };
  
  const handleCreateTrip = () => {
    navigate('/trip/new');
  };
  
  // Calculate total amount for each trip
  const getTripTotal = (tripId: string) => {
    const allBills = getBills();
    const tripBills = allBills.filter(bill => bill.tripId === tripId);
    return tripBills.reduce((total, bill) => total + bill.totalAmount, 0);
  };
  
  return (
    <div className="space-y-4">
      {trips.length > 0 && (
        <div className="space-y-3">
          {trips.map(trip => (
            <div 
              key={trip.id} 
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTripClick(trip.id)}
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
                  <span>{trip.participants.length} {t("participants", "सहभागीहरू")}</span>
                </div>
                
                <div className="flex items-center">
                  <Receipt className="h-4 w-4 mr-1" />
                  <span>
                    {trip.bills.length} {trip.bills.length === 1 ? 
                      t("bill", "बिल") : t("bills", "बिलहरू")} ({formatCurrency(getTripTotal(trip.id))})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showCreate && (
        <Button 
          variant="outline" 
          className="w-full py-6 flex items-center justify-center"
          onClick={handleCreateTrip}
        >
          {t("Create New Trip", "नयाँ यात्रा सिर्जना गर्नुहोस्")}
        </Button>
      )}
      
      {trips.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          {t("No trips yet. Create one to get started.", "अहिलेसम्म कुनै यात्रा छैन। सुरु गर्न एउटा सिर्जना गर्नुहोस्।")}
        </div>
      )}
    </div>
  );
};

export default TripManager;
