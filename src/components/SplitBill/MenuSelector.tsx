
import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Place, MenuItem } from "@/lib/types";
import { getPlaces } from "@/lib/placesStorage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MenuSelectorProps {
  onMenuItemSelected: (item: MenuItem) => void;
}

const MenuSelector: React.FC<MenuSelectorProps> = ({ onMenuItemSelected }) => {
  const [open, setOpen] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  
  useEffect(() => {
    const loadedPlaces = getPlaces();
    setPlaces(loadedPlaces);
  }, []);
  
  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    setOpen(false);
  };
  
  const handleSelectMenuItem = (item: MenuItem) => {
    onMenuItemSelected(item);
    toast.success(`Added ${item.name} to bill`);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium">Select Restaurant</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between"
            >
              {selectedPlace ? selectedPlace.name : "Select restaurant..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandInput placeholder="Search restaurants..." />
              <CommandList>
                <CommandEmpty>No restaurants found.</CommandEmpty>
                <CommandGroup>
                  {places.map((place) => (
                    <CommandItem
                      key={place.id}
                      value={place.name}
                      onSelect={() => handleSelectPlace(place)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedPlace?.id === place.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {place.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      {selectedPlace && (
        <div className="border rounded-md p-4">
          <h3 className="font-medium text-sm mb-2 flex items-center">
            <Receipt className="h-4 w-4 mr-1" />
            Menu Items
          </h3>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {selectedPlace.menu.map((item) => (
              <Button
                key={item.id}
                variant="outline"
                className="justify-between"
                onClick={() => handleSelectMenuItem(item)}
              >
                <span>{item.name}</span>
                <span className="text-muted-foreground">
                  ${item.price.toFixed(2)}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuSelector;
