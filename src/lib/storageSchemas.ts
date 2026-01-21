import { z } from 'zod';
import type { 
  Participant, 
  BillItem, 
  PartialPayment, 
  Settlement, 
  Bill, 
  MenuItem, 
  PlaceDay, 
  Place, 
  FriendGroup, 
  Trip, 
  Currency 
} from './types';

// Participant Schema
export const ParticipantSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  balance: z.number().optional(),
  initialContribution: z.number().optional(),
});

// BillItem Schema
export const BillItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  participants: z.array(z.string()),
  rate: z.number().optional(),
  quantity: z.number().optional(),
});

// PartialPayment Schema
export const PartialPaymentSchema = z.object({
  payerId: z.string(),
  amount: z.number(),
});

// Settlement Schema
export const SettlementSchema = z.object({
  payerId: z.string(),
  receiverId: z.string(),
  amount: z.number(),
  settled: z.boolean().optional(),
});

// Bill Schema
export const BillSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  totalAmount: z.number(),
  participants: z.array(ParticipantSchema),
  items: z.array(BillItemSchema),
  paidBy: z.string().optional(),
  partialPayments: z.array(PartialPaymentSchema).optional(),
  discount: z.number().optional(),
  settlements: z.array(SettlementSchema).optional(),
  isDummy: z.boolean().optional(),
  tripId: z.string().optional(),
  place: z.string().optional(),
  placeId: z.string().optional(),
  day: z.number().optional(),
});

// MenuItem Schema
export const MenuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
});

// PlaceDay Schema
export const PlaceDaySchema = z.object({
  id: z.string(),
  date: z.string(),
  bills: z.array(z.string()),
  notes: z.string().optional(),
});

// Place Schema
export const PlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  menu: z.array(MenuItemSchema),
  initialContribution: z.number().optional(),
  participants: z.array(ParticipantSchema).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  days: z.array(PlaceDaySchema).optional(),
  bills: z.array(z.string()).optional(),
});

// FriendGroup Schema
export const FriendGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.array(ParticipantSchema),
});

// Trip Schema
export const TripSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  participants: z.array(ParticipantSchema),
  bills: z.array(z.string()),
});

// Currency Schema
export const CurrencySchema = z.object({
  code: z.string(),
  symbol: z.string(),
  name: z.string(),
});

/**
 * Safely parse an array from localStorage with validation
 * Returns typed array with proper type assertion for compatibility with existing types
 */
export function safeParseParticipants(data: unknown, errorContext: string): Participant[] {
  try {
    const result = z.array(ParticipantSchema).safeParse(data);
    if (result.success) {
      return result.data as Participant[];
    }
    console.error(`Validation failed for ${errorContext}:`, result.error.message);
    return [];
  } catch (error) {
    console.error(`Error parsing ${errorContext}:`, error);
    return [];
  }
}

export function safeParseBills(data: unknown, errorContext: string): Bill[] {
  try {
    const result = z.array(BillSchema).safeParse(data);
    if (result.success) {
      return result.data as Bill[];
    }
    console.error(`Validation failed for ${errorContext}:`, result.error.message);
    return [];
  } catch (error) {
    console.error(`Error parsing ${errorContext}:`, error);
    return [];
  }
}

export function safeParseGroups(data: unknown, errorContext: string): FriendGroup[] {
  try {
    const result = z.array(FriendGroupSchema).safeParse(data);
    if (result.success) {
      return result.data as FriendGroup[];
    }
    console.error(`Validation failed for ${errorContext}:`, result.error.message);
    return [];
  } catch (error) {
    console.error(`Error parsing ${errorContext}:`, error);
    return [];
  }
}

export function safeParsePlaces(data: unknown, errorContext: string): Place[] {
  try {
    const result = z.array(PlaceSchema).safeParse(data);
    if (result.success) {
      return result.data as Place[];
    }
    console.error(`Validation failed for ${errorContext}:`, result.error.message);
    return [];
  } catch (error) {
    console.error(`Error parsing ${errorContext}:`, error);
    return [];
  }
}

export function safeParseTrips(data: unknown, errorContext: string): Trip[] {
  try {
    const result = z.array(TripSchema).safeParse(data);
    if (result.success) {
      return result.data as Trip[];
    }
    console.error(`Validation failed for ${errorContext}:`, result.error.message);
    return [];
  } catch (error) {
    console.error(`Error parsing ${errorContext}:`, error);
    return [];
  }
}

export function safeParseCurrency(data: unknown, errorContext: string): Currency | null {
  try {
    const result = CurrencySchema.safeParse(data);
    if (result.success) {
      return result.data as Currency;
    }
    console.error(`Validation failed for ${errorContext}:`, result.error.message);
    return null;
  } catch (error) {
    console.error(`Error parsing ${errorContext}:`, error);
    return null;
  }
}
