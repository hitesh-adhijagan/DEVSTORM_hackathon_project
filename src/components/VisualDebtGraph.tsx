import React, { useState } from 'react';
import type { SettlementInstruction, User } from '../types';
import { type UserBalance, verifyZeroSumInvariant } from '../utils/balanceCalculator';
import { ArrowRight, CheckCircle2, QrCode, ShieldCheck, Zap, Layers, DollarSign } from 'lucide-react';
import { UPISettlementModal } from './UPISettlementModal';

interface VisualDebtGraphProps {
  instructions: SettlementInstruction[];
  rawBalances: Record<string, UserBalance>;
  members: User[];
  onSettleClick: (fromUserId: string, toUserId: string, amount: number) => void;
}

export const VisualDebtGraph: React.FC<VisualDebtGraphProps> = ({
  instructions,
  rawBalances,
}) => {
  const [viewMode, setViewMode] = useState<'simplified' | 'raw'>('simplified');
  const [activeModalPair, setActiveModalPair] = useState<{ sender: User; receiver: User; amount: number } | null>(null);

  const zeroSumInfo = verifyZeroSumInvariant(rawBalances);

  return (
    <div className="space-y-4">
      {/* View Switcher & Zero-Sum Invariant Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('simplified')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'simplified'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Simplified Min-Cash-Flow ({instructions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('raw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'raw'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>Raw Net Balances</span>
          </button>
        </div>

        {/* Zero-Sum Invariant Badge */}
        <div
          className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl border font-semibold ${
            zeroSumInfo.isZeroSum
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
          title="Mathematical invariant: Total money paid across group equals total owed"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Zero-Sum Invariant: ₹{zeroSumInfo.sum.toFixed(2)}</span>
          {zeroSumInfo.isZeroSum && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
        </div>
      </div>

      {/* View Mode 1: Simplified Min-Cash-Flow Visual Debt Graph */}
      {viewMode === 'simplified' ? (
        <div className="space-y-3">
          {instructions.length === 0 ? (
            <div className="text-center py-8 text-xs text-emerald-400 font-bold bg-slate-950/40 rounded-2xl border border-slate-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>All room balances are 100% settled! No pending debt transfers.</span>
            </div>
          ) : (
            instructions.map((inst, index) => (
              <div
                key={index}
                className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-wrap items-center justify-between gap-4 shadow-lg"
              >
                {/* Sender (Debtor) Node */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center font-bold text-sm text-rose-300 shadow-md shrink-0">
                    {inst.sender.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-white text-sm block leading-none">{inst.sender.name}</span>
                    <span className="text-[10px] uppercase font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 inline-block">
                      Debtor (Pays)
                    </span>
                  </div>
                </div>

                {/* Flow Arrow & Payment Badge */}
                <div className="flex flex-col items-center flex-1 min-w-[140px] px-2 space-y-1">
                  <div className="text-xs font-mono font-extrabold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1 shadow-inner shrink-0">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>₹{inst.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full flex items-center my-0.5">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-rose-500/60 via-amber-500/60 to-emerald-500/60"></div>
                    <ArrowRight className="w-4 h-4 text-emerald-400 -ml-1 shrink-0" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Direct Min-Transfer</span>
                </div>

                {/* Receiver (Creditor) Node */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="space-y-0.5 text-right">
                    <span className="font-bold text-white text-sm block leading-none">{inst.receiver.name}</span>
                    <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 inline-block">
                      Creditor (Receives)
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-sm text-emerald-300 shadow-md shrink-0">
                    {inst.receiver.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Settle via UPI Button */}
                <div className="w-full sm:w-auto flex justify-end shrink-0">
                  <button
                    onClick={() => setActiveModalPair({ sender: inst.sender, receiver: inst.receiver, amount: inst.amount })}
                    className="btn-primary text-xs py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 shadow-md cursor-pointer rounded-xl"
                  >
                    <QrCode className="w-3.5 h-3.5 shrink-0" />
                    <span>Settle via UPI</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* View Mode 2: Raw Net Balances Grid */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.values(rawBalances).map((b) => {
            const isCreditor = b.netBalance > 0.01;
            const isDebtor = b.netBalance < -0.01;

            return (
              <div
                key={b.userId}
                className={`p-3.5 rounded-2xl border space-y-1 ${
                  isCreditor
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : isDebtor
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="text-xs font-bold text-white truncate">{b.userName}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Paid: ₹{Math.round(b.totalPaid)} | Share: ₹{Math.round(b.totalOwed)}
                </div>
                <div
                  className={`text-sm font-extrabold font-mono ${
                    isCreditor
                      ? 'text-emerald-400'
                      : isDebtor
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {isCreditor
                    ? `+₹${b.netBalance.toLocaleString('en-IN')}`
                    : isDebtor
                    ? `-₹${Math.abs(b.netBalance).toLocaleString('en-IN')}`
                    : 'Settled 🎉'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPI Settlement Modal */}
      {activeModalPair && (
        <UPISettlementModal
          isOpen={true}
          sender={activeModalPair.sender}
          receiver={activeModalPair.receiver}
          amount={activeModalPair.amount}
          onClose={() => setActiveModalPair(null)}
        />
      )}
    </div>
  );
};
