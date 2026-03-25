
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, UserPlus, Check } from "lucide-react";
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
        balance: 0
      })),
      bills: []
    };
    
    saveTrip(newTrip);
    toast.success("Trip created successfully");
    navigate(`/trip/${newTrip.id}`);
  };
  
  const toggleParticipant = (participantId: string) => {
    if (selectedParticipants.includes(participantId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== participantId));
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

  const unselectedParticipants = availableParticipants.filter(
    p => !selectedParticipants.includes(p.id)
  );
  
  return (
    <div className="bg-card rounded-lg p-4 shadow-sm space-y-4">
      <h3 className="text-lg font-medium">{t("Create New Trip", "नयाँ यात्रा सिर्जना गर्नुहोस्")}</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          {t("Trip Name *", "यात्राको नाम *")}
        </label>
        <input
          type="text"
          value={newTripName}
          onChange={(e) => setNewTripName(e.target.value)}
          className="w-full p-2 rounded-md border bg-background"
          placeholder={t("Summer vacation, Business trip, etc.", "गृष्मकालीन बिदा, व्यापार यात्रा, आदि।")}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          {t("Description", "विवरण")}
        </label>
        <textarea
          value={newTripDescription}
          onChange={(e) => setNewTripDescription(e.target.value)}
          className="w-full p-2 rounded-md border bg-background"
          rows={2}
          placeholder={t("Optional description", "वैकल्पिक विवरण")}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("Start Date", "सुरु मिति")}
          </label>
          <input
            type="date"
            value={newTripStartDate}
            onChange={(e) => setNewTripStartDate(e.target.value)}
            className="w-full p-2 rounded-md border bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("End Date", "अन्त्य मिति")}
          </label>
          <input
            type="date"
            value={newTripEndDate}
            onChange={(e) => setNewTripEndDate(e.target.value)}
            className="w-full p-2 rounded-md border bg-background"
          />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">
            {t("Participants", "सहभागीहरू")}
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

        {/* Available friends to select */}
        {unselectedParticipants.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-2">
              {t("Tap to add:", "थप्न ट्याप गर्नुहोस्:")}
            </p>
            <div className="flex flex-wrap gap-2">
              {unselectedParticipants.map(p => (
                <Button
                  key={p.id}
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => toggleParticipant(p.id)}
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  {p.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Selected participants with contributions */}
        {selectedParticipants.length > 0 ? (
          <div className="border rounded-md divide-y">
            {selectedParticipants.map(participantId => {
              const participant = availableParticipants.find(p => p.id === participantId);
              if (!participant) return null;
              
              return (
                <div key={participant.id} className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{participant.name}</span>
                    </div>
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
        <Button variant="outline" onClick={onCancel}>
          {t("Cancel", "रद्द गर्नुहोस्")}
        </Button>
        <Button 
          onClick={handleCreateTrip}
          disabled={!newTripName.trim() || selectedParticipants.length === 0}
        >
          {t("Create Trip", "यात्रा सिर्जना गर्नुहोस्")}
        </Button>
      </div>
    </div>
  );
};

export default NewTripForm;
