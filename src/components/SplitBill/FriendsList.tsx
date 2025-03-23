
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Plus, X, UserPlus } from "lucide-react";
import { Participant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateId } from "@/lib/utils";

interface FriendsListProps {
  friends: Participant[];
  onAddFriend: (friend: Participant) => void;
  onRemoveFriend: (id: string) => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ 
  friends, 
  onAddFriend, 
  onRemoveFriend 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    if (newName.trim()) {
      onAddFriend({
        id: generateId("friend-"),
        name: newName.trim()
      });
      setNewName("");
      setIsAdding(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium">Friends</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-primary"
          onClick={() => setIsAdding(true)}
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          <span>Add</span>
        </Button>
      </div>
      
      {friends.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-soft"
            >
              <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                {friend.avatar ? (
                  <img 
                    src={friend.avatar} 
                    alt={friend.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-3 w-3" />
                )}
              </div>
              <span className="text-sm font-medium">{friend.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive ml-1"
                onClick={() => onRemoveFriend(friend.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground bg-muted/30 rounded-lg mb-3">
          <p className="text-sm">Add your friends to easily split bills</p>
        </div>
      )}
      
      <AnimatePresence>
        {isAdding && (
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
                placeholder="Friend's name"
                className="flex-1"
                autoFocus
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
        )}
      </AnimatePresence>
    </div>
  );
};

export default FriendsList;
