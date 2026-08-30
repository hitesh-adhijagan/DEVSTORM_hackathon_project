import React, { useState } from 'react';
import { useDivvyStore } from '../store/useDivvyStore';
import {
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Wallet,
  Coins,
  ArrowUpRight,
  Edit2,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

export const KittyPoolView: React.FC = () => {
  const currentRoom = useDivvyStore((state) => state.currentRoom);
  const kittyPool = useDivvyStore((state) => state.kittyPool);
  const initKittyPool = useDivvyStore((state) => state.initKittyPool);
  const updateKittyTarget = useDivvyStore((state) => state.updateKittyTarget);
  const toggleMemberContributionStatus = useDivvyStore(
    (state) => state.toggleMemberContributionStatus
  );
  const recordKittyRefund = useDivvyStore((state) => state.recordKittyRefund);
  const getKittySummary = useDivvyStore((state) => state.getKittySummary);

  const [targetInput, setTargetInput] = useState<number | ''>(5000);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [editTargetVal, setEditTargetVal] = useState<number | ''>(5000);

  if (!currentRoom || currentRoom.mode !== 'prepaid_kitty') return null;

  const summary = getKittySummary();

  const handleInit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = typeof targetInput === 'number' ? targetInput : 0;
    if (target > 0) {
      initKittyPool(target);
    }
  };

  const handleSaveTarget = () => {
    const val = typeof editTargetVal === 'number' ? editTargetVal : 0;
    if (val > 0) {
      updateKittyTarget(val);
      setIsEditingTarget(false);
    }
  };

  return (
    <div className="glass-card mb-6 border-amber-500/30 bg-slate-900/80 p-4 md:p-6 rounded-3xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="space-y-0.5">
          <h2 className="text-lg font-extrabold text-amber-400 flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Prepaid Trip Pool / Kitty Engine</span>
          </h2>
          <p className="text-xs text-slate-400">
            Common pool fund tracking, live expense deductions, and automated refund math
          </p>
        </div>

        {kittyPool && (
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 shrink-0">
            <span className="text-xs text-slate-400 font-semibold">Target / Person:</span>
            {isEditingTarget ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={editTargetVal}
                  onChange={(e) => setEditTargetVal(e.target.value ? parseFloat(e.target.value) : '')}
                  className="w-20 text-xs py-1 px-2 font-mono bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveTarget}
                  className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded-lg cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingTarget(false)}
                  className="p-1 text-slate-400 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-bold text-amber-300">
                  ₹{kittyPool.targetPerPerson.toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => {
                    setEditTargetVal(kittyPool.targetPerPerson);
                    setIsEditingTarget(true);
                  }}
                  className="text-slate-400 hover:text-amber-400 p-1 rounded-lg cursor-pointer transition-colors"
                  title="Edit Target Per Person"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {!kittyPool ? (
        <form onSubmit={handleInit} className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4 max-w-md mx-auto">
          <div className="text-center space-y-1">
            <Coins className="w-8 h-8 text-amber-400 mx-auto shrink-0" />
            <h4 className="text-base font-bold text-white">Setup Baseline Kitty Target</h4>
            <p className="text-xs text-slate-400">Set equal target contribution amount for each group member</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Target Contribution (₹/person)</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value ? parseFloat(e.target.value) : '')}
              required
              className="w-full bg-slate-900 border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-center text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button type="submit" className="btn-primary text-xs w-full justify-center py-3 rounded-xl shadow-lg cursor-pointer">
            Initialize Kitty Pool (₹{typeof targetInput === 'number' ? targetInput.toLocaleString('en-IN') : 0}/person)
          </button>
        </form>
      ) : (
        <>
          {/* Live Pool Balance Stat Widgets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-0.5">
              <div className="text-[11px] font-semibold text-slate-400">Total Collected</div>
              <div className="text-base font-extrabold text-emerald-400 font-mono">
                ₹{summary?.totalCollected.toLocaleString('en-IN') || 0}
              </div>
              <div className="text-[10px] text-slate-500">
                Target: ₹{summary?.totalTarget.toLocaleString('en-IN') || 0}
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-0.5">
              <div className="text-[11px] font-semibold text-slate-400">Pool Expenses Spent</div>
              <div className="text-base font-extrabold text-rose-400 font-mono">
                ₹{summary?.totalSpent.toLocaleString('en-IN') || 0}
              </div>
              <div className="text-[10px] text-slate-500">Deducted live</div>
            </div>

            <div className={`p-3.5 rounded-2xl border space-y-0.5 ${
              summary?.isDeficit
                ? 'bg-rose-500/10 border-rose-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}>
              <div className="text-[11px] font-semibold text-slate-300">
                {summary?.isDeficit ? 'Deficit Pool Balance' : 'Remaining Pool Balance'}
              </div>
              <div className={`text-base font-extrabold font-mono ${
                summary?.isDeficit ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {summary?.isDeficit
                  ? `-₹${summary.totalDeficit.toLocaleString('en-IN')}`
                  : `₹${summary?.currentPoolBalance.toLocaleString('en-IN') || 0}`}
              </div>
              <div className="text-[10px] text-slate-400">
                {summary?.isDeficit ? 'Pool overspent!' : 'Available in kitty'}
              </div>
            </div>

            <div className="bg-indigo-600/10 p-3.5 rounded-2xl border border-indigo-500/30 space-y-0.5">
              <div className="text-[11px] font-semibold text-indigo-300">Remaining / Active Member</div>
              <div className="text-base font-extrabold text-indigo-400 font-mono">
                ₹{summary?.perPersonRemaining.toLocaleString('en-IN') || 0}
              </div>
              <div className="text-[10px] text-slate-400">
                {currentRoom.members.length} members in room
              </div>
            </div>
          </div>

          {/* Member Contribution Tracker Grid */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Member Contribution Tracker (₹{kittyPool.targetPerPerson}/person)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {summary?.memberStatuses.filter((m) => m.isPaid).length} / {currentRoom.members.length} Paid
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {currentRoom.members.map((member) => {
                const statusInfo = summary?.memberStatuses.find((m) => m.userId === member.id);
                const isPaid = statusInfo?.isPaid || false;

                return (
                  <div
                    key={member.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                      isPaid
                        ? 'bg-slate-950/70 border-emerald-500/40'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white truncate">{member.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase shrink-0 ${
                          isPaid
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-400">
                      Paid: <span className="font-bold text-white">₹{isPaid ? kittyPool.targetPerPerson : 0}</span>
                    </div>

                    <button
                      onClick={() => toggleMemberContributionStatus(member.id, !isPaid)}
                      className={`w-full py-2 text-xs rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isPaid
                          ? 'bg-slate-800 text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md'
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Mark Unpaid</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                          <span>Mark as Paid</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auto-Settler & Refund Engine Section */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Auto-Settler & Refund Engine</span>
              </h3>

              {summary?.isDeficit && (
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/30">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Deficit Top-Up Required: ₹{summary.deficitPerMember}/member</span>
                </span>
              )}
            </div>

            <div className="space-y-2">
              {summary?.memberStatuses.map((m) => {
                const isRefund = m.refundOrDeficitAmount > 0.01;
                const isDeficit = m.refundOrDeficitAmount < -0.01;

                return (
                  <div
                    key={m.userId}
                    className={`flex flex-wrap items-center justify-between text-xs p-3.5 rounded-2xl border gap-3 ${
                      isRefund
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : isDeficit
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isRefund ? 'bg-emerald-500/20 text-emerald-300' : isDeficit ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {m.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm truncate">{m.userName}</span>
                          {m.userUpiId && (
                            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40 shrink-0">
                              UPI: {m.userUpiId}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Contributed: ₹{m.totalPaid} | Share of Pool Expenses: ₹{m.individualExpenseShare}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-auto">
                      <div className="text-right">
                        <div
                          className={`font-mono font-extrabold text-sm ${
                            isRefund
                              ? 'text-emerald-400'
                              : isDeficit
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {isRefund
                            ? `Refund Due: ₹${m.refundOrDeficitAmount.toLocaleString('en-IN')}`
                            : isDeficit
                            ? `Deficit Top-Up: ₹${Math.abs(m.refundOrDeficitAmount).toLocaleString('en-IN')}`
                            : 'Fully Settled 🎉'}
                        </div>
                      </div>

                      {isRefund && (
                        <button
                          onClick={() => recordKittyRefund(m.userId, m.refundOrDeficitAmount)}
                          className="btn-primary text-xs py-2 px-3 bg-emerald-600 hover:bg-emerald-500 cursor-pointer shadow-md"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                          <span>Settle Refund</span>
                        </button>
                      )}

                      {isDeficit && (
                        <button
                          onClick={() => toggleMemberContributionStatus(m.userId, true, m.targetAmount + Math.abs(m.refundOrDeficitAmount))}
                          className="btn-secondary text-xs py-2 px-3 border-rose-500/40 text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>Record Top-Up Payment</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
