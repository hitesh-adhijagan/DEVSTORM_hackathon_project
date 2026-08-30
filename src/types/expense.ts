export type ExpenseCategory = 'food' | 'travel' | 'stay' | 'utilities' | 'groceries' | 'other';
export type ExpenseSplitType = 'equal' | 'percentage' | 'exact' | 'shares' | 'itemized' | 'smart_dietary';
export type ItemDietaryTag = 'veg' | 'non_veg' | 'alcohol' | 'general';
export type RegretTag = 'worth_it' | 'necessary' | 'mistake';

export interface PayerShare {
  userId: string;
  amount: number;
}

export interface UserOwesShare {
  userId: string;
  userName: string;
  itemSubtotal: number;
  taxAndTipShare: number;
  owesAmount: number;
}

export interface ExpenseItem {
  id: string; // UUID
  name: string;
  amount: number;
  consumedBy: string[]; // Array of User IDs who consumed this item
  dietaryTag?: ItemDietaryTag;
}

/**
 * Enhanced Expense Entity Definition supporting all 18 DivvyUp features
 */
export interface Expense {
  id: string; // UUID
  roomId: string;
  title: string;
  totalAmount: number;
  paidById: string; // Primary payer ID
  payers?: PayerShare[]; // Multi-payer split support (e.g. Alex $60, Sam $40)
  category: ExpenseCategory;
  splitType: ExpenseSplitType;
  items: ExpenseItem[];
  optedInMembers?: string[]; // 1-Tap Opt-In / Opt-Out list
  isVegOnly?: boolean; // Veg / Non-Veg split toggle
  regretTag?: RegretTag; // Regret Tagging ([100% Worth It 🔥], [Necessary Evil 🤷‍♂️], [Financial Mistake 💀])
  taxAndTip?: number;
  autoDistributeTax?: boolean;
  paidFromPool?: boolean; // Paid from Prepaid Trip Kitty Pool
  createdAt: string; // ISO Date String
}

export type CreateExpenseInput = Omit<Expense, 'id' | 'createdAt'>;
