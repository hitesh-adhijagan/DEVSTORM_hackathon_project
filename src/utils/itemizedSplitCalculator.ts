import type { ExpenseItem, User, UserOwesShare, ItemDietaryTag } from '../types';

/**
 * 1-Tap Filter: Auto-assigns consumers to line items based on line item dietary tags
 * vs member dietary preferences while keeping general items split across all members.
 */
export function autoAssignByDietaryTags(
  items: ExpenseItem[],
  members: User[]
): ExpenseItem[] {
  return items.map((item) => {
    const tag: ItemDietaryTag = item.dietaryTag || 'general';

    let eligibleUserIds: string[] = [];

    if (tag === 'general' || tag === 'veg') {
      // General and Veg items are consumed by all members
      eligibleUserIds = members.map((m) => m.id);
    } else if (tag === 'non_veg') {
      // Non-veg items exclude members with 'veg_only' or 'veg_no_alcohol' preferences
      eligibleUserIds = members
        .filter((m) => m.dietaryPreference !== 'veg_only' && m.dietaryPreference !== 'veg_no_alcohol')
        .map((m) => m.id);
    } else if (tag === 'alcohol') {
      // Alcohol items exclude members with 'no_alcohol' or 'veg_no_alcohol' preferences
      eligibleUserIds = members
        .filter((m) => m.dietaryPreference !== 'no_alcohol' && m.dietaryPreference !== 'veg_no_alcohol')
        .map((m) => m.id);
    }

    // Fallback if filter excluded everyone: default to all members
    if (eligibleUserIds.length === 0) {
      eligibleUserIds = members.map((m) => m.id);
    }

    return {
      ...item,
      consumedBy: eligibleUserIds,
    };
  });
}

/**
 * Computes normalized share breakdown array [{ userId, userName, itemSubtotal, taxAndTipShare, owesAmount }]
 * with real-time proportional tax/tip auto-distribution.
 */
export function computeNormalizedShareBreakdown(
  items: ExpenseItem[],
  members: User[],
  totalAmount: number,
  taxAndTip: number = 0,
  autoDistributeTax: boolean = true
): UserOwesShare[] {
  const itemSubtotals: Record<string, number> = {};

  for (const m of members) {
    itemSubtotals[m.id] = 0;
  }

  // 1. Calculate raw item subtotals for each member
  for (const item of items) {
    if (item.consumedBy && item.consumedBy.length > 0) {
      const sharePerConsumer = item.amount / item.consumedBy.length;
      for (const consumerId of item.consumedBy) {
        itemSubtotals[consumerId] = (itemSubtotals[consumerId] || 0) + sharePerConsumer;
      }
    }
  }

  const totalItemSubtotal = Object.values(itemSubtotals).reduce((sum, val) => sum + val, 0);

  // Unallocated remainder (e.g. unassigned items or difference between sum(items) and totalAmount)
  const unallocatedAmount = Math.max(0, totalAmount - totalItemSubtotal - (autoDistributeTax ? taxAndTip : 0));

  // 2. Compute proportional tax/tip and final amounts
  return members.map((m) => {
    const subtotal = itemSubtotals[m.id] || 0;
    let taxShare = 0;

    if (autoDistributeTax && taxAndTip > 0) {
      if (totalItemSubtotal > 0) {
        // Proportional tax distribution based on item subtotal share
        taxShare = taxAndTip * (subtotal / totalItemSubtotal);
      } else {
        // Fallback to equal tax split if no items specified
        taxShare = taxAndTip / (members.length || 1);
      }
    }

    // Add equal share of any unallocated remainder
    const unallocatedShare = unallocatedAmount > 0.001 ? unallocatedAmount / (members.length || 1) : 0;

    const owesAmount = Math.round((subtotal + taxShare + unallocatedShare) * 100) / 100;

    return {
      userId: m.id,
      userName: m.name,
      itemSubtotal: Math.round(subtotal * 100) / 100,
      taxAndTipShare: Math.round(taxShare * 100) / 100,
      owesAmount,
    };
  });
}
