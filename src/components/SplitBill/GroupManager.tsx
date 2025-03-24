
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { Participant, FriendGroup } from "@/lib/types";
import { 
  getGroups, 
  saveGroup, 
  removeGroup, 
  createEmptyGroup 
} from "@/lib/groupsStorage";
import { getFriends } from "@/lib/friendsStorage";
import { Trash2, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";

interface GroupManagerProps {
  onSelectGroup?: (group: FriendGroup) => void;
}

const GroupManager: React.FC<GroupManagerProps> = ({ onSelectGroup }) => {
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const [friends, setFriends] = useState<Participant[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<Participant[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    // Load groups and friends
    setGroups(getGroups());
    setFriends(getFriends());
  }, []);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    const newGroup = createEmptyGroup(newGroupName);
    newGroup.members = [...selectedFriends];
    
    saveGroup(newGroup);
    setGroups([...groups, newGroup]);
    
    // Reset form
    setNewGroupName("");
    setSelectedFriends([]);
    setShowCreateDialog(false);
    
    toast.success(`${newGroupName} group created`);
  };

  const handleDeleteGroup = (groupId: string) => {
    removeGroup(groupId);
    setGroups(groups.filter(g => g.id !== groupId));
    toast.success("Group deleted");
  };

  const handleEditGroup = (group: FriendGroup) => {
    setEditingGroupId(group.id);
    setNewGroupName(group.name);
    setSelectedFriends([...group.members]);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editingGroupId || !newGroupName.trim()) return;

    const updatedGroup: FriendGroup = {
      id: editingGroupId,
      name: newGroupName.trim(),
      members: selectedFriends,
    };

    saveGroup(updatedGroup);
    
    setGroups(
      groups.map(g => (g.id === editingGroupId ? updatedGroup : g))
    );
    
    setEditingGroupId(null);
    setNewGroupName("");
    setSelectedFriends([]);
    setShowEditDialog(false);
    
    toast.success("Group updated");
  };

  const toggleFriendSelection = (friend: Participant) => {
    if (selectedFriends.some(f => f.id === friend.id)) {
      setSelectedFriends(selectedFriends.filter(f => f.id !== friend.id));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const handleOpenCreateDialog = () => {
    setSelectedFriends([]);
    setNewGroupName("");
    setShowCreateDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Friend Groups</h3>
        
        {/* Create Group Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleOpenCreateDialog}>
              <Users className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Friend Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input 
                  id="group-name" 
                  value={newGroupName} 
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., College Friends, Roommates"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Select Members</Label>
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                  {friends.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-2">No friends added yet</p>
                  ) : (
                    friends.map(friend => (
                      <div 
                        key={friend.id} 
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer border ${
                          selectedFriends.some(f => f.id === friend.id) ? 'bg-primary/10 border-primary/30' : ''
                        }`}
                        onClick={() => toggleFriendSelection(friend)}
                      >
                        <span>{friend.name}</span>
                        {selectedFriends.some(f => f.id === friend.id) && (
                          <UserPlus className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || selectedFriends.length === 0}
              >
                Create Group
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Group Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Friend Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-group-name">Group Name</Label>
                <Input 
                  id="edit-group-name" 
                  value={newGroupName} 
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Select Members</Label>
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                  {friends.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-2">No friends added yet</p>
                  ) : (
                    friends.map(friend => (
                      <div 
                        key={friend.id} 
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer border ${
                          selectedFriends.some(f => f.id === friend.id) ? 'bg-primary/10 border-primary/30' : ''
                        }`}
                        onClick={() => toggleFriendSelection(friend)}
                      >
                        <span>{friend.name}</span>
                        {selectedFriends.some(f => f.id === friend.id) && (
                          <UserPlus className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                onClick={handleSaveEdit}
                disabled={!newGroupName.trim() || selectedFriends.length === 0}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Group List */}
      <div className="space-y-2">
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No groups created yet</p>
        ) : (
          groups.map(group => (
            <div 
              key={group.id} 
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div className="flex-1">
                <h4 className="font-medium">{group.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                </p>
              </div>
              <div className="flex space-x-2">
                {onSelectGroup && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSelectGroup(group)}
                  >
                    Select
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEditGroup(group)}
                >
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteGroup(group.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupManager;
