
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trip, Participant } from "@/lib/types";
import { toast } from "sonner";

interface CreateBillFormProps {
  trip: Trip;
  onCreateBill: (title: string, participantIds: string[]) => void;
  onCancel: () => void;
  onScanMenu: () => void;
}

const CreateBillForm: React.FC<CreateBillFormProps> = ({
  trip,
  onCreateBill,
  onCancel,
  onScanMenu
}) => {
  const [newBillTitle, setNewBillTitle] = useState("");
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(
    trip.participants.map(p => p.id)
  );

  const toggleBillParticipant = (participantId: string) => {
    if (selectedParticipantIds.includes(participantId)) {
      setSelectedParticipantIds(selectedParticipantIds.filter(id => id !== participantId));
    } else {
      setSelectedParticipantIds([...selectedParticipantIds, participantId]);
    }
  };

  return (
    <div className="bg-muted/20 rounded-lg p-4">
      <h4 className="font-medium mb-2">New Bill</h4>
      <input
        type="text"
        placeholder="Bill title"
        value={newBillTitle}
        onChange={(e) => setNewBillTitle(e.target.value)}
        className="w-full p-2 rounded-md border mb-3"
      />
      
      <div className="mb-4">
        <h5 className="text-sm font-medium mb-2">Select Participants for this Bill</h5>
        <div className="max-h-40 overflow-y-auto border rounded-md p-2">
          {trip.participants.map(participant => (
            <div 
              key={participant.id}
              className="flex items-center p-2 hover:bg-muted rounded-md"
            >
              <input
                type="checkbox"
                id={`bill-participant-${participant.id}`}
                checked={selectedParticipantIds.includes(participant.id)}
                onChange={() => toggleBillParticipant(participant.id)}
                className="mr-2"
              />
              <label 
                htmlFor={`bill-participant-${participant.id}`}
                className="flex-grow cursor-pointer"
              >
                {participant.name}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            if (newBillTitle.trim() && selectedParticipantIds.length > 0) {
              onScanMenu();
            } else {
              toast.error("Please enter a bill title and select participants");
            }
          }}
        >
          Scan Menu
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          size="sm"
          onClick={() => onCreateBill(newBillTitle, selectedParticipantIds)}
          disabled={!newBillTitle.trim() || selectedParticipantIds.length === 0}
        >
          Create Empty
        </Button>
      </div>
    </div>
  );
};

export default CreateBillForm;
