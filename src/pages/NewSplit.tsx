
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import AddParticipant from "@/components/SplitBill/AddParticipant";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Participant, FriendGroup, BillItem } from "@/lib/types";
import { getFriends } from "@/lib/friendsStorage";
import { UserPlus, AlertCircle, Users, Camera, FileText } from "lucide-react";
import { createEmptyBill, saveBill } from "@/lib/billStorage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GroupManager from "@/components/SplitBill/GroupManager";
import MenuScanner from "@/components/SplitBill/MenuScanner";
import { getGroups } from "@/lib/groupsStorage";
import { generateId } from "@/lib/utils";

const NewSplit: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [friends, setFriends] = useState<Participant[]>([]);
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const [showAddFriends, setShowAddFriends] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showMenuScanner, setShowMenuScanner] = useState(false);
  
  useEffect(() => {
    const friendsList = getFriends();
    const groupsList = getGroups();
    setFriends(friendsList);
    setGroups(groupsList);
    
    if (friendsList.length > 0) {
      setParticipants([friendsList[0]]);
    }
  }, []);
  
  const handleAddParticipant = (participant: Participant) => {
    setParticipants([...participants, participant]);
  };
  
  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const addFriendAsParticipant = (friend: Participant) => {
    if (!participants.some(p => p.id === friend.id)) {
      setParticipants([...participants, friend]);
      toast.success(`${friend.name} added to this split`);
    } else {
      toast.error(`${friend.name} is already in this split`);
    }
  };

  const handleSelectGroup = (group: FriendGroup) => {
    const newParticipants = [...participants];
    let addedCount = 0;
    
    group.members.forEach(member => {
      if (!participants.some(p => p.id === member.id)) {
        newParticipants.push(member);
        addedCount++;
      }
    });
    
    setParticipants(newParticipants);
    
    if (addedCount > 0) {
      toast.success(`Added ${addedCount} participants from ${group.name}`);
    } else {
      toast.info("All members from this group are already included");
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a title for your split");
      return;
    }
    
    if (participants.length < 2) {
      toast.error("You need at least 2 participants to split a bill");
      return;
    }
    
    const newBill = createEmptyBill(title, participants);
    saveBill(newBill);
    
    navigate(`/split-details/${newBill.id}`);
  };
  
  const handleMenuProcessed = (items: { name: string; price: number }[]) => {
    if (!title.trim()) {
      toast.error("Please enter a title for your split");
      return;
    }
    
    if (participants.length < 2) {
      toast.error("You need at least 2 participants to split a bill");
      return;
    }
    
    const newBill = createEmptyBill(title, participants);
    
    let totalAmount = 0;
    const newItems: BillItem[] = items.map(item => {
      totalAmount += item.price;
      return {
        id: generateId("item-"),
        name: item.name,
        amount: item.price,
        participants: participants.map(p => p.id)
      };
    });
    
    newBill.items = newItems;
    newBill.totalAmount = totalAmount;
    saveBill(newBill);
    
    toast.success(`Created bill with ${items.length} items from menu`);
    navigate(`/split-details/${newBill.id}`);
  };
  
  const showFriendGuidance = participants.length < 2 && friends.length === 0;
  
  const toggleShowFriends = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAddFriends(!showAddFriends);
  };
  
  const toggleShowGroups = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAddGroup(!showAddGroup);
  };
  
  return (
    <AppLayout showBackButton title="New Split">
      <div className="py-6">
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Split Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Dinner, Vacation, Groceries"
              className="text-lg"
              required
            />
          </div>
          
          {showFriendGuidance && (
            <Alert variant="default" className="bg-muted/50 border-primary/20">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription>
                You need at least 2 participants to split a bill. Add yourself and a friend to continue.
              </AlertDescription>
            </Alert>
          )}
          
          <AddParticipant
            participants={participants}
            onAdd={handleAddParticipant}
            onRemove={handleRemoveParticipant}
          />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Add from saved contacts</span>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Manage Groups</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="groups" className="w-full">
                    <TabsList className="grid w-full grid-cols-1">
                      <TabsTrigger value="groups">Groups</TabsTrigger>
                    </TabsList>
                    <TabsContent value="groups" className="pt-4">
                      <GroupManager onSelectGroup={handleSelectGroup} />
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={toggleShowFriends}
                type="button"
              >
                {showAddFriends ? 'Hide Friends' : 'Show Friends'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={toggleShowGroups}
                type="button"
              >
                {showAddGroup ? 'Hide Groups' : 'Show Groups'}
              </Button>
            </div>
            
            {showAddFriends && friends.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2"
              >
                {friends.map(friend => (
                  <Button
                    key={friend.id}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => addFriendAsParticipant(friend)}
                    disabled={participants.some(p => p.id === friend.id)}
                    type="button"
                  >
                    <span>{friend.name}</span>
                    <UserPlus className="h-3.5 w-3.5" />
                  </Button>
                ))}
              </motion.div>
            )}
            
            {showAddGroup && groups.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col space-y-2"
              >
                {groups.map(group => (
                  <Button
                    key={group.id}
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-between w-full"
                    onClick={() => handleSelectGroup(group)}
                    type="button"
                  >
                    <div className="flex items-center">
                      <Users className="h-3.5 w-3.5 mr-2" />
                      <span>{group.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                    </span>
                  </Button>
                ))}
              </motion.div>
            )}
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button 
              type="submit" 
              className="w-full py-6 text-lg"
              disabled={!title.trim() || participants.length < 2}
            >
              Continue Manually
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                if (!title.trim() || participants.length < 2) {
                  toast.error("Please enter title and add at least 2 participants");
                  return;
                }
                setShowMenuScanner(true);
              }}
              disabled={!title.trim() || participants.length < 2}
            >
              <Camera className="h-5 w-5" />
              <FileText className="h-5 w-5" />
            </Button>
          </div>
        </motion.form>
        
        <MenuScanner 
          isOpen={showMenuScanner}
          onClose={() => setShowMenuScanner(false)}
          onMenuProcessed={handleMenuProcessed}
        />
      </div>
    </AppLayout>
  );
};

export default NewSplit;
