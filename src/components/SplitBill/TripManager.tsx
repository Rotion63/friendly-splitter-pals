
import React, { useState, useEffect } from "react";
import { 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Receipt, 
  ChevronRight,
  Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trip, Participant, Bill } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { getBills } from "@/lib/billStorage";
import { getTripById, getTrips, saveTrip } from "@/lib/tripStorage";
import { useNavigate } from "react-router-dom";

interface TripManagerProps {
  showCreate?: boolean;
}

const TripManager: React.FC<TripManagerProps> = ({ 
  showCreate = true 
}) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [newTripDescription, setNewTripDescription] = useState("");
  const [newTripStartDate, setNewTripStartDate] = useState("");
  const [newTripEndDate, setNewTripEndDate] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [availableParticipants, setAvailableParticipants] = useState<Participant[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load trips
    const loadedTrips = getTrips();
    setTrips(loadedTrips);
    
    // Load participants from bills for selection
    const bills = getBills();
    const allParticipants: Participant[] = [];
    const participantIds = new Set<string>();
    
    bills.forEach(bill => {
      bill.participants.forEach(participant => {
        if (!participantIds.has(participant.id)) {
          participantIds.add(participant.id);
          allParticipants.push(participant);
        }
      });
    });
    
    setAvailableParticipants(allParticipants);
  }, []);
  
  const handleCreateTrip = () => {
    if (!newTripName.trim()) return;
    
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      name: newTripName.trim(),
      description: newTripDescription.trim() || undefined,
      startDate: newTripStartDate || undefined,
      endDate: newTripEndDate || undefined,
      participants: availableParticipants.filter(p => 
        selectedParticipants.includes(p.id)
      ),
      bills: []
    };
    
    saveTrip(newTrip);
    setTrips([...trips, newTrip]);
    
    // Reset form
    setNewTripName("");
    setNewTripDescription("");
    setNewTripStartDate("");
    setNewTripEndDate("");
    setSelectedParticipants([]);
    setIsCreating(false);
  };
  
  const handleTripClick = (tripId: string) => {
    navigate(`/trip/${tripId}`);
  };
  
  const toggleParticipant = (participantId: string) => {
    if (selectedParticipants.includes(participantId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== participantId));
    } else {
      setSelectedParticipants([...selectedParticipants, participantId]);
    }
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
              className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
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
          ))}
        </div>
      )}
      
      {showCreate && (
        <>
          {isCreating ? (
            <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
              <h3 className="text-lg font-medium">Create New Trip</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Trip Name *
                </label>
                <input
                  type="text"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  className="w-full p-2 rounded-md border"
                  placeholder="Summer vacation, Business trip, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={newTripDescription}
                  onChange={(e) => setNewTripDescription(e.target.value)}
                  className="w-full p-2 rounded-md border"
                  rows={2}
                  placeholder="Optional description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newTripStartDate}
                    onChange={(e) => setNewTripStartDate(e.target.value)}
                    className="w-full p-2 rounded-md border"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newTripEndDate}
                    onChange={(e) => setNewTripEndDate(e.target.value)}
                    className="w-full p-2 rounded-md border"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Participants
                </label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                  {availableParticipants.length > 0 ? (
                    availableParticipants.map(participant => (
                      <div 
                        key={participant.id}
                        className="flex items-center p-2 hover:bg-muted rounded-md"
                      >
                        <input
                          type="checkbox"
                          id={`participant-${participant.id}`}
                          checked={selectedParticipants.includes(participant.id)}
                          onChange={() => toggleParticipant(participant.id)}
                          className="mr-2"
                        />
                        <label 
                          htmlFor={`participant-${participant.id}`}
                          className="flex-grow cursor-pointer"
                        >
                          {participant.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-2">
                      No participants available. Create a bill with participants first.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTrip}
                  disabled={!newTripName.trim() || selectedParticipants.length === 0}
                >
                  Create Trip
                </Button>
              </div>
            </div>
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
    </div>
  );
};

export default TripManager;
