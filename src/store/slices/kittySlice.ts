import type { StateCreator } from 'zustand';
import type { KittySummary, PrepaidKitty } from '../../types';
import { calculateKittySummary } from '../../utils/kittyCalculator';
import { generateUUID } from '../../utils/codeGenerator';
import type { RoomSlice } from './roomSlice';
import type { ExpenseSlice } from './expenseSlice';

export interface KittySlice {
  kittyPool: PrepaidKitty | null;
  initKittyPool: (targetPerPerson: number) => PrepaidKitty;
  updateKittyTarget: (targetPerPerson: number) => void;
  toggleMemberContributionStatus: (userId: string, isPaid: boolean, amount?: number) => void;
  addKittyContribution: (userId: string, amountPaid: number) => void;
  recordKittyRefund: (userId: string, amount: number) => void;
  getKittySummary: () => KittySummary | null;
}

export const createKittySlice: StateCreator<
  RoomSlice & ExpenseSlice & KittySlice,
  [],
  [],
  KittySlice
> = (set, get) => ({
  kittyPool: null,

  initKittyPool: (targetPerPerson) => {
    const room = get().currentRoom;
    if (!room) throw new Error('No active room session found');

    // Initialize contributions for all members as paid by default or unpaid
    const initialContributions = room.members.map((m) => ({
      userId: m.id,
      amountPaid: targetPerPerson,
      isPaid: true,
      timestamp: new Date().toISOString(),
    }));

    const totalCollected = initialContributions.reduce((s, c) => s + c.amountPaid, 0);

    const newKitty: PrepaidKitty = {
      id: generateUUID(),
      roomId: room.id,
      targetPerPerson,
      contributions: initialContributions,
      totalPoolBalance: totalCollected,
    };

    set({ kittyPool: newKitty });
    return newKitty;
  },

  updateKittyTarget: (targetPerPerson) => {
    const kitty = get().kittyPool;
    if (!kitty) return;

    const updatedContributions = kitty.contributions.map((c) => ({
      ...c,
      amountPaid: c.isPaid ? targetPerPerson : c.amountPaid,
    }));

    set({
      kittyPool: {
        ...kitty,
        targetPerPerson,
        contributions: updatedContributions,
      },
    });
  },

  toggleMemberContributionStatus: (userId, isPaid, amount) => {
    const kitty = get().kittyPool;
    if (!kitty) return;

    const existingIndex = kitty.contributions.findIndex((c) => c.userId === userId);
    const targetAmount = amount !== undefined ? amount : kitty.targetPerPerson;

    let updatedContributions = [...kitty.contributions];

    if (existingIndex >= 0) {
      updatedContributions[existingIndex] = {
        ...updatedContributions[existingIndex],
        isPaid,
        amountPaid: isPaid ? targetAmount : 0,
        timestamp: new Date().toISOString(),
      };
    } else {
      updatedContributions.push({
        userId,
        amountPaid: isPaid ? targetAmount : 0,
        isPaid,
        timestamp: new Date().toISOString(),
      });
    }

    set({
      kittyPool: {
        ...kitty,
        contributions: updatedContributions,
      },
    });
  },

  addKittyContribution: (userId, amountPaid) => {
    get().toggleMemberContributionStatus(userId, true, amountPaid);
  },

  recordKittyRefund: (userId, amount) => {
    // Record settlement transaction for kitty refund
    const room = get().currentRoom;
    if (!room) return;

    // Create completed refund transaction
    get().recordSettlement({
      roomId: room.id,
      fromUserId: 'kitty-pool', // From Kitty Pool
      toUserId: userId,
      amount,
      status: 'completed',
      upiReference: `KITTY-REFUND-${Math.floor(100000 + Math.random() * 900000)}`,
    });
  },

  getKittySummary: () => {
    const room = get().currentRoom;
    const kitty = get().kittyPool;
    if (!room || !kitty) return null;

    const expenses = get().expenses.filter((e) => e.roomId === room.id);
    return calculateKittySummary(
      kitty.targetPerPerson,
      kitty.contributions,
      expenses,
      room.members
    );
  },
});
