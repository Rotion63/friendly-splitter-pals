
import { Bill } from "./types";
import { generateId } from "./utils";
import { addBillToTrip } from "./tripStorage";

const BILLS_STORAGE_KEY = "splitBills";

// Get all bills from storage
export const getBills = (): Bill[] => {
  const storedBills = localStorage.getItem(BILLS_STORAGE_KEY);
  return storedBills ? JSON.parse(storedBills) : [];
};

// Get bills for a specific trip
export const getBillsByTripId = (tripId: string): Bill[] => {
  return getBills().filter(bill => bill.tripId === tripId);
};

// Get a specific bill by ID
export const getBillById = (id: string): Bill | null => {
  const bills = getBills();
  return bills.find(bill => bill.id === id) || null;
};

// Save a bill (creates new or updates existing)
export const saveBill = (bill: Bill): void => {
  const bills = getBills();
  const existingBillIndex = bills.findIndex(b => b.id === bill.id);
  
  if (existingBillIndex >= 0) {
    // Preserve existing partial payments if not provided in the new bill
    if (!bill.partialPayments && bills[existingBillIndex].partialPayments) {
      bill.partialPayments = bills[existingBillIndex].partialPayments;
    }
    
    // Preserve existing settlements if not provided in the new bill
    if (!bill.settlements && bills[existingBillIndex].settlements) {
      bill.settlements = bills[existingBillIndex].settlements;
    }
    
    // Update the bill
    bills[existingBillIndex] = bill;
  } else {
    bills.push(bill);
    
    // If the bill is associated with a trip, update the trip as well
    if (bill.tripId) {
      addBillToTrip(bill.tripId, bill.id);
    }
  }
  
  localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(bills));
};

// Remove a bill by ID
export const removeBill = (id: string): void => {
  const bills = getBills().filter(bill => bill.id !== id);
  localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(bills));
};

// Create an empty bill with just the title and participants
export const createEmptyBill = (
  title: string, 
  participants: Bill["participants"], 
  tripId?: string
): Bill => {
  return {
    id: generateId("bill-"),
    title: title.trim(),
    date: new Date().toISOString(),
    totalAmount: 0,
    participants,
    items: [],
    paidBy: participants[0]?.id || "",
    tripId, // Associate with a trip if provided
  };
};
