
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Bill, Participant, PartialPayment } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateSplits(bill: Bill): Record<string, number> {
  const result: Record<string, number> = {};
  
  // Initialize all participants with 0
  bill.participants.forEach(p => {
    result[p.id] = 0;
  });
  
  // Apply discount if any
  const discountAmount = bill.discount || 0;
  const effectiveTotalAmount = bill.totalAmount - discountAmount;
  
  // Calculate what each person owes for their items
  bill.items.forEach(item => {
    if (item.participants.length > 0) {
      // If there's a discount, we need to proportionally reduce each item
      const discountFactor = effectiveTotalAmount / bill.totalAmount;
      const adjustedAmount = item.amount * discountFactor;
      const perPersonAmount = adjustedAmount / item.participants.length;
      
      item.participants.forEach(pId => {
        result[pId] = (result[pId] || 0) - perPersonAmount; // Negative means they owe this amount
      });
    }
  });
  
  // Handle partial payments if any
  if (bill.partialPayments && bill.partialPayments.length > 0) {
    bill.partialPayments.forEach(payment => {
      result[payment.payerId] = (result[payment.payerId] || 0) + payment.amount;
    });
  } 
  // If there's a single payer for the remainder
  else if (bill.paidBy) {
    result[bill.paidBy] = (result[bill.paidBy] || 0) + effectiveTotalAmount;
  }
  
  return result;
}

// Sample data for demonstration
export const sampleParticipants: Participant[] = [
  { id: 'p1', name: 'Alex' },
  { id: 'p2', name: 'Jordan' },
  { id: 'p3', name: 'Taylor' },
  { id: 'p4', name: 'Casey' },
];

export const sampleBills: Bill[] = [
  {
    id: 'bill1',
    title: 'Dinner at Olive Garden',
    date: '2023-10-15',
    totalAmount: 126.80,
    participants: sampleParticipants,
    items: [
      { 
        id: 'item1', 
        name: 'Pasta', 
        amount: 15.99, 
        participants: ['p1', 'p3'] 
      },
      { 
        id: 'item2', 
        name: 'Pizza', 
        amount: 18.99, 
        participants: ['p2', 'p4'] 
      },
      { 
        id: 'item3', 
        name: 'Salad', 
        amount: 12.99, 
        participants: ['p1', 'p2', 'p3', 'p4'] 
      },
      { 
        id: 'item4', 
        name: 'Wine', 
        amount: 28.99, 
        participants: ['p1', 'p2', 'p3', 'p4'] 
      },
      { 
        id: 'item5', 
        name: 'Dessert', 
        amount: 49.84, 
        participants: ['p1', 'p2', 'p3', 'p4'] 
      },
    ],
    paidBy: 'p1',
  },
  {
    id: 'bill2',
    title: 'Groceries',
    date: '2023-10-10',
    totalAmount: 84.50,
    participants: sampleParticipants.slice(0, 3),
    items: [
      { 
        id: 'item1', 
        name: 'Milk and Eggs', 
        amount: 12.80, 
        participants: ['p1', 'p2', 'p3'] 
      },
      { 
        id: 'item2', 
        name: 'Bread', 
        amount: 4.50, 
        participants: ['p1', 'p2', 'p3'] 
      },
      { 
        id: 'item3', 
        name: 'Vegetables', 
        amount: 15.30, 
        participants: ['p1', 'p3'] 
      },
      { 
        id: 'item4', 
        name: 'Cheese', 
        amount: 8.99, 
        participants: ['p2', 'p3'] 
      },
      { 
        id: 'item5', 
        name: 'Meat', 
        amount: 42.91, 
        participants: ['p1', 'p2', 'p3'] 
      },
    ],
    paidBy: 'p2',
  },
];
