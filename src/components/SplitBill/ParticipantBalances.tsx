
import React from "react";
import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Participant } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ParticipantBalancesProps {
  participants: Participant[];
  onBalanceUpdate?: (participantId: string, newBalance: number) => void;
}

const ParticipantBalances: React.FC<ParticipantBalancesProps> = ({ 
  participants, 
  onBalanceUpdate 
}) => {
  const handleBalanceChange = (
    participantId: string, 
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!onBalanceUpdate) return;
    
    const newBalance = parseFloat(e.target.value) || 0;
    onBalanceUpdate(participantId, newBalance);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Participant Balances</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Track how much money each person has contributed to the pool
      </p>
      
      <div className="space-y-2">
        {participants.map(participant => (
          <div 
            key={participant.id} 
            className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{participant.name}</p>
                <div className="flex items-center text-xs">
                  {(participant.balance || 0) > 0 ? (
                    <>
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-600">Has contributed</span>
                    </>
                  ) : (participant.balance || 0) < 0 ? (
                    <>
                      <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                      <span className="text-red-600">Owes money</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">No balance</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              {onBalanceUpdate ? (
                <input
                  type="number"
                  value={participant.balance || 0}
                  onChange={(e) => handleBalanceChange(participant.id, e)}
                  className="w-24 p-2 rounded-md border text-right"
                  step="0.01"
                />
              ) : (
                <span className={`font-medium ${
                  (participant.balance || 0) > 0 
                    ? "text-green-600" 
                    : (participant.balance || 0) < 0 
                      ? "text-red-600" 
                      : ""
                }`}>
                  {formatCurrency(participant.balance || 0)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantBalances;
