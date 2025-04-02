
export interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

export interface BillItem {
  id: string;
  name: string;
  amount: number;
  participants: string[]; // Participant IDs
  rate?: number;
  quantity?: number;
  price?: number; // Added for backward compatibility
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
  paidBy?: string | Participant; // Modified to support both string and Participant
  partialPayments?: PartialPayment[]; // For multiple people paying
  discount?: number; // Discount amount (not percentage)
  tax?: number; // Added tax property
  tip?: number; // Added tip property
  settlements?: Settlement[]; // Track who has settled with whom
  isDummy?: boolean; // Flag to identify dummy bills
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
}

export interface FriendGroup {
  id: string;
  name: string;
  members: Participant[];
}
