import { calculateNetBalances, simplifyDebtsOptimal, verifyZeroSumInvariant } from '../balanceCalculator';
import type { Expense, Settlement, User } from '../../types';

function runUnitTests() {
  console.log('🧪 Running DivvyUp Debt Simplification & Zero-Sum Unit Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // Define Mock Users
  const userAlex: User = { id: 'u-alex', name: 'Alex', isGuest: false, joinedAt: new Date().toISOString() };
  const userPriya: User = { id: 'u-priya', name: 'Priya', isGuest: false, joinedAt: new Date().toISOString() };
  const userSam: User = { id: 'u-sam', name: 'Sam', isGuest: false, joinedAt: new Date().toISOString() };
  const userRohan: User = { id: 'u-rohan', name: 'Rohan', isGuest: false, joinedAt: new Date().toISOString() };

  // =========================================================================
  // Test Case 1: Transitive Debt Simplification (Alex -> Priya -> Sam)
  // Alex owes Priya ₹500, Priya owes Sam ₹500.
  // Expected Output: Single transfer -> Alex pays Sam ₹500.
  // =========================================================================
  console.log('Test Case 1: Transitive Debt Reduction (Alex -> Priya -> Sam)');
  const membersTC1 = [userAlex, userPriya, userSam];
  const expensesTC1: Expense[] = [
    {
      id: 'exp-1',
      roomId: 'room-1',
      title: 'Priya paid for Alex',
      totalAmount: 500,
      paidById: 'u-priya',
      category: 'food',
      splitType: 'itemized',
      items: [{ id: 'i-1', name: 'Dinner', amount: 500, consumedBy: ['u-alex'] }],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-2',
      roomId: 'room-1',
      title: 'Sam paid for Priya',
      totalAmount: 500,
      paidById: 'u-sam',
      category: 'food',
      splitType: 'itemized',
      items: [{ id: 'i-2', name: 'Cab', amount: 500, consumedBy: ['u-priya'] }],
      createdAt: new Date().toISOString(),
    },
  ];

  const balancesTC1 = calculateNetBalances(membersTC1, expensesTC1, []);
  const instructionsTC1 = simplifyDebtsOptimal(membersTC1, balancesTC1);
  const zeroSumTC1 = verifyZeroSumInvariant(balancesTC1);

  assert(instructionsTC1.length === 1, 'Transitive debt reduced to exactly 1 transfer');
  assert(
    instructionsTC1[0]?.sender.name === 'Alex' &&
      instructionsTC1[0]?.receiver.name === 'Sam' &&
      instructionsTC1[0]?.amount === 500,
    'Transfer instruction matches: Alex pays Sam ₹500'
  );
  assert(zeroSumTC1.isZeroSum, 'Zero-sum invariant holds (Sum = 0)', `Sum was ${zeroSumTC1.sum}`);

  console.log('');

  // =========================================================================
  // Test Case 2: Multi-Person Circular Debts (4-person cyclical debt matrix)
  // Alex -> Priya (₹1000), Priya -> Sam (₹1000), Sam -> Rohan (₹1000), Rohan -> Alex (₹1000).
  // Expected Output: All debts cancel out perfectly to 0 transfers!
  // =========================================================================
  console.log('Test Case 2: Multi-Person Circular Debts (4 People Cyclical)');
  const membersTC2 = [userAlex, userPriya, userSam, userRohan];
  const expensesTC2: Expense[] = [
    {
      id: 'exp-c1',
      roomId: 'room-2',
      title: 'Priya paid for Alex',
      totalAmount: 1000,
      paidById: 'u-priya',
      category: 'food',
      splitType: 'itemized',
      items: [{ id: 'ic-1', name: 'Item 1', amount: 1000, consumedBy: ['u-alex'] }],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-c2',
      roomId: 'room-2',
      title: 'Sam paid for Priya',
      totalAmount: 1000,
      paidById: 'u-sam',
      category: 'food',
      splitType: 'itemized',
      items: [{ id: 'ic-2', name: 'Item 2', amount: 1000, consumedBy: ['u-priya'] }],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-c3',
      roomId: 'room-2',
      title: 'Rohan paid for Sam',
      totalAmount: 1000,
      paidById: 'u-rohan',
      category: 'food',
      splitType: 'itemized',
      items: [{ id: 'ic-3', name: 'Item 3', amount: 1000, consumedBy: ['u-sam'] }],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-c4',
      roomId: 'room-2',
      title: 'Alex paid for Rohan',
      totalAmount: 1000,
      paidById: 'u-alex',
      category: 'food',
      splitType: 'itemized',
      items: [{ id: 'ic-4', name: 'Item 4', amount: 1000, consumedBy: ['u-rohan'] }],
      createdAt: new Date().toISOString(),
    },
  ];

  const balancesTC2 = calculateNetBalances(membersTC2, expensesTC2, []);
  const instructionsTC2 = simplifyDebtsOptimal(membersTC2, balancesTC2);
  const zeroSumTC2 = verifyZeroSumInvariant(balancesTC2);

  assert(instructionsTC2.length === 0, 'Circular debt of 4 people eliminated down to 0 transfers');
  assert(zeroSumTC2.isZeroSum, 'Zero-sum invariant holds for circular debts', `Sum was ${zeroSumTC2.sum}`);

  console.log('');

  // =========================================================================
  // Test Case 3: Complex Multi-User Matrix Zero-Sum Invariant
  // Verify Sum(Net Balances) === 0 across arbitrary complex expenses and settlements.
  // =========================================================================
  console.log('Test Case 3: Zero-Sum Invariant Verification (Complex Matrix)');
  const membersTC3 = [userAlex, userPriya, userSam, userRohan];
  const expensesTC3: Expense[] = [
    {
      id: 'exp-m1',
      roomId: 'room-3',
      title: 'Dinner Shack',
      totalAmount: 3200,
      paidById: 'u-alex',
      category: 'food',
      splitType: 'equal',
      items: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-m2',
      roomId: 'room-3',
      title: 'Scooters',
      totalAmount: 1800,
      paidById: 'u-priya',
      category: 'travel',
      splitType: 'equal',
      items: [],
      createdAt: new Date().toISOString(),
    },
  ];

  const settlementsTC3: Settlement[] = [
    {
      id: 'set-1',
      roomId: 'room-3',
      fromUserId: 'u-sam',
      toUserId: 'u-alex',
      amount: 400,
      status: 'completed',
      createdAt: new Date().toISOString(),
    },
  ];

  const balancesTC3 = calculateNetBalances(membersTC3, expensesTC3, settlementsTC3);
  const zeroSumTC3 = verifyZeroSumInvariant(balancesTC3);
  const instructionsTC3 = simplifyDebtsOptimal(membersTC3, balancesTC3);

  assert(zeroSumTC3.isZeroSum, 'Complex multi-user net balance sum is exactly 0', `Sum: ${zeroSumTC3.sum}`);
  assert(instructionsTC3.length <= membersTC3.length - 1, `Max transfers count is <= N-1 (N=${membersTC3.length}, Transfers=${instructionsTC3.length})`);

  console.log('\n==================================================');
  console.log(`🎉 Unit Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('==================================================\n');

  if (failed > 0) {
    throw new Error(`Unit tests failed: ${failed} failure(s)`);
  }
}

runUnitTests();
