
import React, { useState, useEffect } from "react";
import { 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Receipt, 
  ChevronRight,
  Pencil,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trip, Participant, Bill, FriendGroup } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { getBills } from "@/lib/billStorage";
import { getTripById, getTrips, saveTrip } from "@/lib/tripStorage";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getFriends, saveFriend } from "@/lib/billStorage";
import { getGroups } from "@/lib/groupsStorage";
import { generateId } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";

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
  const [showAddParticipantDialog, setShowAddParticipantDialog] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [participantContributions, setParticipantContributions] = useState<Record<string, number>>({});
  const [showSelectGroupDialog, setShowSelectGroupDialog] = useState(false);
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const navigate = useNavigate();
  const { t } = useLanguage();
  
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
    
    // Load existing friends
    const friends = getFriends();
    friends.forEach(friend => {
      if (!participantIds.has(friend.id)) {
        participantIds.add(friend.id);
        allParticipants.push(friend);
      }
    });
    
    setAvailableParticipants(allParticipants);
    
    // Load groups
    setGroups(getGroups());
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
      ).map(p => ({
        ...p,
        initialContribution: participantContributions[p.id] || 0,
        balance: 0 // Initialize balance at 0
      })),
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
    setParticipantContributions({});
    setIsCreating(false);
    
    // Navigate to the trip details
    navigate(`/trip/${newTrip.id}`);
  };
  
  const handleTripClick = (tripId: string) => {
    navigate(`/trip/${tripId}`);
  };
  
  const toggleParticipant = (participantId: string) => {
    if (selectedParticipants.includes(participantId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== participantId));
      
      // Remove contribution
      const updatedContributions = { ...participantContributions };
      delete updatedContributions[participantId];
      setParticipantContributions(updatedContributions);
    } else {
      setSelectedParticipants([...selectedParticipants, participantId]);
    }
  };
  
  const handleAddParticipant = () => {
    if (!newParticipantName.trim()) return;
    
    // Create new participant
    const newParticipant: Participant = {
      id: generateId("friend-"),
      name: newParticipantName.trim()
    };
    
    // Save to friends list
    saveFriend(newParticipant);
    
    // Add to available participants
    setAvailableParticipants([...availableParticipants, newParticipant]);
    
    // Add to current selection
    setSelectedParticipants([...selectedParticipants, newParticipant.id]);
    setNewParticipantName("");
    setShowAddParticipantDialog(false);
    
    toast.success(t("Participant added", "सहभागी थपियो"));
  };
  
  const handleContributionChange = (participantId: string, value: string) => {
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount >= 0) {
      setParticipantContributions({
        ...participantContributions,
        [participantId]: amount
      });
    }
  };
  
  const getTotalContributions = () => {
    return Object.values(participantContributions).reduce((sum, amount) => sum + amount, 0);
  };
  
  const handleSelectGroup = (group: FriendGroup) => {
    // Add all group members to selected participants without duplicates
    const existingIds = new Set(selectedParticipants);
    const newParticipants = group.members.filter(member => !existingIds.has(member.id));
    setSelectedParticipants([...selectedParticipants, ...newParticipants.map(p => p.id)]);
    setShowSelectGroupDialog(false);
    
    toast.success(`${t("Group", "समूह")} "${group.name}" ${t("members added", "सदस्यहरू थपियो")}`);
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
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">
                    Participants
                  </label>
                  <div className="space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowSelectGroupDialog(true)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      {t("Add Group", "समूह थप्नुहोस्")}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowAddParticipantDialog(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      {t("Add New", "नयाँ थप्नुहोस्")}
                    </Button>
                  </div>
                </div>
                {selectedParticipants.length > 0 ? (
                  <div className="border rounded-md divide-y">
                    {selectedParticipants.map(participantId => {
                      const participant = availableParticipants.find(p => p.id === participantId);
                      if (!participant) return null;
                      
                      return (
                        <div key={participant.id} className="p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span>{participant.name}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => toggleParticipant(participant.id)}
                            >
                              {t("Remove", "हटाउनुहोस्")}
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`contribution-${participant.id}`} className="whitespace-nowrap text-xs">
                              {t("Initial Contribution:", "प्रारम्भिक योगदान:")}
                            </Label>
                            <Input
                              id={`contribution-${participant.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={participantContributions[participant.id] || ""}
                              onChange={(e) => handleContributionChange(participant.id, e.target.value)}
                              placeholder="0.00"
                              className="h-8"
                            />
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="p-3 bg-muted/20">
                      <div className="flex justify-between text-sm">
                        <span>{t("Total Contributions:", "कुल योगदानहरू:")}</span>
                        <span className="font-medium">{formatCurrency(getTotalContributions())}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 border rounded-md text-muted-foreground">
                    {t("Select participants for this trip", "यस यात्राको लागि सहभागीहरू चयन गर्नुहोस्")}
                  </div>
                )}
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
      
      {/* Add Participant Dialog */}
      <Dialog open={showAddParticipantDialog} onOpenChange={setShowAddParticipantDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Add New Participant", "नयाँ सहभागी थप्नुहोस्")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-participant-name">{t("Participant Name", "सहभागी नाम")}</Label>
              <Input 
                id="new-participant-name" 
                value={newParticipantName} 
                onChange={(e) => setNewParticipantName(e.target.value)}
                placeholder={t("Enter name", "नाम प्रविष्ट गर्नुहोस्")}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                {t("Cancel", "रद्द गर्नुहोस्")}
              </Button>
            </DialogClose>
            <Button 
              onClick={handleAddParticipant}
              disabled={!newParticipantName.trim()}
            >
              {t("Add Participant", "सहभागी थप्नुहोस्")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Select Group Dialog */}
      <Dialog open={showSelectGroupDialog} onOpenChange={setShowSelectGroupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Select Group", "समूह चयन गर्नुहोस्")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {groups.length > 0 ? (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {groups.map(group => (
                  <div 
                    key={group.id} 
                    className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/30 cursor-pointer"
                    onClick={() => handleSelectGroup(group)}
                  >
                    <div>
                      <h4 className="font-medium">{group.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {group.members.length} {group.members.length === 1 ? t('member', 'सदस्य') : t('members', 'सदस्यहरू')}
                      </p>
                    </div>
                    <Button size="sm">
                      {t("Select", "चयन गर्नुहोस्")}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 border rounded-md text-muted-foreground">
                {t("No groups available. Create a group first.", "कुनै समूहहरू उपलब्ध छैनन्। पहिले समूह सिर्जना गर्नुहोस्।")}
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button">
                {t("Close", "बन्द गर्नुहोस्")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripManager;
