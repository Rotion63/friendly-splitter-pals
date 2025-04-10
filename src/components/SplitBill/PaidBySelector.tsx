
import React from "react";
import { Participant } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
      <RadioGroup value={paidBy} onValueChange={onPaidByChange} className="space-y-2">
        {participants.map(participant => (
          <div 
            key={participant.id}
            className="flex items-center p-2 hover:bg-muted/20 rounded-md"
          >
            <RadioGroupItem 
              value={participant.id} 
              id={`payer-${participant.id}`} 
              className="mr-2" 
            />
            <Label 
              htmlFor={`payer-${participant.id}`}
              className="flex-1 cursor-pointer"
            >
              {participant.name}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default PaidBySelector;
