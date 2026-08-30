/**
 * Contribution record in a prepaid kitty pool
 */
export interface KittyContribution {
  userId: string;
  amountPaid: number;
  isPaid: boolean;
  timestamp: string; // ISO Date String
}

/**
 * Prepaid Kitty Entity Definition
 */
export interface PrepaidKitty {
  id: string; // UUID
  roomId: string;
  targetPerPerson: number;
  contributions: KittyContribution[];
  totalPoolBalance: number;
}

export type KittyMemberStatusType = 'REFUND_DUE' | 'DEFICIT_DUE' | 'SETTLED' | 'UNPAID';

export interface KittyMemberStatus {
  userId: string;
  userName: string;
  userUpiId?: string;
  targetAmount: number;
  totalPaid: number;
  isPaid: boolean;
  individualExpenseShare: number;
  refundOrDeficitAmount: number; // >0 means refund due to member, <0 means deficit top-up due from member
  status: KittyMemberStatusType;
}

/**
 * Computed summary for prepaid kitty status & refunds
 */
export interface KittySummary {
  targetPerPerson: number;
  totalTarget: number;
  totalCollected: number;
  totalSpent: number;
  currentPoolBalance: number;
  perPersonRemaining: number;
  isDeficit: boolean;
  totalDeficit: number;
  deficitPerMember: number;
  memberStatuses: KittyMemberStatus[];
}
