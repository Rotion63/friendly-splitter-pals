
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTrips } from "@/lib/tripStorage";
import { Trip } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, PlusCircle } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const TripsList: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  useEffect(() => {
    // Load trips
    const loadedTrips = getTrips();
    setTrips(loadedTrips);
  }, []);
  
  const handleCreateTrip = () => {
    navigate("/trip/new");
  };
  
  const handleTripClick = (tripId: string) => {
    navigate(`/trip/${tripId}`);
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {t("Your Trips", "तपाईंका यात्राहरू")}
      </h2>
      
      {trips.length > 0 ? (
        <div className="space-y-3">
          {trips.map(trip => (
            <div 
              key={trip.id}
              onClick={() => handleTripClick(trip.id)}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-all"
            >
              <h3 className="font-medium">{trip.name}</h3>
              
              <div className="flex flex-wrap mt-2 text-sm text-muted-foreground gap-x-4">
                {(trip.startDate || trip.endDate) && (
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>
                      {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : ""}
                      {trip.startDate && trip.endDate ? " - " : ""}
                      {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : ""}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  <span>{trip.participants.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t("You haven't created any trips yet", "तपाईंले अहिलेसम्म कुनै यात्रा सिर्जना गर्नुभएको छैन")}</p>
        </div>
      )}
      
      <Button 
        variant="outline" 
        className="w-full"
        onClick={handleCreateTrip}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        {t("Create New Trip", "नयाँ यात्रा सिर्जना गर्नुहोस्")}
      </Button>
    </div>
  );
};

export default TripsList;
