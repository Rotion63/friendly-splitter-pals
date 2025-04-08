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
  place?: string; // Adding place property explicitly
  placeId?: string; // ID of the place this bill belongs to
  day?: number; // Day of the trip this bill belongs to
  isRecurring?: boolean; // Flag for recurring expenses like utilities
  isDining?: boolean; // Flag for restaurant/dining bills
  isScheduled?: boolean; // Flag for scheduled splits
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly'; // For recurring bills
  nextDueDate?: string; // For recurring/scheduled bills
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
  participants?: Participant[]; // Participants in this place/trip
  startDate?: string; // Start date for trips
  endDate?: string; // End date for trips
  days?: PlaceDay[]; // Days in the trip
  bills?: string[]; // Bills associated with this place
}

export interface PlaceDay {
  id: string;
  date: string;
  bills: string[]; // Bill IDs
  notes?: string;
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
