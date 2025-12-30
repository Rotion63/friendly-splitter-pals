
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Plus, X } from "lucide-react";
import { Participant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddParticipantProps {
  participants: Participant[];
  onAdd: (participant: Participant) => void;
  onRemove: (id: string) => void;
}

const AddParticipant: React.FC<AddParticipantProps> = ({ 
  participants, 
  onAdd, 
  onRemove 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    if (newName.trim()) {
      onAdd({
        id: `p-${Date.now()}`,
        name: newName.trim()
      });
      setNewName("");
      setIsAdding(false);
    }
  };

  return (
    <div className="mb-6" data-tutorial="add-participant-section">
      <h2 className="text-lg font-medium mb-3">Participants</h2>
      
      <div className="space-y-3">
        {participants.map((participant, index) => (
          <motion.div
            key={participant.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="flex items-center justify-between bg-white rounded-lg p-3 shadow-soft"
          >
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                {participant.avatar ? (
                  <img 
                    src={participant.avatar} 
                    alt={participant.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <span className="font-medium">{participant.name}</span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(participant.id)}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </div>
      
      <AnimatePresence>
        {isAdding ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3"
          >
            <div className="flex items-center space-x-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter name"
                className="flex-1"
                autoFocus
                data-tutorial="participant-name-input"
              />
              <Button onClick={handleAdd} disabled={!newName.trim()}>Add</Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsAdding(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3"
          >
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Person
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddParticipant;
