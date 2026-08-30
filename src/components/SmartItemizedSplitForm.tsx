import React from 'react';
import type { ExpenseItem, ItemDietaryTag, User, UserOwesShare } from '../types';
import { autoAssignByDietaryTags, computeNormalizedShareBreakdown } from '../utils/itemizedSplitCalculator';
import { Plus, Trash2, Filter, CheckCircle2, AlertCircle, Sparkles, Percent } from 'lucide-react';

interface SmartItemizedSplitFormProps {
  items: ExpenseItem[];
  members: User[];
  totalAmount: number;
  taxAndTip: number;
  autoDistributeTax: boolean;
  onItemsChange: (items: ExpenseItem[]) => void;
  onTaxAndTipChange: (val: number) => void;
  onAutoDistributeTaxChange: (val: boolean) => void;
}

const TAG_BADGES: Record<ItemDietaryTag, { label: string; color: string }> = {
  general: { label: 'General', color: 'bg-slate-800 text-slate-300 border-slate-700' },
  veg: { label: '🥗 Veg', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  non_veg: { label: '🍗 Non-Veg', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  alcohol: { label: '🍺 Alcohol', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
};

export const SmartItemizedSplitForm: React.FC<SmartItemizedSplitFormProps> = ({
  items,
  members,
  totalAmount,
  taxAndTip,
  autoDistributeTax,
  onItemsChange,
  onTaxAndTipChange,
  onAutoDistributeTaxChange,
}) => {
  const handleAddItem = () => {
    onItemsChange([
      ...items,
      {
        id: `itm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: '',
        amount: 0,
        dietaryTag: 'general',
        consumedBy: members.map((m) => m.id),
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const handle1TapAutoAssign = () => {
    const autoAssigned = autoAssignByDietaryTags(items, members);
    onItemsChange(autoAssigned);
  };

  const handleToggleConsumer = (itemIndex: number, userId: string) => {
    const updated = [...items];
    const currentConsumers = updated[itemIndex].consumedBy || [];
    if (currentConsumers.includes(userId)) {
      updated[itemIndex].consumedBy = currentConsumers.filter((id) => id !== userId);
    } else {
      updated[itemIndex].consumedBy = [...currentConsumers, userId];
    }
    onItemsChange(updated);
  };

  // Compute normalized share breakdown array [{ userId, userName, itemSubtotal, taxAndTipShare, owesAmount }]
  const normalizedShares: UserOwesShare[] = computeNormalizedShareBreakdown(
    items,
    members,
    totalAmount,
    taxAndTip,
    autoDistributeTax
  );

  const itemsSubtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const calculatedTotal = itemsSubtotal + (autoDistributeTax ? taxAndTip : 0);
  const totalDiff = Math.abs(totalAmount - calculatedTotal);
  const isVerified = totalAmount > 0 && totalDiff < 0.01;

  return (
    <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
      {/* Header & 1-Tap Auto-Assign Filter */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Smart Itemized Breakdown & Exclusion Grid</span>
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Tag items by dietary type & auto-distribute tax/tip proportionally
          </p>
        </div>

        <button
          type="button"
          onClick={handle1TapAutoAssign}
          className="btn-secondary text-[11px] py-1.5 px-3 bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30 transition-all cursor-pointer"
          title="Auto-assign items based on member dietary preferences (Veg, No Alcohol)"
        >
          <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>1-Tap Auto-Assign Filter</span>
        </button>
      </div>

      {/* Item Breakdown List */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {items.map((item, idx) => {
          const currentTag = item.dietaryTag || 'general';

          return (
            <div key={item.id || idx} className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Line Item (e.g. Tiger Prawns, Paneer Masala)"
                  value={item.name}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[idx].name = e.target.value;
                    onItemsChange(updated);
                  }}
                  className="text-xs flex-1 min-w-[140px] bg-slate-900 border-slate-800 rounded-xl px-3 py-2 text-white"
                />

                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={item.amount || ''}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[idx].amount = parseFloat(e.target.value) || 0;
                    onItemsChange(updated);
                  }}
                  className="w-28 text-xs font-mono bg-slate-900 border-slate-800 rounded-xl px-3 py-2 text-white"
                />

                {/* Dietary Tag Selector */}
                <select
                  value={currentTag}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[idx].dietaryTag = e.target.value as ItemDietaryTag;
                    onItemsChange(updated);
                  }}
                  className="w-32 text-xs py-2 px-2.5 border-slate-800 bg-slate-900 text-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="general">General</option>
                  <option value="veg">🥗 Veg</option>
                  <option value="non_veg">🍗 Non-Veg</option>
                  <option value="alcohol">🍺 Alcohol</option>
                </select>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Selectable Member Avatars */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Select Consumers ({item.consumedBy?.length || 0} selected):
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${TAG_BADGES[currentTag].color}`}>
                    {TAG_BADGES[currentTag].label}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {members.map((member) => {
                    const isSelected = item.consumedBy?.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleToggleConsumer(idx, member.id)}
                        className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer font-medium ${
                          isSelected
                            ? 'bg-indigo-600/90 text-white border-indigo-400 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {member.name}
                        {member.dietaryPreference === 'veg_only' && ' 🥗'}
                        {member.dietaryPreference === 'no_alcohol' && ' 🚫🍺'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAddItem}
        className="btn-secondary text-xs w-full justify-center py-2.5 rounded-xl border-dashed border-slate-700 hover:border-indigo-500 transition-colors"
      >
        <Plus className="w-3.5 h-3.5 shrink-0" />
        <span>Add Line Item</span>
      </button>

      {/* Tax / Service Charge Field & Proportional Distribution Toggle */}
      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Tax, Tip & Service Charge (₹)</span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoTaxToggle"
              checked={autoDistributeTax}
              onChange={(e) => onAutoDistributeTaxChange(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 accent-indigo-600 cursor-pointer"
            />
            <label htmlFor="autoTaxToggle" className="text-[11px] font-semibold text-indigo-300 cursor-pointer">
              Auto-distribute Tax/Tip proportionally
            </label>
          </div>
        </div>

        <input
          type="number"
          placeholder="e.g. 250 (Tax, tip, delivery fee)"
          value={taxAndTip || ''}
          onChange={(e) => onTaxAndTipChange(parseFloat(e.target.value) || 0)}
          className="text-xs font-mono bg-slate-900 border-slate-800 rounded-xl px-3.5 py-2 text-white"
        />
      </div>

      {/* Real-time Verification Bar */}
      <div
        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
          isVerified
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {isVerified ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <div>
            <span className="font-bold block">
              {isVerified ? 'Total Verified ✓' : 'Total Amount Verification Warning'}
            </span>
            <span className="text-[11px] opacity-80">
              Items (₹{itemsSubtotal}) + Tax/Tip (₹{taxAndTip}) = ₹{calculatedTotal}{' '}
              {totalAmount > 0 && `| Expense Total: ₹${totalAmount}`}
            </span>
          </div>
        </div>

        {!isVerified && totalAmount > 0 && (
          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
            Diff: ₹{totalDiff.toFixed(2)}
          </span>
        )}
      </div>

      {/* Output Data Structure: Normalized User Share Matrix */}
      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Normalized Output Breakdown Matrix (`UserOwesShare[]`)
        </h5>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {normalizedShares.map((share) => (
            <div
              key={share.userId}
              className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs"
            >
              <span className="font-bold text-white block truncate">{share.userName}</span>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Item: ₹{share.itemSubtotal} | Tax: ₹{share.taxAndTipShare}
              </div>
              <div className="text-xs font-mono font-extrabold text-indigo-400 mt-1">
                Owes: ₹{share.owesAmount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
