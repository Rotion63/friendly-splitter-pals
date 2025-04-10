
import React, { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trip, Participant, FriendGroup } from "@/lib/types";
import { getTrips, saveTrip } from "@/lib/tripStorage";
import { useNavigate } from "react-router-dom";
import { getFriends, saveFriend } from "@/lib/billStorage";
import { getGroups } from "@/lib/groupsStorage";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";
import TripCard from "./TripCard";
import NewTripForm from "./NewTripForm";
import AddParticipantDialog from "./AddParticipantDialog";
import SelectGroupDialog from "./SelectGroupDialog";
import { useLanguage } from "@/components/LanguageProvider";

interface TripManagerProps {
  showCreate?: boolean;
}

const TripManager: React.FC<TripManagerProps> = ({ 
  showCreate = true 
}) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showAddParticipantDialog, setShowAddParticipantDialog] = useState(false);
  const [showSelectGroupDialog, setShowSelectGroupDialog] = useState(false);
  const [availableParticipants, setAvailableParticipants] = useState<Participant[]>([]);
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  useEffect(() => {
    // Load trips
    const loadedTrips = getTrips();
    setTrips(loadedTrips);
    
    // Load participants from bills for selection
    const friends = getFriends();
    setAvailableParticipants(friends);
    
    // Load groups
    setGroups(getGroups());
  }, []);
  
  const handleTripClick = (tripId: string) => {
    navigate(`/trip/${tripId}`);
  };
  
  const handleAddParticipant = (name: string) => {
    // Create new participant
    const newParticipant: Participant = {
      id: generateId("friend-"),
      name: name.trim()
    };
    
    // Save to friends list
    saveFriend(newParticipant);
    
    // Add to available participants
    setAvailableParticipants([...availableParticipants, newParticipant]);
    
    toast.success(t("Participant added", "सहभागी थपियो"));
    setShowAddParticipantDialog(false);
  };
  
  const handleSelectGroup = (group: FriendGroup) => {
    setShowSelectGroupDialog(false);
    toast.success(`${t("Group", "समूह")} "${group.name}" ${t("members added", "सदस्यहरू थपियो")}`);
  };
  
  return (
    <div className="space-y-4">
      {trips.length > 0 && (
        <div className="space-y-3">
          {trips.map(trip => (
            <TripCard 
              key={trip.id} 
              trip={trip} 
              onClick={() => handleTripClick(trip.id)} 
            />
          ))}
        </div>
      )}
      
      {showCreate && (
        <>
          {isCreating ? (
            <NewTripForm 
              availableParticipants={availableParticipants}
              onCancel={() => setIsCreating(false)}
              onShowAddParticipant={() => setShowAddParticipantDialog(true)}
              onShowSelectGroup={() => setShowSelectGroupDialog(true)}
              groups={groups}
            />
          ) : (
            <Button 
              variant="outline" 
              className="w-full py-6 flex items-center justify-center"
              onClick={() => setIsCreating(true)}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create New Trip
            </Button>
          )}
        </>
      )}
      
      {/* Dialogs */}
      <AddParticipantDialog 
        open={showAddParticipantDialog}
        onOpenChange={setShowAddParticipantDialog}
        onAddParticipant={handleAddParticipant}
      />
      
      <SelectGroupDialog 
        open={showSelectGroupDialog}
        onOpenChange={setShowSelectGroupDialog}
        groups={groups}
        onSelectGroup={handleSelectGroup}
      />
    </div>
  );
};

export default TripManager;
