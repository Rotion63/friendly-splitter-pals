
import { Bill, Participant, BillItem } from "./types";
import { v4 as uuidv4 } from 'uuid';

export const getBills = (): Bill[] => {
  const billsString = localStorage.getItem('bills');
  return billsString ? JSON.parse(billsString) : [];
};

export const saveBill = (bill: Bill): void => {
  const bills = getBills();
  localStorage.setItem('bills', JSON.stringify([...bills, bill]));
};

export const updateBill = (bill: Bill): void => {
  const bills = getBills();
  const updatedBills = bills.map(b => b.id === bill.id ? bill : b);
  localStorage.setItem('bills', JSON.stringify(updatedBills));
};

export const getBillById = (id: string): Bill | undefined => {
  const bills = getBills();
  return bills.find(bill => bill.id === id);
};

export const deleteBill = (id: string) => {
  const bills = getBills();
  const updatedBills = bills.filter(bill => bill.id !== id);
  localStorage.setItem('bills', JSON.stringify(updatedBills));
  return updatedBills;
};

// Function to remove bills with a different name to align with existing imports
export const removeBill = (id: string) => {
  return deleteBill(id);
};

// Function to get bills by trip ID
export const getBillsByTripId = (tripId: string): Bill[] => {
  const bills = getBills();
  return bills.filter(bill => bill.tripId === tripId);
};

export const generateId = (): string => {
  return uuidv4();
};

// Function to create an empty bill
export const createEmptyBill = (
  title: string, 
  participants: Participant[], 
  tripId?: string
): Bill => {
  return {
    id: generateId(),
    title,
    date: new Date().toISOString(),
    totalAmount: 0,
    participants: [...participants],
    items: [],
    tripId,
  };
};

// Friends Storage
export const getFriends = (): Participant[] => {
  const friendsString = localStorage.getItem('friends');
  return friendsString ? JSON.parse(friendsString) : [];
};

export const saveFriend = (friend: Participant): void => {
  const friends = getFriends();
  localStorage.setItem('friends', JSON.stringify([...friends, friend]));
};

export const removeFriend = (id: string): void => {
  const friends = getFriends();
  const updatedFriends = friends.filter(friend => friend.id !== id);
  localStorage.setItem('friends', JSON.stringify(updatedFriends));
};
