import React from 'react';
import { useDivvyStore } from '../store/useDivvyStore';
import { Utensils, Car, Home, Compass, Trash2, PieChart, Layers } from 'lucide-react';
import type { ExpenseCategory, ExpenseSplitType } from '../types';

interface ExpenseListProps {
  onOpenAddModal: () => void;
}

const CATEGORY_ICONS: Record<ExpenseCategory, React.ReactNode> = {
  food: <Utensils className="w-4 h-4 text-amber-400" />,
  travel: <Car className="w-4 h-4 text-emerald-400" />,
  stay: <Home className="w-4 h-4 text-sky-400" />,
  utilities: <Compass className="w-4 h-4 text-indigo-400" />,
  groceries: <Compass className="w-4 h-4 text-teal-400" />,
  other: <Compass className="w-4 h-4 text-purple-400" />,
};

const SPLIT_BADGES: Record<ExpenseSplitType, { label: string; color: string }> = {
  equal: { label: 'Equal Split', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  itemized: { label: 'Itemized Breakdown', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  smart_dietary: { label: 'Smart Dietary', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  percentage: { label: 'Percentage Split', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  exact: { label: 'Exact Amounts', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  shares: { label: 'Weighted Shares', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
};

export const ExpenseList: React.FC<ExpenseListProps> = ({ onOpenAddModal }) => {
  const currentRoom = useDivvyStore((state) => state.currentRoom);
  const expenses = useDivvyStore((state) => state.expenses);
  const deleteExpense = useDivvyStore((state) => state.deleteExpense);

  if (!currentRoom) return null;

  const roomExpenses = expenses.filter((e) => e.roomId === currentRoom.id);
  const memberMap = new Map(currentRoom.members.map((m) => [m.id, m.name]));

  return (
    <div className="glass-card mb-6 p-4 md:p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>Expenses ({roomExpenses.length})</span>
          </h2>
          <p className="text-xs text-slate-400">Live room activity and itemized allocation log</p>
        </div>

        <button onClick={onOpenAddModal} className="btn-primary text-xs cursor-pointer shrink-0">
          + Add Expense
        </button>
      </div>

      {roomExpenses.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          No expenses recorded yet. Click <strong>+ Add Expense</strong> to start divvying up!
        </div>
      ) : (
        <div className="space-y-3">
          {roomExpenses.map((expense) => {
            const payerName = memberMap.get(expense.paidById) || 'Unknown';
            const splitBadge = SPLIT_BADGES[expense.splitType];

            return (
              <div
                key={expense.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 transition-all hover:border-slate-700 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0 flex items-center justify-center">
                      {CATEGORY_ICONS[expense.category] || CATEGORY_ICONS.other}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-sm font-bold text-white truncate">{expense.title}</h4>
                      <p className="text-xs text-slate-400">
                        Paid by <span className="font-semibold text-slate-200">{payerName}</span> •{' '}
                        {new Date(expense.createdAt).toLocaleDateString()}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${splitBadge.color}`}>
                          {splitBadge.label}
                        </span>

                        <span className="text-[10px] font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-800">
                          Category: {expense.category.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-extrabold text-white font-mono">
                        ₹{expense.totalAmount.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Itemized Items Breakdown */}
                {expense.items && expense.items.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Itemized Split Items:</span>
                    </div>
                    <div className="space-y-1.5">
                      {expense.items.map((item) => {
                        const consumerNames = item.consumedBy
                          .map((id) => memberMap.get(id) || 'Unknown')
                          .join(', ');

                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800/50 gap-2"
                          >
                            <span className="text-slate-300 font-medium truncate">{item.name}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-slate-400">
                                Consumed by: <strong className="text-slate-200">{consumerNames || 'None'}</strong>
                              </span>
                              <span className="font-mono text-slate-200 font-bold">
                                ₹{item.amount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
