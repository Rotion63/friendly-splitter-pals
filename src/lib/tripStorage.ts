
import { Trip } from "./types";
import { generateId } from "./utils";

const TRIPS_STORAGE_KEY = "splitTrips";

// Get all trips from storage
export const getTrips = (): Trip[] => {
  try {
    const storedTrips = localStorage.getItem(TRIPS_STORAGE_KEY);
    return storedTrips ? JSON.parse(storedTrips) : [];
  } catch (error) {
    console.error("Error getting trips:", error);
    return [];
  }
};

// Get a specific trip by ID
export const getTripById = (id: string): Trip | null => {
  try {
    console.log("Getting trip by ID:", id);
    const trips = getTrips();
    const trip = trips.find(trip => trip.id === id);
    console.log("Found trip:", trip);
    return trip || null;
  } catch (error) {
    console.error("Error getting trip by ID:", error);
    return null;
  }
};

// Save a trip (creates new or updates existing)
export const saveTrip = (trip: Trip): void => {
  try {
    console.log("Saving trip:", trip);
    const trips = getTrips();
    const existingTripIndex = trips.findIndex(t => t.id === trip.id);
    
    if (existingTripIndex >= 0) {
      trips[existingTripIndex] = trip;
    } else {
      trips.push(trip);
    }
    
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
    console.log("Trip saved successfully");
  } catch (error) {
    console.error("Error saving trip:", error);
  }
};

// Remove a trip by ID
export const removeTrip = (id: string): void => {
  try {
    const trips = getTrips().filter(trip => trip.id !== id);
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
  } catch (error) {
    console.error("Error removing trip:", error);
  }
};

// Add a bill to a trip
export const addBillToTrip = (tripId: string, billId: string): void => {
  try {
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
  } catch (error) {
    console.error("Error adding bill to trip:", error);
  }
};

// Remove a bill from a trip
export const removeBillFromTrip = (tripId: string, billId: string): void => {
  try {
    const trips = getTrips();
    const tripIndex = trips.findIndex(trip => trip.id === tripId);
    
    if (tripIndex >= 0) {
      const trip = trips[tripIndex];
      trip.bills = trip.bills.filter(id => id !== billId);
      trips[tripIndex] = trip;
      localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
    }
  } catch (error) {
    console.error("Error removing bill from trip:", error);
  }
};

// Create an empty trip
export const createEmptyTrip = (name: string, participants: Trip["participants"]): Trip => {
  console.log("Creating empty trip:", name, participants);
  return {
    id: generateId("trip-"),
    name: name.trim(),
    participants: participants || [],
    bills: [],
  };
};
