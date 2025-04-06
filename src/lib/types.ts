
export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  balance?: number; // Track each participant's balance
  initialContribution?: number; // Track each participant's initial contribution
}

export interface BillItem {
  id: string;
  name: string;
  amount: number;
  participants: string[]; // Participant IDs
  rate?: number;
  quantity?: number;
}

export interface PartialPayment {
  payerId: string;
  amount: number;
}

export interface Settlement {
  payerId: string;
  receiverId: string;
  amount: number;
  settled?: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface Bill {
  id: string;
  title: string;
  date: string;
  totalAmount: number;
  participants: Participant[];
  items: BillItem[];
  paidBy?: string; // Participant ID
  partialPayments?: PartialPayment[]; // For multiple people paying
  discount?: number; // Discount amount (not percentage)
  settlements?: Settlement[]; // Track who has settled with whom
  isDummy?: boolean; // Flag to identify dummy bills
  tripId?: string; // Link to a trip if applicable
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export interface Place {
  id: string;
  name: string;
  menu: MenuItem[];
  initialContribution?: number; // Amount collected for group expenses
}

export interface FriendGroup {
  id: string;
  name: string;
  members: Participant[];
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  participants: Participant[];
  bills: string[]; // Array of bill IDs associated with this trip
}
