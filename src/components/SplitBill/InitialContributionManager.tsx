
import React, { useState } from "react";
import { Participant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { Wallet, Plus, ArrowUp } from "lucide-react";

interface InitialContributionManagerProps {
  participants: Participant[];
  onParticipantUpdate: (participants: Participant[]) => void;
}

const InitialContributionManager: React.FC<InitialContributionManagerProps> = ({
  participants,
  onParticipantUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [contributions, setContributions] = useState<Record<string, number>>(
    Object.fromEntries(
      participants.map((p) => [p.id, p.initialContribution || 0])
    )
  );

  const totalContribution = Object.values(contributions).reduce(
    (sum, amount) => sum + amount,
    0
  );

  const handleContributionChange = (participantId: string, value: string) => {
    const amount = parseFloat(value) || 0;
    setContributions({
      ...contributions,
      [participantId]: amount,
    });
  };

  const handleSaveContributions = () => {
    const updatedParticipants = participants.map((participant) => ({
      ...participant,
      initialContribution: contributions[participant.id] || 0,
    }));
    onParticipantUpdate(updatedParticipants);
    setIsEditing(false);
  };

  const handleEqualSplit = () => {
    if (participants.length === 0) return;
    
    const amount = parseFloat(prompt("Enter total contribution amount:", "0") || "0");
    if (isNaN(amount) || amount <= 0) return;
    
    const equalAmount = amount / participants.length;
    const newContributions: Record<string, number> = {};
    
    participants.forEach(p => {
      newContributions[p.id] = equalAmount;
    });
    
    setContributions(newContributions);
  };

  return (
    <div className="glass-panel rounded-xl p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Initial Contributions</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEqualSplit}
          >
            <ArrowUp className="h-3 w-3 mr-1" />
            Equal Split
          </Button>
          
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSaveContributions}
            >
              Save
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <span>{participant.name}</span>
              </div>
              <Input
                type="number"
                value={contributions[participant.id] || 0}
                onChange={(e) =>
                  handleContributionChange(participant.id, e.target.value)
                }
                className="w-24 text-right"
                step="0.01"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <span>{participant.name}</span>
              </div>
              <span className="font-medium">
                {formatCurrency(participant.initialContribution || 0)}
              </span>
            </div>
          ))}

          <div className="flex justify-between items-center pt-3 border-t mt-3">
            <span className="font-medium">Total</span>
            <span className="font-medium">{formatCurrency(totalContribution)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InitialContributionManager;
