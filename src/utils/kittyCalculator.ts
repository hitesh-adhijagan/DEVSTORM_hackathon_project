import type { Expense, KittyContribution, KittySummary, KittyMemberStatus, User } from '../types';

/**
 * Calculates Prepaid Kitty Pool status, total collected funds, spent pool funds,
 * remaining pool balance, per-person remaining share, deficit top-ups, and per-member refunds.
 */
export function calculateKittySummary(
  targetPerPerson: number,
  contributions: KittyContribution[],
  expenses: Expense[],
  members: User[]
): KittySummary {
  const memberCount = members.length || 1;
  const totalTarget = targetPerPerson * members.length;

  // Map contributions by userId
  const userContribMap: Record<string, { paid: number; isPaid: boolean }> = {};
  for (const c of contributions) {
    // If contribution exists and is marked paid or amount > 0
    const existing = userContribMap[c.userId] || { paid: 0, isPaid: false };
    userContribMap[c.userId] = {
      paid: existing.paid + (c.isPaid ? c.amountPaid : 0),
      isPaid: c.isPaid,
    };
  }

  // 1. Total Collected Pool Funds
  let totalCollected = 0;
  for (const member of members) {
    const info = userContribMap[member.id];
    if (info && info.isPaid) {
      totalCollected += info.paid > 0 ? info.paid : targetPerPerson;
    }
  }

  // 2. Total Pool Expenses (expenses where paidFromPool === true OR all expenses in kitty mode)
  const poolExpenses = expenses.filter((e) => e.paidFromPool !== false);
  const totalSpent = poolExpenses.reduce((acc, e) => acc + e.totalAmount, 0);

  // 3. Current Pool Balance (Collected - Spent)
  const currentPoolBalance = totalCollected - totalSpent;
  const perPersonRemaining = Math.round((currentPoolBalance / memberCount) * 100) / 100;

  const isDeficit = currentPoolBalance < 0;
  const totalDeficit = isDeficit ? Math.abs(currentPoolBalance) : 0;
  const deficitPerMember = isDeficit ? Math.round((totalDeficit / memberCount) * 100) / 100 : 0;

  // Calculate individual member expense shares
  const userExpenseSharesMap: Record<string, number> = {};
  for (const m of members) {
    userExpenseSharesMap[m.id] = 0;
  }

  for (const expense of poolExpenses) {
    if (expense.splitType === 'equal' || !expense.items || expense.items.length === 0) {
      const share = expense.totalAmount / memberCount;
      for (const m of members) {
        userExpenseSharesMap[m.id] = (userExpenseSharesMap[m.id] || 0) + share;
      }
    } else {
      let allocated = 0;
      for (const item of expense.items) {
        if (item.consumedBy && item.consumedBy.length > 0) {
          const itemShare = item.amount / item.consumedBy.length;
          for (const consumerId of item.consumedBy) {
            userExpenseSharesMap[consumerId] = (userExpenseSharesMap[consumerId] || 0) + itemShare;
          }
          allocated += item.amount;
        }
      }
      const unallocated = expense.totalAmount - allocated;
      if (unallocated > 0.001) {
        const remainderShare = unallocated / memberCount;
        for (const m of members) {
          userExpenseSharesMap[m.id] = (userExpenseSharesMap[m.id] || 0) + remainderShare;
        }
      }
    }
  }

  // Compute per-member statuses and refund / deficit amounts
  const memberStatuses: KittyMemberStatus[] = members.map((member) => {
    const contrib = userContribMap[member.id];
    const isPaid = contrib ? contrib.isPaid : false;
    const totalPaid = isPaid ? (contrib.paid > 0 ? contrib.paid : targetPerPerson) : 0;

    const individualExpenseShare = Math.round((userExpenseSharesMap[member.id] || 0) * 100) / 100;
    const refundOrDeficitAmount = Math.round((totalPaid - individualExpenseShare) * 100) / 100;

    let status: KittyMemberStatus['status'] = 'SETTLED';

    if (!isPaid) {
      status = 'UNPAID';
    } else if (refundOrDeficitAmount > 0.01) {
      status = 'REFUND_DUE';
    } else if (refundOrDeficitAmount < -0.01) {
      status = 'DEFICIT_DUE';
    }

    return {
      userId: member.id,
      userName: member.name,
      userUpiId: member.upiId,
      targetAmount: targetPerPerson,
      totalPaid,
      isPaid,
      individualExpenseShare,
      refundOrDeficitAmount,
      status,
    };
  });

  return {
    targetPerPerson,
    totalTarget,
    totalCollected,
    totalSpent,
    currentPoolBalance: Math.round(currentPoolBalance * 100) / 100,
    perPersonRemaining,
    isDeficit,
    totalDeficit: Math.round(totalDeficit * 100) / 100,
    deficitPerMember,
    memberStatuses,
  };
}
