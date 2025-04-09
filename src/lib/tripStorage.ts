
import { Trip } from "./types";
import { generateId } from "./utils";

const TRIPS_STORAGE_KEY = "splitTrips";

// Get all trips from storage
export const getTrips = (): Trip[] => {
  const storedTrips = localStorage.getItem(TRIPS_STORAGE_KEY);
  return storedTrips ? JSON.parse(storedTrips) : [];
};

// Get a specific trip by ID
export const getTripById = (id: string): Trip | null => {
  const trips = getTrips();
  return trips.find(trip => trip.id === id) || null;
};

// Save a trip (creates new or updates existing)
export const saveTrip = (trip: Trip): void => {
  const trips = getTrips();
  const existingTripIndex = trips.findIndex(t => t.id === trip.id);
  
  if (existingTripIndex >= 0) {
    trips[existingTripIndex] = trip;
  } else {
    trips.push(trip);
  }
  
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
};

// Remove a trip by ID
export const removeTrip = (id: string): void => {
  const trips = getTrips().filter(trip => trip.id !== id);
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
};

// Add a bill to a trip
export const addBillToTrip = (tripId: string, billId: string): void => {
  const trips = getTrips();
  const tripIndex = trips.findIndex(trip => trip.id === tripId);
  
  if (tripIndex >= 0) {
    const trip = trips[tripIndex];
    if (!trip.bills.includes(billId)) {
      trip.bills.push(billId);
      trips[tripIndex] = trip;
      localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
    }
  }
};

// Remove a bill from a trip
export const removeBillFromTrip = (tripId: string, billId: string): void => {
  const trips = getTrips();
  const tripIndex = trips.findIndex(trip => trip.id === tripId);
  
  if (tripIndex >= 0) {
    const trip = trips[tripIndex];
    trip.bills = trip.bills.filter(id => id !== billId);
    trips[tripIndex] = trip;
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
  }
};

// Create an empty trip
export const createEmptyTrip = (name: string, participants: Trip["participants"]): Trip => {
  return {
    id: generateId("trip-"),
    name: name.trim(),
    participants: participants || [],
    bills: [],
  };
};
