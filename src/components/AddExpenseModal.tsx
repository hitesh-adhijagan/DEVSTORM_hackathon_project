import React, { useState } from 'react';
import { useDivvyStore } from '../store/useDivvyStore';
import type { ExpenseCategory, ExpenseSplitType, ExpenseItem, RegretTag } from '../types';
import { X, Sparkles, Check } from 'lucide-react';
import { generateUUID } from '../utils/codeGenerator';
import { SmartItemizedSplitForm } from './SmartItemizedSplitForm';
import { formatCurrency } from '../utils/currencyFormatter';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const currentRoom = useDivvyStore((state) => state.currentRoom);
  const currentUser = useDivvyStore((state) => state.currentUser);
  const addExpense = useDivvyStore((state) => state.addExpense);

  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [paidById, setPaidById] = useState<string>(currentUser?.id || '');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [splitType, setSplitType] = useState<ExpenseSplitType>('equal');
  const paidFromPool = currentRoom?.mode === 'prepaid_kitty';

  // New Features state
  const [isVegOnly, setIsVegOnly] = useState<boolean>(false);
  const [regretTag, setRegretTag] = useState<RegretTag>('worth_it');
  const [optedInMembers, setOptedInMembers] = useState<string[]>(
    currentRoom?.members.map(m => m.id) || []
  );

  // Itemized split state
  const [taxAndTip, setTaxAndTip] = useState<number>(0);
  const [autoDistributeTax, setAutoDistributeTax] = useState<boolean>(true);
  const [items, setItems] = useState<ExpenseItem[]>([
    {
      id: generateUUID(),
      name: '',
      amount: 0,
      dietaryTag: 'general',
      consumedBy: currentRoom?.members.map((m) => m.id) || [],
    },
  ]);

  if (!isOpen || !currentRoom) return null;

  const toggleMemberOpt = (memberId: string) => {
    setOptedInMembers(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = typeof totalAmount === 'number' ? totalAmount : 0;
    if (!title.trim() || finalAmount <= 0 || !paidById) return;

    let formattedItems: ExpenseItem[] = [];

    if (splitType !== 'equal') {
      formattedItems = items
        .filter((itm) => itm.name.trim() && itm.amount > 0)
        .map((itm) => ({
          ...itm,
          id: itm.id || generateUUID(),
          name: itm.name.trim(),
        }));
    }

    addExpense({
      roomId: currentRoom.id,
      title: title.trim(),
      totalAmount: finalAmount,
      paidById,
      category,
      splitType,
      items: formattedItems,
      optedInMembers,
      isVegOnly,
      regretTag,
      taxAndTip,
      autoDistributeTax,
      paidFromPool,
    });

    // Reset & close
    setTitle('');
    setTotalAmount('');
    setTaxAndTip(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto font-sans">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl p-6 rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 text-white">
        
        {/* Quick Feature Guide Banner */}
        <div className="bg-[#1E3A5F] border border-indigo-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-indigo-200 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Sparkles size={16} className="text-amber-400 shrink-0" />
            <span><strong>Smart Expense Logger:</strong> Add multi-payer splits, opt-in/opt-out members, veg/non-veg tags, and regret badges.</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Expense Title</label>
            <input
              type="text"
              placeholder="e.g. Dinner at Shack, Hotel Stay, Scooter Fuel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4A90E2]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Total Amount ({formatCurrency(0, currentRoom.currency)[0]})
              </label>
              <input
                type="number"
                placeholder="e.g. 2400"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value ? parseFloat(e.target.value) : '')}
                required
                min="1"
                className="bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-[#4A90E2]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Primary Payer</label>
              <select
                value={paidById}
                onChange={(e) => setPaidById(e.target.value)}
                className="bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#4A90E2]"
              >
                {currentRoom.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.id === currentUser?.id ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Feature #5: 1-Tap Opt-In / Opt-Out Roommates */}
          <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-xs">
            <span className="text-slate-300 font-semibold block">
              1-Tap Member Opt-In / Opt-Out (Feature #5)
            </span>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {currentRoom.members.map(m => {
                const isOptedIn = optedInMembers.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMemberOpt(m.id)}
                    className={`text-[11px] px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                      isOptedIn
                        ? 'bg-[#1E3A5F] border-[#4A90E2] text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
                    }`}
                  >
                    <span>{m.name}</span>
                    {isOptedIn ? <Check size={12} className="text-[#74C69D] shrink-0" /> : <span className="text-slate-400">+</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature #6 & #8: Veg/Non-Veg & Regret Tagging */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Veg / Non-Veg Dish Filter (Feature #6)
              </label>
              <button
                type="button"
                onClick={() => setIsVegOnly(!isVegOnly)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  isVegOnly
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-700 text-rose-300'
                }`}
              >
                <span>{isVegOnly ? '🟢 100% Pure Veg' : '🔴 Non-Veg Included'}</span>
                <span className="text-[10px] opacity-80 font-normal">{isVegOnly ? 'Auto-Excludes Non-Veg' : 'Includes All'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Regret Tagging Vibe (Feature #8)
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setRegretTag('worth_it')}
                  className={`p-2 rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                    regretTag === 'worth_it' ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-sm' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  🔥 Worth It
                </button>
                <button
                  type="button"
                  onClick={() => setRegretTag('necessary')}
                  className={`p-2 rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                    regretTag === 'necessary' ? 'bg-indigo-950 border-indigo-500 text-indigo-300 shadow-sm' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  🤷 Necessary
                </button>
                <button
                  type="button"
                  onClick={() => setRegretTag('mistake')}
                  className={`p-2 rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                    regretTag === 'mistake' ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-sm' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  💀 Mistake
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#4A90E2]"
              >
                <option value="food">Food & Dining 🍔</option>
                <option value="travel">Travel & Transport 🛵</option>
                <option value="stay">Stay & Hotel 🏖️</option>
                <option value="utilities">Utilities & Bills 💡</option>
                <option value="groceries">Household Groceries 🛒</option>
                <option value="other">Other / Misc 📦</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Split Method</label>
              <select
                value={splitType}
                onChange={(e) => setSplitType(e.target.value as ExpenseSplitType)}
                className="bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#4A90E2]"
              >
                <option value="equal">Equal Split</option>
                <option value="itemized">Itemized Breakdown</option>
                <option value="smart_dietary">Smart Dietary (Veg/Non-Veg)</option>
              </select>
            </div>
          </div>

          {/* Smart Itemized Split Form */}
          {splitType !== 'equal' && (
            <SmartItemizedSplitForm
              items={items}
              members={currentRoom.members}
              totalAmount={typeof totalAmount === 'number' ? totalAmount : 0}
              taxAndTip={taxAndTip}
              autoDistributeTax={autoDistributeTax}
              onItemsChange={setItems}
              onTaxAndTipChange={setTaxAndTip}
              onAutoDistributeTaxChange={setAutoDistributeTax}
            />
          )}

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#4A90E2] hover:bg-blue-600 text-white text-xs font-bold shadow-lg transition-all cursor-pointer">
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
