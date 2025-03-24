
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
