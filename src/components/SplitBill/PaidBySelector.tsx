
import React from "react";
import { Participant } from "@/lib/types";

interface PaidBySelectorProps {
  participants: Participant[];
  paidBy: string;
  onPaidByChange: (id: string) => void;
  label?: string;
}

const PaidBySelector: React.FC<PaidBySelectorProps> = ({ 
  participants, 
  paidBy, 
  onPaidByChange,
  label = "Who paid for this?" 
}) => {
  return (
    <div className="glass-panel rounded-xl p-4 mb-6">
      <h2 className="text-lg font-medium mb-3">{label}</h2>
      <div className="space-y-2">
        {participants.map(participant => (
          <div 
            key={participant.id}
            className="flex items-center p-2 hover:bg-muted/20 rounded-md"
          >
            <input
              type="radio"
              id={`payer-${participant.id}`}
              name="paidBy"
              checked={paidBy === participant.id}
              onChange={() => onPaidByChange(participant.id)}
              className="mr-2"
            />
            <label 
              htmlFor={`payer-${participant.id}`}
              className="flex-1 cursor-pointer"
            >
              {participant.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaidBySelector;
