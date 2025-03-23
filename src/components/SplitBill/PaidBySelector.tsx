
import React from "react";
import { User } from "lucide-react";
import { Participant } from "@/lib/types";

interface PaidBySelectorProps {
  participants: Participant[];
  paidBy: string;
  onPaidByChange: (id: string) => void;
}

const PaidBySelector: React.FC<PaidBySelectorProps> = ({ 
  participants, 
  paidBy, 
  onPaidByChange 
}) => {
  return (
    <div className="glass-panel rounded-xl p-4 mb-6">
      <h2 className="text-lg font-medium mb-3">Paid By</h2>
      
      <div className="space-y-2">
        {participants.map((participant) => (
          <div 
            key={participant.id}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
              paidBy === participant.id 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'bg-white hover:bg-muted/20'
            }`}
            onClick={() => onPaidByChange(participant.id)}
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
            <span>{participant.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaidBySelector;
