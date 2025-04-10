
import { Bill, Participant, BillItem } from "./types";
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all bills from localStorage
 */
export const getBills = (): Bill[] => {
  try {
    const billsString = localStorage.getItem('bills');
    return billsString ? JSON.parse(billsString) : [];
  } catch (error) {
    console.error("Error loading bills:", error);
    return [];
  }
};

/**
 * Save bill to localStorage with duplicate prevention
 */
export const saveBill = (bill: Bill): void => {
  try {
    if (!bill.id) {
      console.error("Attempted to save bill without ID");
      return;
    }
    
    const bills = getBills();
    // Check if this bill already exists
    const existingBillIndex = bills.findIndex(b => b.id === bill.id);
    
    if (existingBillIndex >= 0) {
      // Update existing bill instead of adding a new one
      bills[existingBillIndex] = bill;
    } else {
      // Add new bill
      bills.push(bill);
    }
    
    localStorage.setItem('bills', JSON.stringify(bills));
  } catch (error) {
    console.error("Error saving bill:", error);
  }
};

/**
 * Update existing bill in localStorage
 */
export const updateBill = (bill: Bill): void => {
  try {
    if (!bill.id) {
      console.error("Attempted to update bill without ID");
      return;
    }
    
    const bills = getBills();
    const updatedBills = bills.map(b => b.id === bill.id ? bill : b);
    localStorage.setItem('bills', JSON.stringify(updatedBills));
  } catch (error) {
    console.error("Error updating bill:", error);
  }
};

/**
 * Get a specific bill by ID
 */
export const getBillById = (id: string): Bill | undefined => {
  if (!id) return undefined;
  
  try {
    const bills = getBills();
    return bills.find(bill => bill.id === id);
  } catch (error) {
    console.error("Error getting bill by ID:", error);
    return undefined;
  }
};

/**
 * Delete a bill by ID
 */
export const deleteBill = (id: string): Bill[] => {
  try {
    const bills = getBills();
    const updatedBills = bills.filter(bill => bill.id !== id);
    localStorage.setItem('bills', JSON.stringify(updatedBills));
    return updatedBills;
  } catch (error) {
    console.error("Error deleting bill:", error);
    return getBills();
  }
};

// Function to remove bills with a different name to align with existing imports
export const removeBill = (id: string): Bill[] => {
  return deleteBill(id);
};

/**
 * Get bills by trip ID
 */
export const getBillsByTripId = (tripId: string): Bill[] => {
  if (!tripId) return [];
  
  try {
    const bills = getBills();
    return bills.filter(bill => bill.tripId === tripId);
  } catch (error) {
    console.error("Error getting bills by trip ID:", error);
    return [];
  }
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * Create an empty bill with unique ID
 */
export const createEmptyBill = (
  title: string, 
  participants: Participant[], 
  tripId?: string
): Bill => {
  const newBill: Bill = {
    id: generateId(),
    title: title.trim(),
    date: new Date().toISOString(),
    totalAmount: 0,
    participants: [...participants],
    items: [],
    place: "",
  };
  
  if (tripId) {
    newBill.tripId = tripId;
  }
  
  return newBill;
};

// Friends Storage
export const getFriends = (): Participant[] => {
  const friendsString = localStorage.getItem('friends');
  return friendsString ? JSON.parse(friendsString) : [];
};

export const saveFriend = (friend: Participant): void => {
  const friends = getFriends();
  // Check if friend already exists
  const existingFriendIndex = friends.findIndex(f => f.id === friend.id);
  
  if (existingFriendIndex >= 0) {
    // Update existing friend
    friends[existingFriendIndex] = friend;
    localStorage.setItem('friends', JSON.stringify(friends));
  } else {
    // Add new friend
    localStorage.setItem('friends', JSON.stringify([...friends, friend]));
  }
};

export const removeFriend = (id: string): void => {
  const friends = getFriends();
  const updatedFriends = friends.filter(friend => friend.id !== id);
  localStorage.setItem('friends', JSON.stringify(updatedFriends));
};
