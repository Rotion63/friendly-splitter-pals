
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/LanguageProvider";

interface AddParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddParticipant: (name: string) => void;
}

const AddParticipantDialog: React.FC<AddParticipantDialogProps> = ({
  open,
  onOpenChange,
  onAddParticipant
}) => {
  const [newParticipantName, setNewParticipantName] = useState("");
  const { t } = useLanguage();

  const handleAddParticipant = () => {
    if (newParticipantName.trim()) {
      onAddParticipant(newParticipantName);
      setNewParticipantName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Add New Participant", "नयाँ सहभागी थप्नुहोस्")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-participant-name">{t("Participant Name", "सहभागी नाम")}</Label>
            <Input 
              id="new-participant-name" 
              value={newParticipantName} 
              onChange={(e) => setNewParticipantName(e.target.value)}
              placeholder={t("Enter name", "नाम प्रविष्ट गर्नुहोस्")}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {t("Cancel", "रद्द गर्नुहोस्")}
            </Button>
          </DialogClose>
          <Button 
            onClick={handleAddParticipant}
            disabled={!newParticipantName.trim()}
          >
            {t("Add Participant", "सहभागी थप्नुहोस्")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddParticipantDialog;
