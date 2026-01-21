import { Place, MenuItem, Participant, PlaceDay } from "./types";
import { generateId } from "./utils";
import { safeParsePlaces } from "./storageSchemas";

const PLACES_STORAGE_KEY = "splitBillPlaces";

// Get all places from storage with schema validation
export const getPlaces = (): Place[] => {
  try {
    const storedPlaces = localStorage.getItem(PLACES_STORAGE_KEY);
    if (!storedPlaces) return [];
    const parsed = JSON.parse(storedPlaces);
    return safeParsePlaces(parsed, 'places');
  } catch (error) {
    console.error("Error loading places:", error);
    return [];
  }
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
    // Initialize additional properties if not already set
    place.days = place.days || [];
    place.bills = place.bills || [];
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
    participants: [],
    bills: [],
    days: []
  };
};

// Add participant to a place
export const addParticipantToPlace = (
  placeId: string, 
  participant: Participant,
  initialContribution: number = 0
): void => {
  const place = getPlaceById(placeId);
  if (!place) return;
  
  // Make sure participants array exists
  place.participants = place.participants || [];
  
  // Check if participant already exists
  const existingIndex = place.participants.findIndex(p => p.id === participant.id);
  
  if (existingIndex >= 0) {
    // Update existing participant
    place.participants[existingIndex] = {
      ...place.participants[existingIndex],
      initialContribution
    };
  } else {
    // Add new participant with contribution
    place.participants.push({
      ...participant,
      initialContribution,
      balance: 0
    });
  }
  
  savePlace(place);
};

// Update participant balance
export const updateParticipantBalance = (
  placeId: string,
  participantId: string,
  balance: number
): void => {
  const place = getPlaceById(placeId);
  if (!place || !place.participants) return;
  
  const index = place.participants.findIndex(p => p.id === participantId);
  if (index >= 0) {
    place.participants[index].balance = balance;
    savePlace(place);
  }
};

// Add a bill to a place
export const addBillToPlace = (placeId: string, billId: string, day?: number): void => {
  const place = getPlaceById(placeId);
  if (!place) return;
  
  // Make sure bills array exists
  place.bills = place.bills || [];
  
  // Add bill if it doesn't already exist
  if (!place.bills.includes(billId)) {
    place.bills.push(billId);
  }
  
  // If a day is specified, add to that day
  if (day !== undefined && place.days) {
    // Find the day or create it if it doesn't exist
    let dayObject = place.days.find(d => parseInt(d.id.split('-').pop() || '0') === day);
    
    if (!dayObject) {
      // Create the day
      dayObject = {
        id: `day-${placeId}-${day}`,
        date: new Date().toISOString().split('T')[0], // Today's date
        bills: []
      };
      place.days.push(dayObject);
    }
    
    // Add bill to the day if it doesn't exist already
    if (!dayObject.bills.includes(billId)) {
      dayObject.bills.push(billId);
    }
  }
  
  savePlace(place);
};

// Create a new day in a place
export const createDayInPlace = (
  placeId: string,
  date: string,
  notes?: string
): PlaceDay | null => {
  const place = getPlaceById(placeId);
  if (!place) return null;
  
  // Make sure days array exists
  place.days = place.days || [];
  
  // Create new day
  const dayNumber = place.days.length + 1;
  const newDay: PlaceDay = {
    id: `day-${placeId}-${dayNumber}`,
    date,
    bills: [],
    notes
  };
  
  place.days.push(newDay);
  savePlace(place);
  
  return newDay;
};

// Get bills for a specific day
export const getBillsForDay = (placeId: string, dayId: string): string[] => {
  const place = getPlaceById(placeId);
  if (!place || !place.days) return [];
  
  const day = place.days.find(d => d.id === dayId);
  return day ? day.bills : [];
};

// Calculate place totals
export const calculatePlaceTotals = (place: Place): {
  totalContributions: number;
  totalSpent: number;
  balance: number;
} => {
  if (!place || !place.participants) {
    return { totalContributions: 0, totalSpent: 0, balance: 0 };
  }
  
  const totalContributions = place.participants.reduce(
    (sum, p) => sum + (p.initialContribution || 0), 
    0
  );
  
  // Would need to integrate with billStorage to calculate total spent
  // This is a placeholder
  const totalSpent = 0;
  
  return {
    totalContributions,
    totalSpent,
    balance: totalContributions - totalSpent
  };
};
