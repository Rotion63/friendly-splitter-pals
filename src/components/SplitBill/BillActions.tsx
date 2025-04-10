
import React from "react";
import { Button } from "@/components/ui/button";

interface BillActionsProps {
  hasItems: boolean;
  onCalculateSplit: () => void;
  onViewSummary: () => void;
}

const BillActions: React.FC<BillActionsProps> = ({
  hasItems,
  onCalculateSplit,
  onViewSummary
}) => {
  return (
    <div className="flex space-x-2 mt-6">
      <Button 
        className="flex-1 py-6"
        onClick={onCalculateSplit}
        disabled={!hasItems}
      >
        Calculate Split
      </Button>
      
      <Button 
        className="flex-1 py-6"
        variant="outline"
        onClick={onViewSummary}
        disabled={!hasItems}
      >
        View Summary
      </Button>
    </div>
  );
};

export default BillActions;
