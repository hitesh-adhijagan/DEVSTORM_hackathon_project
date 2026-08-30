import React, { useState } from 'react';
import { Plane, Users, Wallet, Sparkles } from 'lucide-react';
import type { User } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';

interface LivingDynamicsViewProps {
  members: User[];
  currency?: 'INR' | 'USD' | 'EUR' | 'GBP';
  onUpdateVacation: (userId: string, isAway: boolean, startDate?: string, endDate?: string) => void;
  onUpdateGuest: (userId: string, active: boolean, guestCount: number, guestDays: number) => void;
}

export const LivingDynamicsView: React.FC<LivingDynamicsViewProps> = ({
  members,
  currency = 'INR',
  onUpdateVacation,
  onUpdateGuest,
}) => {
  // Kitty state demo
  const [kittyTarget] = useState(4000);
  const [paidMembers] = useState<string[]>(['1', '2', '3', '4']);
  const [spentPool] = useState(6400);

  const totalCollected = paidMembers.length * kittyTarget;
  const remainingPool = totalCollected - spentPool;
  const refundPerPerson = paidMembers.length > 0 ? remainingPool / paidMembers.length : 0;

  return (
    <div className="space-y-4 font-sans text-slate-900 dark:text-white">
      {/* Contextual Feature Quick Guide Header */}
      <div className="bg-[#1E3A5F]/10 dark:bg-slate-800/60 border border-[#1E3A5F]/20 dark:border-slate-700 text-[#1E3A5F] dark:text-indigo-300 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 font-medium shadow-sm">
        <Sparkles size={16} className="text-[#4A90E2] shrink-0" />
        <span><strong>Living Dynamics & Adaptive Modifiers:</strong> Configure Vacation Away Mode, Guest scaling multipliers, and Prepaid Trip Pool wallets.</span>
      </div>

      {/* --- FEATURE 14: VACATION (AWAY) MODE --- */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl text-[#4A90E2] flex items-center justify-center shrink-0">
              <Plane size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Vacation (Away) Mode (Feature 14)</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Auto-excludes away roommates from daily recurring bills & groceries.</p>
            </div>
          </div>
          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 border border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full font-mono font-bold shrink-0">
            Feature 14
          </span>
        </div>

        <div className="space-y-2">
          {members.map(m => {
            const isAway = m.vacation?.isAway || false;
            return (
              <div key={m.id} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white truncate">{m.name}</span>
                  {isAway ? (
                    <span className="bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold shrink-0">
                      <Plane size={10} className="shrink-0" /> Away: Jun 10–20
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium shrink-0">Present at House</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onUpdateVacation(m.id, !isAway, '2026-06-10', '2026-06-20')}
                  className={`text-[10px] px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer shrink-0 ${
                    isAway
                      ? 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {isAway ? 'Set Present' : 'Toggle Away Mode'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- FEATURE 18: GUEST MODE (+N GUESTS FOR X DAYS) --- */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[#2D6A4F] dark:text-[#74C69D] flex items-center justify-center shrink-0">
              <Users size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Guest Mode (+N Guests for X Days) (Feature 18)</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Scales up utility & grocery shares when guests stay over.</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-[#2D6A4F] dark:text-[#74C69D] px-2 py-0.5 rounded-full font-mono font-bold shrink-0">
            Feature 18
          </span>
        </div>

        <div className="space-y-2">
          {members.map(m => {
            const hasGuests = m.guestModifier?.active || false;
            const count = m.guestModifier?.guestCount || 2;
            const days = m.guestModifier?.guestDays || 3;

            return (
              <div key={m.id} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs gap-3">
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white block truncate">{m.name}</span>
                  {hasGuests ? (
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block truncate">
                      +{count} Guests for {days} Days (Share Multiplier 1.5x)
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Standard 1x Share</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onUpdateGuest(m.id, !hasGuests, 2, 3)}
                  className={`text-[10px] px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer shrink-0 ${
                    hasGuests
                      ? 'bg-amber-500 border-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {hasGuests ? 'Remove Guests' : '+ Add Guests'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- FEATURE 12: PREPAID TRIPS POOL --- */}
      <div className="bg-[#1E3A5F] dark:bg-slate-950 border border-[#1E3A5F] dark:border-slate-800 rounded-3xl p-5 shadow-md space-y-4 text-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-[#4A90E2] shrink-0" />
              <span className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Prepaid Trip Pool Wallet</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white font-mono mt-1 leading-tight">
              {formatCurrency(remainingPool, currency)}
            </h2>
            <span className="text-[10px] text-indigo-200 block mt-0.5">Remaining Balance from {formatCurrency(totalCollected, currency)} initial pool</span>
          </div>
          <span className="bg-white/15 border border-white/20 text-[#74C69D] text-xs px-3 py-1 rounded-full flex items-center gap-1 font-bold shrink-0">
            <Sparkles size={12} className="shrink-0" /> Auto-Refund Active
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-indigo-200 font-mono">
            <span>Spent: {formatCurrency(spentPool, currency)}</span>
            <span>Target: {formatCurrency(totalCollected, currency)}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#4A90E2] h-full rounded-full transition-all duration-500"
              style={{ width: `${(spentPool / totalCollected) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Auto Equal Refund Card */}
        <div className="bg-white/10 border border-white/15 rounded-2xl p-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-white">Equal End-of-Trip Refund</p>
            <span className="text-[10px] text-indigo-200">Distributed across 4 contributors</span>
          </div>
          <div className="text-right shrink-0">
            <span className="font-mono font-extrabold text-base text-[#74C69D] block">{formatCurrency(refundPerPerson, currency)}</span>
            <span className="block text-[9px] text-indigo-200">/ person</span>
          </div>
        </div>
      </div>
    </div>
  );
};
