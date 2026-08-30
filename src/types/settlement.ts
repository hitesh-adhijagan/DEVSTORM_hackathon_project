import type { User } from './user';

export type SettlementStatus = 'pending' | 'completed';

/**
 * Settlement / Transaction Entity Definition
 */
export interface Settlement {
  id: string; // UUID
  roomId: string;
  fromUserId: string; // User ID paying debt
  toUserId: string;   // User ID receiving payment
  amount: number;
  status: SettlementStatus;
  upiReference?: string; // Optional UPI transaction reference
  createdAt: string; // ISO Date String
}

export type CreateSettlementInput = Omit<Settlement, 'id' | 'createdAt'>;

/**
 * Simplified debt transaction pair
 */
export interface SimplifiedDebt {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  toUserUpiId?: string;
  amount: number;
}

/**
 * Settlement Instruction for Visual Debt Graph & Min-Cash-Flow Output
 */
export interface SettlementInstruction {
  sender: User;
  receiver: User;
  amount: number;
}
