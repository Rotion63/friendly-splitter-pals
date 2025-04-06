import { Bill, Participant } from "./types";
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

export const getBill = (id: string): Bill | undefined => {
  const bills = getBills();
  return bills.find(bill => bill.id === id);
};

export const deleteBill = (id: string) => {
  const bills = getBills();
  const updatedBills = bills.filter(bill => bill.id !== id);
  localStorage.setItem('bills', JSON.stringify(updatedBills));
  return updatedBills;
};

export const generateId = (): string => {
  return uuidv4();
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
