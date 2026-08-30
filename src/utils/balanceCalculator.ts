import type { Expense, Settlement, User, SimplifiedDebt, SettlementInstruction } from '../types';
import { computeNormalizedShareBreakdown } from './itemizedSplitCalculator';

export interface UserBalance {
  userId: string;
  userName: string;
  userUpiId?: string;
  totalPaid: number;
  totalOwed: number;
  netBalance: number; // > 0 means user should receive, < 0 means user owes
}

/**
 * Calculates raw net balances for all users in a room based on personal expenses and completed settlements.
 * Expenses paid directly from the Prepaid Kitty Pool (paidFromPool === true) are excluded from user-to-user debts.
 */
export function calculateNetBalances(
  members: User[],
  expenses: Expense[],
  settlements: Settlement[]
): Record<string, UserBalance> {
  const balances: Record<string, UserBalance> = {};

  // Initialize balances for all room members
  for (const member of members) {
    balances[member.id] = {
      userId: member.id,
      userName: member.name,
      userUpiId: member.upiId,
      totalPaid: 0,
      totalOwed: 0,
      netBalance: 0,
    };
  }

  if (members.length === 0) return balances;

  // Process Expenses
  for (const expense of expenses) {
    // If expense was paid from the Prepaid Trip Pool (Kitty), skip user-to-user net debt creation!
    if (expense.paidFromPool) {
      continue;
    }

    const paidBy = balances[expense.paidById];
    if (paidBy) {
      paidBy.totalPaid += expense.totalAmount;
    }

    if (expense.splitType === 'equal' || !expense.items || expense.items.length === 0) {
      // Split total amount equally among all members
      const sharePerMember = expense.totalAmount / members.length;
      for (const member of members) {
        if (balances[member.id]) {
          balances[member.id].totalOwed += sharePerMember;
        }
      }
    } else {
      // Itemized / Smart Dietary Split using normalized share breakdown
      const shares = computeNormalizedShareBreakdown(
        expense.items,
        members,
        expense.totalAmount,
        expense.taxAndTip || 0,
        expense.autoDistributeTax ?? true
      );

      for (const share of shares) {
        if (balances[share.userId]) {
          balances[share.userId].totalOwed += share.owesAmount;
        }
      }
    }
  }

  // Calculate preliminary net balance (totalPaid - totalOwed)
  for (const userId of Object.keys(balances)) {
    const b = balances[userId];
    b.netBalance = Math.round((b.totalPaid - b.totalOwed) * 100) / 100;
  }

  // Process Completed Settlements
  for (const settlement of settlements) {
    if (settlement.status === 'completed') {
      if (balances[settlement.fromUserId]) {
        balances[settlement.fromUserId].netBalance =
          Math.round((balances[settlement.fromUserId].netBalance + settlement.amount) * 100) / 100;
      }
      if (balances[settlement.toUserId]) {
        balances[settlement.toUserId].netBalance =
          Math.round((balances[settlement.toUserId].netBalance - settlement.amount) * 100) / 100;
      }
    }
  }

  return balances;
}

/**
 * Greedily simplifies debts into the minimum number of transaction pairs.
 */
export function simplifyDebts(
  members: User[],
  balances: Record<string, UserBalance>
): SimplifiedDebt[] {
  const instructions = simplifyDebtsOptimal(members, balances);

  return instructions.map((inst) => ({
    fromUserId: inst.sender.id,
    fromUserName: inst.sender.name,
    toUserId: inst.receiver.id,
    toUserName: inst.receiver.name,
    toUserUpiId: inst.receiver.upiId,
    amount: inst.amount,
  }));
}

/**
 * Optimal Min-Cash-Flow Debt Simplification Algorithm
 * Inputs: Room members and net balance map.
 * Output: Minimal SettlementInstructions array [{ sender: User, receiver: User, amount: number }]
 */
export function simplifyDebtsOptimal(
  members: User[],
  balances: Record<string, UserBalance>
): SettlementInstruction[] {
  const memberMap = new Map<string, User>(members.map((m) => [m.id, m]));

  const debtors: Array<{ user: User; amount: number }> = [];
  const creditors: Array<{ user: User; amount: number }> = [];

  for (const [userId, balance] of Object.entries(balances)) {
    const net = Math.round(balance.netBalance * 100) / 100;
    const user = memberMap.get(userId) || {
      id: userId,
      name: balance.userName,
      isGuest: false,
      joinedAt: new Date().toISOString(),
    };

    if (net < -0.01) {
      debtors.push({ user, amount: -net }); // Positive debt
    } else if (net > 0.01) {
      creditors.push({ user, amount: net }); // Positive credit
    }
  }

  // Sort descending by amount for greedy matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const instructions: SettlementInstruction[] = [];

  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const transferAmount = Math.min(debtor.amount, creditor.amount);
    const roundedAmount = Math.round(transferAmount * 100) / 100;

    if (roundedAmount > 0) {
      instructions.push({
        sender: debtor.user,
        receiver: creditor.user,
        amount: roundedAmount,
      });
    }

    debtor.amount = Math.round((debtor.amount - transferAmount) * 100) / 100;
    creditor.amount = Math.round((creditor.amount - transferAmount) * 100) / 100;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return instructions;
}

/**
 * Verifies that the sum of all net balances in a room is zero (Zero-Sum Invariant).
 */
export function verifyZeroSumInvariant(balances: Record<string, UserBalance>): {
  isZeroSum: boolean;
  sum: number;
} {
  const sum = Object.values(balances).reduce((acc, b) => acc + b.netBalance, 0);
  const roundedSum = Math.round(sum * 100) / 100;
  return {
    isZeroSum: Math.abs(roundedSum) < 0.01,
    sum: roundedSum,
  };
}
