import React from 'react';
import { Sparkles, X } from 'lucide-react';
import type { Expense, Room } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';

interface ExpenseWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  expenses: Expense[];
}

export const ExpenseWrappedModal: React.FC<ExpenseWrappedModalProps> = ({ isOpen, onClose, room, expenses }) => {
  if (!isOpen) return null;

  const totalSpent = expenses.reduce((sum, e) => sum + e.totalAmount, 0);

  // Top Spender calculation
  const spenderTotals: Record<string, number> = {};
  expenses.forEach(e => {
    spenderTotals[e.paidById] = (spenderTotals[e.paidById] || 0) + e.totalAmount;
  });

  let topSpenderId = room.members[0]?.id;
  let maxSpent = 0;
  Object.entries(spenderTotals).forEach(([id, amt]) => {
    if (amt > maxSpent) {
      maxSpent = amt;
      topSpenderId = id;
    }
  });

  const topSpenderName = room.members.find(m => m.id === topSpenderId)?.name || 'Alex';

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.totalAmount;
  });

  let topCategory = 'food';
  let maxCatAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > maxCatAmount) {
      maxCatAmount = amt;
      topCategory = cat;
    }
  });

  // Regret breakdown
  const worthItCount = expenses.filter(e => e.regretTag === 'worth_it').length;
  const mistakeCount = expenses.filter(e => e.regretTag === 'mistake').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg font-sans">
      <div className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-white overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg cursor-pointer z-20"
        >
          <X size={18} />
        </button>

        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Quick Feature Guide Banner */}
        <div className="bg-indigo-950/60 border border-indigo-700/50 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-indigo-300 relative z-10 shadow-sm">
          <Sparkles size={16} className="text-amber-400 shrink-0" />
          <span><strong>Monthly Expense Wrapped:</strong> Spotify-Wrapped-style visual summary showing Top Spender, Group Savings, Category Leaders & Regret Vibe breakdown.</span>
        </div>

        <div className="text-center space-y-1 relative z-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
            DivvyUp Season Recap
          </span>
          <h2 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2">
            ✨ Monthly Wrapped 2026
          </h2>
        </div>

        {/* Wrapped Cards Stack */}
        <div className="space-y-3 relative z-10">

          {/* Top Spender Card */}
          <div className="bg-slate-950/70 border border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between shadow-lg gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shrink-0">
                👑
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block font-medium">Top Takeout Spender</span>
                <p className="text-sm font-extrabold text-white truncate">{topSpenderName}</p>
              </div>
            </div>
            <span className="font-mono text-sm font-extrabold text-amber-400 shrink-0">
              {formatCurrency(maxSpent, room.currency)}
            </span>
          </div>

          {/* Biggest Category Card */}
          <div className="bg-slate-950/70 border border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between shadow-lg gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                🍔
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block font-medium">Biggest Expense Category</span>
                <p className="text-sm font-extrabold text-white uppercase truncate">{topCategory}</p>
              </div>
            </div>
            <span className="font-mono text-sm font-extrabold text-indigo-300 shrink-0">
              {formatCurrency(maxCatAmount, room.currency)}
            </span>
          </div>

          {/* Total Group Volume & Savings Card */}
          <div className="bg-slate-950/70 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between shadow-lg gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                💰
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block font-medium">Total Group Volume</span>
                <p className="text-sm font-extrabold text-white truncate">{formatCurrency(totalSpent, room.currency)}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-emerald-400 font-bold block">Zero Debt Disputes</span>
              <span className="text-[9px] text-slate-400">100% Fair Split</span>
            </div>
          </div>

          {/* Regret Tag Breakdown Card */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-2 shadow-lg">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">
              Spending Regret Vibe Breakdown
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-emerald-950/60 border border-emerald-800/60 p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-emerald-300 font-semibold">🔥 Worth It</span>
                <span className="font-mono font-bold text-white">{worthItCount}</span>
              </div>
              <div className="bg-rose-950/60 border border-rose-800/60 p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-rose-300 font-semibold">💀 Mistakes</span>
                <span className="font-mono font-bold text-white">{mistakeCount}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <span>Close Wrapped Overview</span>
        </button>
      </div>
    </div>
  );
};
