
import { Place, MenuItem } from "./types";
import { generateId } from "./utils";

const PLACES_STORAGE_KEY = "splitBillPlaces";

// Get all places from storage
export const getPlaces = (): Place[] => {
  const storedPlaces = localStorage.getItem(PLACES_STORAGE_KEY);
  return storedPlaces ? JSON.parse(storedPlaces) : [];
};

// Get a specific place by ID
export const getPlaceById = (id: string): Place | null => {
  const places = getPlaces();
  return places.find(place => place.id === id) || null;
};

// Save a place (creates new or updates existing)
export const savePlace = (place: Place): void => {
  const places = getPlaces();
  const existingPlaceIndex = places.findIndex(p => p.id === place.id);
  
  if (existingPlaceIndex >= 0) {
    places[existingPlaceIndex] = place;
  } else {
    // If it's a new place without an ID, generate one
    if (!place.id) {
      place.id = generateId("place-");
    }
    places.push(place);
  }
  
  localStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(places));
};

// Remove a place by ID
export const removePlace = (id: string): void => {
  const places = getPlaces().filter(place => place.id !== id);
  localStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(places));
};

// Add new menu item to a place
export const addMenuItem = (placeId: string, menuItem: MenuItem): void => {
  const place = getPlaceById(placeId);
  if (!place) return;

  // If menu item doesn't have ID, generate one
  if (!menuItem.id) {
    menuItem.id = generateId("item-");
  }
  
  place.menu.push(menuItem);
  savePlace(place);
};

// Remove menu item from a place
export const removeMenuItem = (placeId: string, menuItemId: string): void => {
  const place = getPlaceById(placeId);
  if (!place) return;
  
  place.menu = place.menu.filter(item => item.id !== menuItemId);
  savePlace(place);
};

// Create an empty place with just the name
export const createEmptyPlace = (name: string): Place => {
  return {
    id: generateId("place-"),
    name: name.trim(),
    menu: [],
  };
};
