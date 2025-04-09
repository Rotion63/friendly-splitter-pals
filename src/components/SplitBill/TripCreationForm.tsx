
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Participant } from "@/lib/types";
import { createEmptyTrip, saveTrip } from "@/lib/tripStorage";
import { useLanguage } from "@/components/LanguageProvider";
import { toast } from "sonner";
import { getFriends } from "@/lib/friendsStorage";

interface TripCreationFormProps {
  onSuccess?: (tripId: string) => void;
}

const TripCreationForm: React.FC<TripCreationFormProps> = ({ onSuccess }) => {
  const [newTripName, setNewTripName] = useState("");
  const [newTripDescription, setNewTripDescription] = useState("");
  const [newTripStartDate, setNewTripStartDate] = useState("");
  const [newTripEndDate, setNewTripEndDate] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [availableFriends, setAvailableFriends] = useState<Participant[]>([]);
  
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load available friends
    const friends = getFriends();
    setAvailableFriends(friends);
    console.log("Available friends loaded:", friends);
  }, []);
  
  const toggleParticipant = (participantId: string) => {
    if (selectedParticipants.includes(participantId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== participantId));
    } else {
      setSelectedParticipants([...selectedParticipants, participantId]);
    }
  };
  
  const handleCreateTrip = () => {
    if (!newTripName.trim()) {
      toast.error(t("Please enter a trip name", "कृपया यात्रा नाम प्रविष्ट गर्नुहोस्"));
      return;
    }
    
    // Get selected participants from available friends
    const participants = availableFriends.filter(friend => 
      selectedParticipants.includes(friend.id)
    );

    // Create new trip
    const newTrip = createEmptyTrip(newTripName, participants);
    
    if (newTripDescription) {
      newTrip.description = newTripDescription;
    }
    if (newTripStartDate) {
      newTrip.startDate = newTripStartDate;
    }
    if (newTripEndDate) {
      newTrip.endDate = newTripEndDate;
    }
    
    console.log("Creating new trip:", newTrip);
    
    // Save the trip
    saveTrip(newTrip);
    
    toast.success(t("Trip created successfully", "यात्रा सफलतापूर्वक सिर्जना गरियो"));
    
    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess(newTrip.id);
    } else {
      // Navigate to the new trip page
      navigate(`/trip/${newTrip.id}`);
    }
  };
  
  return (
    <div className="py-6 space-y-5">
      <div className="glass-panel rounded-xl p-4">
        <h2 className="text-lg font-bold mb-4">
          {t("Create New Trip", "नयाँ यात्रा सिर्जना गर्नुहोस्")}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">
              {t("Trip Name", "यात्रा नाम")} *
            </label>
            <Input
              placeholder={t("Enter trip name", "यात्रा नाम प्रविष्ट गर्नुहोस्")}
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-1">
              {t("Description (Optional)", "विवरण (ऐच्छिक)")}
            </label>
            <Input
              placeholder={t("Enter description", "विवरण प्रविष्ट गर्नुहोस्")}
              value={newTripDescription}
              onChange={(e) => setNewTripDescription(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                {t("Start Date", "सुरु मिति")}
              </label>
              <Input
                type="date"
                value={newTripStartDate}
                onChange={(e) => setNewTripStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">
                {t("End Date", "अन्त्य मिति")}
              </label>
              <Input
                type="date"
                value={newTripEndDate}
                onChange={(e) => setNewTripEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-1">
              {t("Participants", "सहभागीहरू")}
            </label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2">
              {availableFriends.length > 0 ? (
                availableFriends.map(friend => (
                  <div 
                    key={friend.id}
                    className="flex items-center p-2 hover:bg-muted rounded-md"
                  >
                    <input
                      type="checkbox"
                      id={`participant-${friend.id}`}
                      checked={selectedParticipants.includes(friend.id)}
                      onChange={() => toggleParticipant(friend.id)}
                      className="mr-2"
                    />
                    <label 
                      htmlFor={`participant-${friend.id}`}
                      className="flex-grow cursor-pointer"
                    >
                      {friend.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-2">
                  {t("No friends available. Add friends first.", "कुनै साथी उपलब्ध छैन। पहिले साथीहरू थप्नुहोस्।")}
                </p>
              )}
            </div>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleCreateTrip}
            disabled={!newTripName.trim()}
          >
            {t("Create Trip", "यात्रा सिर्जना गर्नुहोस्")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TripCreationForm;
