
import { Bill } from "./types";
import { generateId } from "./utils";

const BILLS_STORAGE_KEY = "splitBills";

// Get all bills from storage
export const getBills = (): Bill[] => {
  const storedBills = localStorage.getItem(BILLS_STORAGE_KEY);
  return storedBills ? JSON.parse(storedBills) : [];
};

// Get a specific bill by ID
export const getBillById = (id: string): Bill | null => {
  const bills = getBills();
  return bills.find(bill => bill.id === id) || null;
};

// Added getBill function as an alias for getBillById for backward compatibility
export const getBill = (id: string): Bill | null => {
  return getBillById(id);
};

// Save a bill (creates new or updates existing)
export const saveBill = (bill: Bill): void => {
  const bills = getBills();
  const existingBillIndex = bills.findIndex(b => b.id === bill.id);
  
  if (existingBillIndex >= 0) {
    bills[existingBillIndex] = bill;
  } else {
    bills.push(bill);
  }
  
  localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(bills));
};

// Added updateBill function as an alias for saveBill for better semantics
export const updateBill = (bill: Bill): void => {
  saveBill(bill);
};

// Remove a bill by ID
export const removeBill = (id: string): void => {
  const bills = getBills().filter(bill => bill.id !== id);
  localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(bills));
};

// Create an empty bill with just the title and participants
export const createEmptyBill = (title: string, participants: Bill["participants"]): Bill => {
  return {
    id: generateId("bill-"),
    title: title.trim(),
    date: new Date().toISOString(),
    totalAmount: 0,
    participants,
    items: [],
    paidBy: participants[0]?.id || "",
  };
};
