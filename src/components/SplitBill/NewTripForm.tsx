
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, UserPlus } from "lucide-react";
import { Trip, Participant, FriendGroup } from "@/lib/types";
import { saveTrip } from "@/lib/tripStorage";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { toast } from "sonner";

interface NewTripFormProps {
  availableParticipants: Participant[];
  onCancel: () => void;
  onShowAddParticipant: () => void;
  onShowSelectGroup: () => void;
  groups: FriendGroup[];
}

const NewTripForm: React.FC<NewTripFormProps> = ({
  availableParticipants,
  onCancel,
  onShowAddParticipant,
  onShowSelectGroup,
  groups
}) => {
  const [newTripName, setNewTripName] = useState("");
  const [newTripDescription, setNewTripDescription] = useState("");
  const [newTripStartDate, setNewTripStartDate] = useState("");
  const [newTripEndDate, setNewTripEndDate] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [participantContributions, setParticipantContributions] = useState<Record<string, number>>({});
  
  const navigate = useNavigate();
  const { t } = useLanguage();
  
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
    toast.success("Trip created successfully");
    
    // Navigate to the trip details
    navigate(`/trip/${newTrip.id}`);
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
  
  return (
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
              onClick={onShowSelectGroup}
            >
              <Users className="h-4 w-4 mr-1" />
              {t("Add Group", "समूह थप्नुहोस्")}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onShowAddParticipant}
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
          onClick={onCancel}
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
  );
};

export default NewTripForm;
