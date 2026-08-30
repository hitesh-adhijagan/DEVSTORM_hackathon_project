import type { StateCreator } from 'zustand';
import type { CreateExpenseInput, CreateSettlementInput, Expense, Settlement, SimplifiedDebt } from '../../types';
import { calculateNetBalances, simplifyDebts, type UserBalance } from '../../utils/balanceCalculator';
import { generateUUID } from '../../utils/codeGenerator';
import type { RoomSlice } from './roomSlice';

export interface ExpenseSlice {
  expenses: Expense[];
  settlements: Settlement[];
  addExpense: (input: CreateExpenseInput) => Expense;
  updateExpense: (id: string, input: Partial<CreateExpenseInput>) => void;
  deleteExpense: (id: string) => void;
  recordSettlement: (input: CreateSettlementInput) => Settlement;
  markSettlementCompleted: (settlementId: string, upiReference?: string) => void;
  getComputedBalances: () => Record<string, UserBalance>;
  getSimplifiedSettlements: () => SimplifiedDebt[];
}

export const createExpenseSlice: StateCreator<
  RoomSlice & ExpenseSlice,
  [],
  [],
  ExpenseSlice
> = (set, get) => ({
  expenses: [],
  settlements: [],

  addExpense: (input) => {
    const newExpense: Expense = {
      ...input,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      expenses: [newExpense, ...state.expenses],
    }));

    return newExpense;
  },

  updateExpense: (id, input) => {
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...input } : e)),
    }));
  },

  deleteExpense: (id) => {
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));
  },

  recordSettlement: (input) => {
    const newSettlement: Settlement = {
      ...input,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      settlements: [newSettlement, ...state.settlements],
    }));

    return newSettlement;
  },

  markSettlementCompleted: (settlementId, upiReference) => {
    set((state) => ({
      settlements: state.settlements.map((s) =>
        s.id === settlementId
          ? {
              ...s,
              status: 'completed',
              upiReference: upiReference || s.upiReference,
            }
          : s
      ),
    }));
  },

  getComputedBalances: () => {
    const room = get().currentRoom;
    if (!room) return {};

    const members = room.members || [];
    const expenses = get().expenses.filter((e) => e.roomId === room.id);
    const settlements = get().settlements.filter((s) => s.roomId === room.id);

    return calculateNetBalances(members, expenses, settlements);
  },

  getSimplifiedSettlements: () => {
    const room = get().currentRoom;
    if (!room) return [];

    const balances = get().getComputedBalances();
    return simplifyDebts(room.members, balances);
  },
});
