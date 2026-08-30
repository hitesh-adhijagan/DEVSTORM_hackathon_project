import React, { useState } from 'react';
import { Coins, X, Sparkles } from 'lucide-react';
import type { User } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';

interface CoinFlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: User[];
  currency?: 'INR' | 'USD' | 'EUR' | 'GBP';
}

export const CoinFlipModal: React.FC<CoinFlipModalProps> = ({ isOpen, onClose, members, currency = 'INR' }) => {
  const [debtor, setDebtor] = useState<User>(members[0] || { id: '1', name: 'Alex' });
  const [creditor, setCreditor] = useState<User>(members[1] || { id: '2', name: 'Priya' });
  const [microDebtAmount, setMicroDebtAmount] = useState<number>(50);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'HEADS' | 'TAILS' | null>(null);

  if (!isOpen) return null;

  const handleFlipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setResult(null);

    setTimeout(() => {
      const outcome = Math.random() > 0.5 ? 'HEADS' : 'TAILS';
      setResult(outcome);
      setIsFlipping(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Quick Feature Guide Banner */}
        <div className="bg-indigo-950/60 border border-indigo-700/50 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-indigo-300 shadow-sm">
          <Coins size={16} className="text-indigo-400 shrink-0" />
          <span><strong>Coin Flip Settle:</strong> Double-or-nothing coin-flip mini-game for micro-debts under $5 / ₹50 to let debtor flip to get balance cleared as "Treated".</span>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="text-amber-400 shrink-0" size={18} />
            <span>Coin Flip Settle</span>
          </h2>
          <p className="text-xs text-slate-400">Heads = Debt Cleared (Treated) 🎁 | Tails = Double Debt! 🪙</p>
        </div>

        {/* Game Config Form */}
        <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-medium">Debtor (Who owes):</span>
            <select
              value={debtor.id}
              onChange={e => {
                const found = members.find(m => m.id === e.target.value);
                if (found) setDebtor(found);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-medium">Creditor (Owed to):</span>
            <select
              value={creditor.id}
              onChange={e => {
                const found = members.find(m => m.id === e.target.value);
                if (found) setCreditor(found);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-medium">Micro-Debt Amount:</span>
            <input
              type="number"
              value={microDebtAmount}
              onChange={e => setMicroDebtAmount(Number(e.target.value))}
              className="w-24 bg-slate-900 border border-slate-800 text-right font-mono font-bold text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
            />
          </div>
        </div>

        {/* 3D Animated Coin Graphic */}
        <div className="flex flex-col items-center justify-center my-2">
          <div className={`w-28 h-28 rounded-full border-4 border-amber-400 bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 shadow-2xl flex items-center justify-center text-slate-950 font-extrabold text-xl transition-all duration-700 ${
            isFlipping ? 'animate-spin scale-110' : 'hover:scale-105'
          }`}>
            {isFlipping ? '🪙' : result ? (result === 'HEADS' ? '👑 HEADS' : '🪙 TAILS') : '🪙 FLIP'}
          </div>
        </div>

        {/* Result Outcome Display */}
        {result && !isFlipping && (
          <div className={`p-3.5 rounded-2xl border text-center space-y-1 ${
            result === 'HEADS'
              ? 'bg-emerald-950/90 border-emerald-600 text-emerald-200'
              : 'bg-rose-950/90 border-rose-600 text-rose-200'
          }`}>
            <span className="text-xs font-bold uppercase tracking-wider block">
              {result === 'HEADS' ? '🎉 HEADS — DEBT TREATED & CLEARED!' : '💀 TAILS — DOUBLE DEBT!'}
            </span>
            <p className="text-xs font-semibold">
              {result === 'HEADS'
                ? `${creditor.name} treats ${debtor.name}! ${formatCurrency(microDebtAmount, currency)} cleared!`
                : `${debtor.name} now owes ${creditor.name} ${formatCurrency(microDebtAmount * 2, currency)}!`}
            </p>
          </div>
        )}

        <button
          onClick={handleFlipCoin}
          disabled={isFlipping}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <Coins size={16} className="shrink-0" />
          <span>{isFlipping ? 'Coin Flipping in Air...' : `Flip Coin for ${formatCurrency(microDebtAmount, currency)}`}</span>
        </button>
      </div>
    </div>
  );
};
