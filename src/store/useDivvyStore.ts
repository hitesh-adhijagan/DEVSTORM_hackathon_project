import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createRoomSlice, type RoomSlice } from './slices/roomSlice';
import { createExpenseSlice, type ExpenseSlice } from './slices/expenseSlice';
import { createKittySlice, type KittySlice } from './slices/kittySlice';
import type { Room, User, Expense, PrepaidKitty } from '../types';

export type DivvyStore = RoomSlice & ExpenseSlice & KittySlice;

// Initial Mock Seed Data for instant out-of-the-box demo
const DEFAULT_USER_ALEX: User = {
  id: 'usr-alex-101',
  name: 'Alex (You)',
  upiId: 'alex@okicici',
  isGuest: false,
  joinedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};

const DEFAULT_USER_PRIYA: User = {
  id: 'usr-priya-102',
  name: 'Priya',
  upiId: 'priya@paytm',
  isGuest: false,
  joinedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};

const DEFAULT_USER_RAHUL: User = {
  id: 'usr-rahul-103',
  name: 'Rahul',
  upiId: 'rahul@upi',
  isGuest: true,
  joinedAt: new Date(Date.now() - 86400000).toISOString(),
};

const DEFAULT_USER_ANANYA: User = {
  id: 'usr-ananya-104',
  name: 'Ananya (Guest)',
  isGuest: true,
  joinedAt: new Date(Date.now() - 43200000).toISOString(),
};

const DEFAULT_ROOM: Room = {
  id: 'room-goa-409',
  code: 'DIV-409',
  title: 'Goa Trip 🏖️',
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  currency: 'INR',
  mode: 'standard',
  members: [DEFAULT_USER_ALEX, DEFAULT_USER_PRIYA, DEFAULT_USER_RAHUL, DEFAULT_USER_ANANYA],
};

const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'exp-101',
    roomId: 'room-goa-409',
    title: 'Beach Shack Seafood Dinner 🍤',
    totalAmount: 3200,
    paidById: 'usr-alex-101',
    category: 'food',
    splitType: 'itemized',
    items: [
      { id: 'itm-1', name: 'Tiger Prawns (Non-Veg)', amount: 1400, consumedBy: ['usr-alex-101', 'usr-rahul-103'] },
      { id: 'itm-2', name: 'Veg Pasta (Dietary)', amount: 800, consumedBy: ['usr-priya-102', 'usr-ananya-104'] },
      { id: 'itm-3', name: 'Mocktails & Beverages', amount: 1000, consumedBy: ['usr-alex-101', 'usr-priya-102', 'usr-rahul-103', 'usr-ananya-104'] },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'exp-102',
    roomId: 'room-goa-409',
    title: 'Scooter Rental 🛵',
    totalAmount: 1600,
    paidById: 'usr-priya-102',
    category: 'travel',
    splitType: 'equal',
    items: [],
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

const DEFAULT_KITTY: PrepaidKitty = {
  id: 'kitty-goa-409',
  roomId: 'room-goa-409',
  targetPerPerson: 5000,
  contributions: [
    { userId: 'usr-alex-101', amountPaid: 5000, isPaid: true, timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
    { userId: 'usr-priya-102', amountPaid: 5000, isPaid: true, timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
    { userId: 'usr-rahul-103', amountPaid: 5000, isPaid: true, timestamp: new Date(Date.now() - 86400000).toISOString() },
    { userId: 'usr-ananya-104', amountPaid: 0, isPaid: false, timestamp: new Date(Date.now() - 43200000).toISOString() },
  ],
  totalPoolBalance: 15000,
};

export const useDivvyStore = create<DivvyStore>()(
  persist(
    (...a) => ({
      ...createRoomSlice(...a),
      ...createExpenseSlice(...a),
      ...createKittySlice(...a),
    }),
    {
      name: 'divvyup_session_v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Seed default room data if none exists in localStorage
        if (state && !state.currentRoom) {
          state.currentUser = DEFAULT_USER_ALEX;
          state.currentRoom = DEFAULT_ROOM;
          state.expenses = DEFAULT_EXPENSES;
          state.kittyPool = DEFAULT_KITTY;
        }
      },
    }
  )
);
