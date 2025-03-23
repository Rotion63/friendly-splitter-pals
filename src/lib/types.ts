
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

export interface Bill {
  id: string;
  title: string;
  date: string;
  totalAmount: number;
  participants: Participant[];
  items: BillItem[];
  paidBy?: string; // Participant ID
  isDummy?: boolean; // Flag to identify dummy bills
}
