import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Bill, Participant, PartialPayment, Currency, Trip } from "./types";
import { safeParseCurrency } from "./storageSchemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Default currency is Nepali Rupees
let activeCurrency: Currency = {
  code: 'NPR',
  symbol: 'Rs.',
  name: 'Nepali Rupee'
};

// Simplified currency list with only three options
export const currencies: Currency[] = [
  { code: 'NPR', symbol: 'Rs.', name: 'Nepali Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];

export function setActiveCurrency(currency: Currency) {
  activeCurrency = currency;
  // Store in localStorage for persistence
  localStorage.setItem('active-currency', JSON.stringify(currency));
}

export function getActiveCurrency(): Currency {
  // Try to load from localStorage with schema validation
  const savedCurrency = localStorage.getItem('active-currency');
  if (savedCurrency) {
    try {
      const parsed = JSON.parse(savedCurrency);
      const validatedCurrency = safeParseCurrency(parsed, 'currency');
      if (validatedCurrency) {
        // Ensure it's one of our three currencies
        const foundCurrency = currencies.find(c => c.code === validatedCurrency.code);
        if (foundCurrency) {
          activeCurrency = foundCurrency;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved currency', e);
    }
  }
  return activeCurrency;
}

// Add formatAmount function that BillCard is trying to use
export function formatAmount(amount: number, currency?: Currency): string {
  const currencyToUse = currency || getActiveCurrency();
  return `${currencyToUse.symbol} ${amount.toFixed(2)}`;
}

// Keep the existing formatCurrency for backward compatibility
export function formatCurrency(amount: number): string {
  const currency = getActiveCurrency();
  return `${currency.symbol} ${amount.toFixed(2)}`;
}

export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Fix the calculateSplits function to properly handle the bill calculation
export function calculateSplits(bill: Bill): Record<string, number> {
  const result: Record<string, number> = {};
  
  // Initialize all participants with 0
  bill.participants.forEach(p => {
    result[p.id] = 0;
  });
  
  // Apply discount if any
  const discountAmount = bill.discount || 0;
  const finalTotal = bill.totalAmount - discountAmount;
  
  // Calculate what each person owes for their items
  bill.items.forEach(item => {
    if (item.participants.length > 0) {
      const perPersonAmount = item.amount / item.participants.length;
      
      item.participants.forEach(pId => {
        // Negative means they owe this amount
        result[pId] = (result[pId] || 0) - perPersonAmount; 
      });
    }
  });
  
  // Handle partial payments if any
  if (bill.partialPayments && bill.partialPayments.length > 0) {
    bill.partialPayments.forEach(payment => {
      if (payment && payment.payerId) {
        result[payment.payerId] = (result[payment.payerId] || 0) + payment.amount;
      }
    });
    
    // If there's a remaining amount and a paidBy person
    const totalPaid = bill.partialPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingAmount = finalTotal - totalPaid;
    
    if (remainingAmount > 0 && bill.paidBy) {
      result[bill.paidBy] = (result[bill.paidBy] || 0) + remainingAmount;
    }
  } 
  // If there's a single payer for the remainder
  else if (bill.paidBy) {
    // Add the total amount (minus discount) to the payer
    result[bill.paidBy] = (result[bill.paidBy] || 0) + finalTotal;
  }
  
  return result;
}

// Function to calculate total participant balance based on initial contribution and bill splits
export function calculateParticipantBalances(trip: Trip, bills: Bill[]): Participant[] {
  const participantBalances = [...trip.participants].map(p => ({
    ...p,
    // Start with their initial contribution (or 0 if undefined)
    balance: p.initialContribution || 0
  }));

  // For each bill in the trip, calculate how it affects balances
  bills.forEach(bill => {
    const billSplits = calculateSplits(bill);
    
    // Apply the bill splits to each participant's balance
    Object.entries(billSplits).forEach(([participantId, amount]) => {
      const participantIndex = participantBalances.findIndex(p => p.id === participantId);
      if (participantIndex >= 0) {
        // Add the amount to their balance (negative means they owe, positive means they paid)
        participantBalances[participantIndex].balance += amount;
      }
    });
  });

  return participantBalances;
}

// This function will calculate optimized settlements
export function calculateOptimizedSettlements(bill: Bill) {
  const splits = calculateSplits(bill);
  const settlements = [];
  
  // Find main collector (person who paid the most)
  let mainCollector = '';
  let maxPaid = 0;
  
  if (bill.partialPayments && bill.partialPayments.length > 0) {
    bill.partialPayments.forEach(payment => {
      if (payment.amount > maxPaid) {
        maxPaid = payment.amount;
        mainCollector = payment.payerId;
      }
    });
  } 
  
  if (!mainCollector && bill.paidBy) {
    mainCollector = bill.paidBy;
  }
  
  if (!mainCollector) return [];
  
  // First phase: Everyone who owes money pays to the main collector
  for (const [participantId, amount] of Object.entries(splits)) {
    // Skip the main collector
    if (participantId === mainCollector) continue;
    
    // If this person owes money (negative amount)
    if (amount < 0 && participantId !== mainCollector) {
      settlements.push({
        payerId: participantId,
        receiverId: mainCollector,
        amount: Math.abs(amount),
        settled: false
      });
    }
  }
  
  // Second phase: Main collector pays to others who are owed money
  for (const [participantId, amount] of Object.entries(splits)) {
    // Skip the main collector
    if (participantId === mainCollector) continue;
    
    // If this person should receive money (positive amount)
    if (amount > 0 && participantId !== mainCollector) {
      settlements.push({
        payerId: mainCollector,
        receiverId: participantId,
        amount: amount,
        settled: false
      });
    }
  }
  
  return settlements;
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
