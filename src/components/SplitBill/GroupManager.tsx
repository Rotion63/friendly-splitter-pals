
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
import { getFriends, saveFriend } from "@/lib/friendsStorage";
import { Trash2, UserPlus, Users, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { generateId } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";

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
  const [showAddFriendDialog, setShowAddFriendDialog] = useState(false);
  const [newFriendName, setNewFriendName] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    // Load groups and friends
    setGroups(getGroups());
    setFriends(getFriends());
  }, []);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error(t("Please enter a group name", "कृपया समूह नाम प्रविष्ट गर्नुहोस्"));
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
    
    toast.success(`${newGroupName} ${t("group created", "समूह सिर्जना गरियो")}`);
  };

  const handleDeleteGroup = (groupId: string) => {
    removeGroup(groupId);
    setGroups(groups.filter(g => g.id !== groupId));
    toast.success(t("Group deleted", "समूह मेटाइयो"));
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
    
    toast.success(t("Group updated", "समूह अपडेट गरियो"));
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
  
  const handleAddNewFriend = () => {
    if (!newFriendName.trim()) return;
    
    const newFriend: Participant = {
      id: generateId("friend-"),
      name: newFriendName.trim(),
    };
    
    // Save to friends list
    saveFriend(newFriend);
    
    // Update local state
    const updatedFriends = [...friends, newFriend];
    setFriends(updatedFriends);
    
    // Select the new friend for the current group
    setSelectedFriends([...selectedFriends, newFriend]);
    
    // Reset and close dialog
    setNewFriendName("");
    setShowAddFriendDialog(false);
    
    toast.success(t("Friend added", "साथी थपियो"));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("Friend Groups", "साथी समूहहरू")}</h3>
        
        {/* Create Group Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleOpenCreateDialog}>
              <Users className="h-4 w-4 mr-2" />
              {t("Create Group", "समूह सिर्जना गर्नुहोस्")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Create New Friend Group", "नयाँ साथी समूह सिर्जना गर्नुहोस्")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">{t("Group Name", "समूह नाम")}</Label>
                <Input 
                  id="group-name" 
                  value={newGroupName} 
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder={t("e.g., College Friends, Roommates", "जस्तै, कलेज साथीहरू, रुममेटहरू")}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>{t("Select Members", "सदस्यहरू चयन गर्नुहोस्")}</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAddFriendDialog(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    {t("Add New", "नयाँ थप्नुहोस्")}
                  </Button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                  {friends.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-2">{t("No friends added yet", "अहिलेसम्म कुनै साथी थपिएको छैन")}</p>
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
                  {t("Cancel", "रद्द गर्नुहोस्")}
                </Button>
              </DialogClose>
              <Button 
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || selectedFriends.length === 0}
              >
                {t("Create Group", "समूह सिर्जना गर्नुहोस्")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add New Friend Dialog */}
        <Dialog open={showAddFriendDialog} onOpenChange={setShowAddFriendDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Add New Friend", "नयाँ साथी थप्नुहोस्")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-friend-name">{t("Friend Name", "साथी नाम")}</Label>
                <Input 
                  id="new-friend-name" 
                  value={newFriendName} 
                  onChange={(e) => setNewFriendName(e.target.value)}
                  placeholder={t("Enter friend's name", "साथीको नाम प्रविष्ट गर्नुहोस्")}
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
                onClick={handleAddNewFriend}
                disabled={!newFriendName.trim()}
              >
                {t("Add Friend", "साथी थप्नुहोस्")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Group Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Edit Friend Group", "साथी समूह सम्पादन गर्नुहोस्")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-group-name">{t("Group Name", "समूह नाम")}</Label>
                <Input 
                  id="edit-group-name" 
                  value={newGroupName} 
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>{t("Select Members", "सदस्यहरू चयन गर्नुहोस्")}</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAddFriendDialog(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    {t("Add New", "नयाँ थप्नुहोस्")}
                  </Button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                  {friends.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-2">{t("No friends added yet", "अहिलेसम्म कुनै साथी थपिएको छैन")}</p>
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
                  {t("Cancel", "रद्द गर्नुहोस्")}
                </Button>
              </DialogClose>
              <Button 
                onClick={handleSaveEdit}
                disabled={!newGroupName.trim() || selectedFriends.length === 0}
              >
                {t("Save Changes", "परिवर्तनहरू बचत गर्नुहोस्")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Group List */}
      <div className="space-y-2">
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("No groups created yet", "अहिलेसम्म कुनै समूह सिर्जना गरिएको छैन")}</p>
        ) : (
          groups.map(group => (
            <div 
              key={group.id} 
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div className="flex-1">
                <h4 className="font-medium">{group.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {group.members.length} {group.members.length === 1 ? t('member', 'सदस्य') : t('members', 'सदस्यहरू')}
                </p>
              </div>
              <div className="flex space-x-2">
                {onSelectGroup && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSelectGroup(group)}
                  >
                    {t("Select", "चयन गर्नुहोस्")}
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEditGroup(group)}
                >
                  {t("Edit", "सम्पादन गर्नुहोस्")}
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
