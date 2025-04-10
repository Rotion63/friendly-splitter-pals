
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Users } from "lucide-react";
import DeleteBillButton from "./DeleteBillButton";

interface BillHeaderProps {
  title: string;
  onBackToTrip?: () => void;
  onDelete: () => void;
  tripId?: string;
  showParticipantManager: boolean;
  onToggleParticipantManager: () => void;
}

const BillHeader: React.FC<BillHeaderProps> = ({
  title,
  onBackToTrip,
  onDelete,
  tripId,
  showParticipantManager,
  onToggleParticipantManager
}) => {
  return (
    <>
      <div className="flex justify-between items-center pt-2">
        {tripId ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-muted-foreground"
            onClick={onBackToTrip}
          >
            <ArrowUp className="h-3 w-3 mr-1 rotate-315" />
            Back to trip
          </Button>
        ) : (
          <div></div>
        )}
        
        <DeleteBillButton 
          onDelete={onDelete} 
          buttonText="Delete Bill" 
          variant="ghost"
        />
      </div>
      
      <div className="glass-panel rounded-xl p-4 mb-6 mt-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium">Participants</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onToggleParticipantManager}
          >
            <Users className="h-4 w-4 mr-2" />
            {showParticipantManager ? "Hide" : "Manage"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default BillHeader;
