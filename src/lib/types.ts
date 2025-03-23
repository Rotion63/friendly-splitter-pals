
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
}

export interface PartialPayment {
  payerId: string;
  amount: number;
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
  isDummy?: boolean; // Flag to identify dummy bills
}
