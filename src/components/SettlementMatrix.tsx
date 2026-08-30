import React, { useState } from 'react';
import { useDivvyStore } from '../store/useDivvyStore';
import { DollarSign, QrCode, ShieldCheck } from 'lucide-react';
import { simplifyDebtsOptimal } from '../utils/balanceCalculator';
import { VisualDebtGraph } from './VisualDebtGraph';

export const SettlementMatrix: React.FC = () => {
  const currentRoom = useDivvyStore((state) => state.currentRoom);
  const getComputedBalances = useDivvyStore((state) => state.getComputedBalances);
  const settlements = useDivvyStore((state) => state.settlements);
  const recordSettlement = useDivvyStore((state) => state.recordSettlement);
  const markSettlementCompleted = useDivvyStore((state) => state.markSettlementCompleted);

  const [settlingPair, setSettlingPair] = useState<{ fromId: string; toId: string; amount: number } | null>(null);
  const [upiRefInput, setUpiRefInput] = useState('');

  if (!currentRoom) return null;

  const rawBalances = getComputedBalances();
  const instructions = simplifyDebtsOptimal(currentRoom.members, rawBalances);
  const roomSettlements = settlements.filter((s) => s.roomId === currentRoom.id);

  const handleSettleUpClick = (fromUserId: string, toUserId: string, amount: number) => {
    setSettlingPair({ fromId: fromUserId, toId: toUserId, amount });
    setUpiRefInput(`UPI-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleConfirmSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingPair) return;

    const newSettlement = recordSettlement({
      roomId: currentRoom.id,
      fromUserId: settlingPair.fromId,
      toUserId: settlingPair.toId,
      amount: settlingPair.amount,
      status: 'completed',
      upiReference: upiRefInput.trim() || undefined,
    });

    markSettlementCompleted(newSettlement.id, upiRefInput.trim() || undefined);
    setSettlingPair(null);
    setUpiRefInput('');
  };

  return (
    <div className="glass-card mb-6 p-4 md:p-6 rounded-3xl space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Computed Balances & Visual Debt Graph Matrix</span>
          </h2>
          <p className="text-xs text-slate-400">
            Greedy min-cash-flow algorithm reducing multi-person transactions down to maximum (N - 1) transfers
          </p>
        </div>
      </div>

      {/* Visual Debt Graph & Mode Switcher */}
      <VisualDebtGraph
        instructions={instructions}
        rawBalances={rawBalances}
        members={currentRoom.members}
        onSettleClick={handleSettleUpClick}
      />

      {/* Completed Settlement History */}
      {roomSettlements.length > 0 && (
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Settlement History ({roomSettlements.length})
          </h3>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {roomSettlements.map((s) => {
              const fromName = currentRoom.members.find((m) => m.id === s.fromUserId)?.name || 'Member';
              const toName = currentRoom.members.find((m) => m.id === s.toUserId)?.name || 'Member';

              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-xs bg-slate-900/40 px-3.5 py-2 rounded-xl border border-slate-800/60 gap-3"
                >
                  <div className="flex items-center gap-2 text-slate-300 min-w-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">
                      <strong className="text-white">{fromName}</strong> paid <strong className="text-white">{toName}</strong>
                    </span>
                    {s.upiReference && (
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">Ref: {s.upiReference}</span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-emerald-400 shrink-0">
                    ₹{s.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settle Up Confirmation Modal */}
      {settlingPair && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-sans">
          <div className="glass-card w-full max-w-md p-6 bg-slate-900 border-slate-700 rounded-3xl space-y-4 shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Record Settlement</h3>
              <p className="text-xs text-slate-400">
                Confirm payment of <strong className="text-emerald-400 font-mono">₹{settlingPair.amount}</strong> to settle debt.
              </p>
            </div>

            <form onSubmit={handleConfirmSettlement} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  UPI Transaction Reference (Optional)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="e.g. UPI-9876543210"
                    value={upiRefInput}
                    onChange={(e) => setUpiRefInput(e.target.value)}
                    className="w-full bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 pr-10"
                  />
                  <QrCode className="w-4 h-4 text-slate-500 absolute right-3.5 shrink-0 pointer-events-none" />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSettlingPair(null)}
                  className="btn-secondary text-xs py-2.5 px-4 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2.5 px-4 shadow-lg cursor-pointer">
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
