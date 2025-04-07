
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
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Place, MenuItem, Participant, FriendGroup } from "@/lib/types";
import { 
  getPlaces, 
  savePlace, 
  removePlace, 
  createEmptyPlace,
  addMenuItem,
  removeMenuItem
} from "@/lib/placesStorage";
import { getFriends, saveFriend } from "@/lib/friendsStorage";
import { getGroups } from "@/lib/groupsStorage";
import { Trash2, Plus, MapPin, Camera, Upload, FolderPlus, UserPlus, Users, Calendar } from "lucide-react";
import { toast } from "sonner";
import MenuScanner from "@/components/SplitBill/MenuScanner";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, generateId } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { useNavigate } from "react-router-dom";

interface PlaceManagerProps {
  onSelectPlace?: (place: Place) => void;
  onSelectMenuItem?: (place: Place, menuItem: MenuItem) => void;
}

const PlaceManager: React.FC<PlaceManagerProps> = ({ 
  onSelectPlace, 
  onSelectMenuItem 
}) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [newPlaceName, setNewPlaceName] = useState("");
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [showAddPlaceDialog, setShowAddPlaceDialog] = useState(false);
  const [showAddMenuItemDialog, setShowAddMenuItemDialog] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [newMenuItemName, setNewMenuItemName] = useState("");
  const [newMenuItemPrice, setNewMenuItemPrice] = useState("");
  const [showMenuScanner, setShowMenuScanner] = useState(false);
  const [initialContribution, setInitialContribution] = useState("");
  const [friends, setFriends] = useState<Participant[]>([]);
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([]);
  const [showAddParticipantDialog, setShowAddParticipantDialog] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [participantContributions, setParticipantContributions] = useState<Record<string, number>>({});
  const [showSelectGroupDialog, setShowSelectGroupDialog] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    setPlaces(getPlaces());
    setFriends(getFriends());
    setGroups(getGroups());
  }, []);

  const handleCreatePlace = () => {
    if (!newPlaceName.trim()) {
      toast.error(t("Please enter a place name", "कृपया स्थान नाम प्रविष्ट गर्नुहोस्"));
      return;
    }

    const newPlace = createEmptyPlace(newPlaceName);
    
    // Add selected participants
    newPlace.participants = selectedParticipants.map(p => ({
      ...p,
      initialContribution: participantContributions[p.id] || 0,
      balance: 0 // Initialize balance at 0
    }));
    
    // Add dates if provided
    if (startDate) newPlace.startDate = startDate;
    if (endDate) newPlace.endDate = endDate;
    
    // Save place
    savePlace(newPlace);
    setPlaces([...places, newPlace]);
    
    // Reset form
    setNewPlaceName("");
    setInitialContribution("");
    setSelectedParticipants([]);
    setParticipantContributions({});
    setStartDate("");
    setEndDate("");
    setShowAddPlaceDialog(false);
    
    toast.success(`${newPlaceName} ${t("place created", "स्थान सिर्जना गरियो")}`);
    
    // Navigate to the place detail page
    navigate(`/place/${newPlace.id}`);
  };

  const handleDeletePlace = (placeId: string) => {
    removePlace(placeId);
    setPlaces(places.filter(p => p.id !== placeId));
    toast.success(t("Place deleted", "स्थान मेटाइयो"));
  };

  const handleOpenAddMenuDialog = (placeId: string) => {
    setSelectedPlaceId(placeId);
    setNewMenuItemName("");
    setNewMenuItemPrice("");
    setShowAddMenuItemDialog(true);
  };

  const handleAddMenuItem = () => {
    if (!selectedPlaceId || !newMenuItemName.trim() || !newMenuItemPrice) {
      toast.error(t("Please fill all fields", "कृपया सबै फिल्डहरू भर्नुहोस्"));
      return;
    }

    const price = parseFloat(newMenuItemPrice);
    if (isNaN(price) || price <= 0) {
      toast.error(t("Please enter a valid price", "कृपया मान्य मूल्य प्रविष्ट गर्नुहोस्"));
      return;
    }

    const newMenuItem: MenuItem = {
      id: "",  // Will be generated in the storage function
      name: newMenuItemName.trim(),
      price: price
    };

    addMenuItem(selectedPlaceId, newMenuItem);
    
    setPlaces(places.map(place => {
      if (place.id === selectedPlaceId) {
        return {
          ...place,
          menu: [...place.menu, {...newMenuItem, id: `item-${Date.now()}`}]
        };
      }
      return place;
    }));
    
    setNewMenuItemName("");
    setNewMenuItemPrice("");
    setShowAddMenuItemDialog(false);
    
    toast.success(t("Menu item added", "मेनु आइटम थपियो"));
  };

  const handleDeleteMenuItem = (placeId: string, menuItemId: string) => {
    removeMenuItem(placeId, menuItemId);
    
    setPlaces(places.map(place => {
      if (place.id === placeId) {
        return {
          ...place,
          menu: place.menu.filter(item => item.id !== menuItemId)
        };
      }
      return place;
    }));
    
    toast.success(t("Menu item removed", "मेनु आइटम हटाइयो"));
  };

  const handleMenuScanned = (menuItems: { name: string; price: number }[]) => {
    if (!selectedPlaceId) return;
    
    let updatedItems = 0;
    
    menuItems.forEach(item => {
      const newMenuItem: MenuItem = {
        id: "",  // Will be generated in the storage function
        name: item.name.trim(),
        price: item.price
      };
      
      addMenuItem(selectedPlaceId, newMenuItem);
      updatedItems++;
    });
    
    setPlaces(places.map(place => {
      if (place.id === selectedPlaceId) {
        const newMenuItems = menuItems.map(item => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: item.name,
          price: item.price
        }));
        
        return {
          ...place,
          menu: [...place.menu, ...newMenuItems]
        };
      }
      return place;
    }));
    
    toast.success(`${t("Added", "थपियो")} ${updatedItems} ${t("menu items", "मेनु आइटमहरू")}`);
  };
  
  const handleAddParticipant = () => {
    if (!newParticipantName.trim()) return;
    
    // Create new participant
    const newParticipant: Participant = {
      id: generateId("friend-"),
      name: newParticipantName.trim()
    };
    
    // Save to friends list
    saveFriend(newParticipant);
    setFriends([...friends, newParticipant]);
    
    // Add to current selection
    setSelectedParticipants([...selectedParticipants, newParticipant]);
    setNewParticipantName("");
    setShowAddParticipantDialog(false);
    
    toast.success(t("Participant added", "सहभागी थपियो"));
  };
  
  const toggleParticipantSelection = (participant: Participant) => {
    if (selectedParticipants.some(p => p.id === participant.id)) {
      setSelectedParticipants(selectedParticipants.filter(p => p.id !== participant.id));
      
      // Remove contribution
      const updatedContributions = { ...participantContributions };
      delete updatedContributions[participant.id];
      setParticipantContributions(updatedContributions);
    } else {
      setSelectedParticipants([...selectedParticipants, participant]);
    }
  };
  
  const handleSelectGroup = (group: FriendGroup) => {
    // Add all group members to selected participants without duplicates
    const existingIds = new Set(selectedParticipants.map(p => p.id));
    const newParticipants = group.members.filter(member => !existingIds.has(member.id));
    setSelectedParticipants([...selectedParticipants, ...newParticipants]);
    setShowSelectGroupDialog(false);
    
    toast.success(`${t("Group", "समूह")} "${group.name}" ${t("members added", "सदस्यहरू थपियो")}`);
  };
  
  const handleContributionChange = (participantId: string, value: string) => {
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount >= 0) {
      setParticipantContributions({
        ...participantContributions,
        [participantId]: amount
      });
    }
  };
  
  const getTotalContributions = () => {
    return Object.values(participantContributions).reduce((sum, amount) => sum + amount, 0);
  };
  
  const getPlace = (placeId: string) => {
    return places.find(p => p.id === placeId);
  };
  
  const getParticipantBalanceForPlace = (placeId: string, participantId: string): number => {
    const place = getPlace(placeId);
    if (!place) return 0;
    const participant = place.participants?.find(p => p.id === participantId);
    return participant?.balance || 0;
  };
  
  const getTotalContributionsForPlace = (placeId: string): number => {
    const place = getPlace(placeId);
    if (!place || !place.participants) return 0;
    return place.participants.reduce((sum, p) => sum + (p.initialContribution || 0), 0);
  };
  
  const handleViewPlaceDetails = (placeId: string) => {
    navigate(`/place/${placeId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("Places & Trips", "स्थानहरू र यात्राहरू")}</h3>
        
        <Dialog open={showAddPlaceDialog} onOpenChange={setShowAddPlaceDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              {t("Add Place", "स्थान थप्नुहोस्")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("Add New Place or Trip", "नयाँ स्थान वा यात्रा थप्नुहोस्")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="place-name">{t("Place/Trip Name", "स्थान/यात्रा नाम")}</Label>
                <Input 
                  id="place-name" 
                  value={newPlaceName} 
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  placeholder={t("e.g., Pokhara Trip, Office Party", "जस्तै, पोखरा यात्रा, कार्यालय पार्टी")}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="start-date">{t("Start Date", "सुरु मिति")}</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">{t("End Date", "अन्त्य मिति")}</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>{t("Participants", "सहभागीहरू")}</Label>
                  <div className="space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowSelectGroupDialog(true)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      {t("Add Group", "समूह थप्नुहोस्")}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowAddParticipantDialog(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      {t("Add New", "नयाँ थप्नुहोस्")}
                    </Button>
                  </div>
                </div>
                {selectedParticipants.length > 0 ? (
                  <div className="border rounded-md divide-y">
                    {selectedParticipants.map(participant => (
                      <div key={participant.id} className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span>{participant.name}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleParticipantSelection(participant)}
                          >
                            {t("Remove", "हटाउनुहोस्")}
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`contribution-${participant.id}`} className="whitespace-nowrap text-xs">
                            {t("Initial Contribution:", "प्रारम्भिक योगदान:")}
                          </Label>
                          <Input
                            id={`contribution-${participant.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={participantContributions[participant.id] || ""}
                            onChange={(e) => handleContributionChange(participant.id, e.target.value)}
                            placeholder="0.00"
                            className="h-8"
                          />
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-3 bg-muted/20">
                      <div className="flex justify-between text-sm">
                        <span>{t("Total Contributions:", "कुल योगदानहरू:")}</span>
                        <span className="font-medium">{formatCurrency(getTotalContributions())}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 border rounded-md text-muted-foreground">
                    {t("Select participants for this place/trip", "यस स्थान/यात्राको लागि सहभागीहरू चयन गर्नुहोस्")}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {t("Cancel", "रद्द गर्नुहोस्")}
                </Button>
              </DialogClose>
              <Button 
                onClick={handleCreatePlace}
                disabled={!newPlaceName.trim() || selectedParticipants.length === 0}
              >
                {t("Create Place", "स्थान सिर्जना गर्नुहोस्")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add New Participant Dialog */}
        <Dialog open={showAddParticipantDialog} onOpenChange={setShowAddParticipantDialog}>
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
        
        {/* Select Group Dialog */}
        <Dialog open={showSelectGroupDialog} onOpenChange={setShowSelectGroupDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Select Group", "समूह चयन गर्नुहोस्")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {groups.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {groups.map(group => (
                    <div 
                      key={group.id} 
                      className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/30 cursor-pointer"
                      onClick={() => handleSelectGroup(group)}
                    >
                      <div>
                        <h4 className="font-medium">{group.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {group.members.length} {group.members.length === 1 ? t('member', 'सदस्य') : t('members', 'सदस्यहरू')}
                        </p>
                      </div>
                      <Button size="sm">
                        {t("Select", "चयन गर्नुहोस्")}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 border rounded-md text-muted-foreground">
                  {t("No groups available. Create a group first.", "कुनै समूहहरू उपलब्ध छैनन्। पहिले समूह सिर्जना गर्नुहोस्।")}
                </div>
              )}
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button">
                  {t("Close", "बन्द गर्नुहोस्")}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showAddMenuItemDialog} onOpenChange={setShowAddMenuItemDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Add Menu Item", "मेनु आइटम थप्नुहोस्")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="menu-item-name">{t("Item Name", "आइटम नाम")}</Label>
                <Input 
                  id="menu-item-name" 
                  value={newMenuItemName} 
                  onChange={(e) => setNewMenuItemName(e.target.value)}
                  placeholder={t("e.g., Pizza, Coffee", "जस्तै, पिज्जा, कफी")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="menu-item-price">{t("Price", "मूल्य")}</Label>
                <Input 
                  id="menu-item-price" 
                  type="number"
                  min="0"
                  step="0.01"
                  value={newMenuItemPrice} 
                  onChange={(e) => setNewMenuItemPrice(e.target.value)}
                  placeholder="0.00"
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
                onClick={handleAddMenuItem}
                disabled={!newMenuItemName.trim() || !newMenuItemPrice}
              >
                {t("Add Item", "आइटम थप्नुहोस्")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <MenuScanner
          isOpen={showMenuScanner}
          onClose={() => setShowMenuScanner(false)}
          onMenuProcessed={handleMenuScanned}
        />
      </div>

      <div className="space-y-2">
        {places.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("No places added yet", "अहिलेसम्म कुनै स्थान थपिएको छैन")}</p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {places.map(place => (
              <AccordionItem key={place.id} value={place.id}>
                <AccordionTrigger className="py-2">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span>{place.name}</span>
                    <div className="flex items-center gap-2">
                      {place.startDate && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(place.startDate).toLocaleDateString()}
                        </span>
                      )}
                      {place.participants && place.participants.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {place.participants.length} {place.participants.length === 1 ? t('participant', 'सहभागी') : t('participants', 'सहभागीहरू')}
                        </span>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-1 pb-3">
                    {/* Dates */}
                    {(place.startDate || place.endDate) && (
                      <div className="p-2 bg-muted/30 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm font-medium">
                              {place.startDate && place.endDate 
                                ? `${t("From", "देखि")} ${new Date(place.startDate).toLocaleDateString()} ${t("to", "सम्म")} ${new Date(place.endDate).toLocaleDateString()}`
                                : place.startDate 
                                  ? new Date(place.startDate).toLocaleDateString()
                                  : new Date(place.endDate!).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Participants and their contributions */}
                    {place.participants && place.participants.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{t("Participants", "सहभागीहरू")}</h4>
                        <div className="space-y-2">
                          {place.participants.map(participant => (
                            <div key={participant.id} className="p-2 border rounded-md">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">{participant.name}</span>
                                <span>
                                  {participant.initialContribution ? formatCurrency(participant.initialContribution) : formatCurrency(0)}
                                </span>
                              </div>
                              {participant.balance !== undefined && (
                                <div className="text-xs flex justify-between">
                                  <span className={participant.balance < 0 ? "text-destructive" : "text-green-600"}>
                                    {participant.balance < 0 
                                      ? t("Owes", "तिर्नु पर्ने") 
                                      : participant.balance > 0 
                                        ? t("Gets back", "फिर्ता पाउने") 
                                        : t("Settled", "मिलान भयो")}
                                  </span>
                                  <span className={participant.balance < 0 ? "text-destructive" : "text-green-600"}>
                                    {formatCurrency(Math.abs(participant.balance))}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          <div className="p-2 bg-muted/20 border rounded-md flex justify-between">
                            <span className="font-medium">{t("Total Contributions", "कुल योगदानहरू")}</span>
                            <span>{formatCurrency(getTotalContributionsForPlace(place.id))}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Menu Items */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">{t("Menu Items", "मेनु आइटमहरू")} ({place.menu.length})</h4>
                      {place.menu.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("No menu items added yet", "अहिलेसम्म कुनै मेनु आइटम थपिएको छैन")}</p>
                      ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto border rounded-md p-2">
                          {place.menu.map(item => (
                            <div 
                              key={item.id} 
                              className="flex items-center justify-between p-2 border rounded-md"
                            >
                              <div>
                                <span className="font-medium">{item.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">{formatCurrency(item.price)}</span>
                                {onSelectMenuItem && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => onSelectMenuItem(place, item)}
                                    className="mr-1"
                                  >
                                    {t("Select", "चयन गर्नुहोस्")}
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteMenuItem(place.id, item.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex space-x-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleOpenAddMenuDialog(place.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t("Add Item", "आइटम थप्नुहोस्")}
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedPlaceId(place.id);
                            setShowMenuScanner(true);
                          }}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          {t("Scan Menu", "मेनु स्क्यान गर्नुहोस्")}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPlaceDetails(place.id)}
                    >
                      {t("View Details", "विवरण हेर्नुहोस्")}
                    </Button>
                    
                    {onSelectPlace && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onSelectPlace(place)}
                      >
                        {t("Select Place", "स्थान चयन गर्नुहोस्")}
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeletePlace(place.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default PlaceManager;
