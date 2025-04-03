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
import { Place, MenuItem } from "@/lib/types";
import { 
  getPlaces, 
  savePlace, 
  removePlace, 
  createEmptyPlace,
  addMenuItem,
  removeMenuItem
} from "@/lib/placesStorage";
import { Trash2, Plus, MapPin, Camera, Upload, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import MenuScanner from "@/components/SplitBill/MenuScanner";

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

  useEffect(() => {
    setPlaces(getPlaces());
  }, []);

  const handleCreatePlace = () => {
    if (!newPlaceName.trim()) {
      toast.error("Please enter a place name");
      return;
    }

    const newPlace = createEmptyPlace(newPlaceName);
    
    if (initialContribution && !isNaN(parseFloat(initialContribution)) && parseFloat(initialContribution) > 0) {
      newPlace.initialContribution = parseFloat(initialContribution);
    }
    
    savePlace(newPlace);
    setPlaces([...places, newPlace]);
    
    setNewPlaceName("");
    setInitialContribution("");
    setShowAddPlaceDialog(false);
    
    toast.success(`${newPlaceName} place created`);
  };

  const handleDeletePlace = (placeId: string) => {
    removePlace(placeId);
    setPlaces(places.filter(p => p.id !== placeId));
    toast.success("Place deleted");
  };

  const handleEditPlace = (place: Place) => {
    setEditingPlaceId(place.id);
    setNewPlaceName(place.name);
  };

  const handleOpenAddMenuDialog = (placeId: string) => {
    setSelectedPlaceId(placeId);
    setNewMenuItemName("");
    setNewMenuItemPrice("");
    setShowAddMenuItemDialog(true);
  };

  const handleAddMenuItem = () => {
    if (!selectedPlaceId || !newMenuItemName.trim() || !newMenuItemPrice) {
      toast.error("Please fill all fields");
      return;
    }

    const price = parseFloat(newMenuItemPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
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
    
    toast.success("Menu item added");
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
    
    toast.success("Menu item removed");
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
    
    toast.success(`Added ${updatedItems} menu items`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Places & Menus</h3>
        
        <Dialog open={showAddPlaceDialog} onOpenChange={setShowAddPlaceDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Add Place
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Place</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="place-name">Place Name</Label>
                <Input 
                  id="place-name" 
                  value={newPlaceName} 
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  placeholder="e.g., Campus Cafeteria, Office Canteen"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initial-contribution">Initial Contribution (Optional)</Label>
                <Input 
                  id="initial-contribution" 
                  type="number"
                  min="0"
                  step="0.01"
                  value={initialContribution} 
                  onChange={(e) => setInitialContribution(e.target.value)}
                  placeholder="Amount collected for group expenses"
                />
                <p className="text-xs text-muted-foreground">
                  Money collected upfront to pay for group expenses
                </p>
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                onClick={handleCreatePlace}
                disabled={!newPlaceName.trim()}
              >
                Create Place
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showAddMenuItemDialog} onOpenChange={setShowAddMenuItemDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Menu Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="menu-item-name">Item Name</Label>
                <Input 
                  id="menu-item-name" 
                  value={newMenuItemName} 
                  onChange={(e) => setNewMenuItemName(e.target.value)}
                  placeholder="e.g., Pizza, Coffee"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="menu-item-price">Price</Label>
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
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                onClick={handleAddMenuItem}
                disabled={!newMenuItemName.trim() || !newMenuItemPrice}
              >
                Add Item
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
          <p className="text-sm text-muted-foreground">No places added yet</p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {places.map(place => (
              <AccordionItem key={place.id} value={place.id}>
                <AccordionTrigger className="py-2">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span>{place.name}</span>
                    <div className="flex items-center gap-2">
                      {place.initialContribution > 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          ${place.initialContribution.toFixed(2)}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {place.menu.length} {place.menu.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-1 pb-3">
                    {place.initialContribution > 0 && (
                      <div className="p-2 bg-primary/5 border border-primary/10 rounded-md mb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FolderPlus className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm font-medium">Initial Contribution</span>
                          </div>
                          <span className="font-medium">${place.initialContribution.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    
                    {place.menu.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No menu items added yet</p>
                    ) : (
                      <div className="space-y-2">
                        {place.menu.map(item => (
                          <div 
                            key={item.id} 
                            className="flex items-center justify-between p-2 border rounded-md"
                          >
                            <div className="flex-1">
                              <span className="font-medium">{item.name}</span>
                              <span className="ml-2">${item.price.toFixed(2)}</span>
                            </div>
                            <div className="flex space-x-2">
                              {onSelectMenuItem && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => onSelectMenuItem(place, item)}
                                >
                                  Select
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
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleOpenAddMenuDialog(place.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
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
                        Scan Menu
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t">
                    {onSelectPlace && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onSelectPlace(place)}
                      >
                        Select Place
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
