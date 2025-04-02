
import React from "react";
import { User } from "lucide-react";
import { Participant } from "@/lib/types";

interface PaidBySelectorProps {
  participants: Participant[];
  paidBy: string;
  selectedParticipant?: Participant; // Added this prop
  onPaidByChange: (id: string) => void;
  onSelect?: (participant: Participant) => void; // Added this prop
}

const PaidBySelector: React.FC<PaidBySelectorProps> = ({ 
  participants, 
  paidBy, 
  onPaidByChange,
  selectedParticipant, // Added this prop
  onSelect // Added this prop
}) => {
  // Handle the click based on what props are available
  const handleParticipantClick = (participant: Participant) => {
    if (onSelect) {
      onSelect(participant);
    } else if (onPaidByChange) {
      onPaidByChange(participant.id);
    }
  };

  if (participants.length === 0) {
    return null;
  }
  
  // Determine which participant is selected
  const isSelected = (participant: Participant) => {
    if (selectedParticipant) {
      return participant.id === selectedParticipant.id;
    }
    return participant.id === paidBy;
  };
  
  return (
    <div className="glass-panel rounded-xl p-4 mb-6">
      <h2 className="text-lg font-medium mb-3">Paid By</h2>
      <p className="text-sm text-muted-foreground mb-3">
        Select who paid for the whole bill initially
      </p>
      
      <div className="space-y-2">
        {participants.map((participant) => (
          <div 
            key={participant.id}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
              isSelected(participant)
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'bg-white hover:bg-muted/20'
            }`}
            onClick={() => handleParticipantClick(participant)}
          >
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-3">
              {participant.avatar ? (
                <img 
                  src={participant.avatar} 
                  alt={participant.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div>
              <span className="font-medium">{participant.name}</span>
              {isSelected(participant) && (
                <p className="text-xs text-primary">Paid the full amount</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaidBySelector;
