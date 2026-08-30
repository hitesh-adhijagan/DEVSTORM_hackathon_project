import React from 'react';
import { Settings, X, Globe, Check } from 'lucide-react';
import type { CurrencyCode } from '../types';

interface CurrencyPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  onChangeCurrency: (currency: CurrencyCode) => void;
}

const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
];

export const CurrencyPreferencesModal: React.FC<CurrencyPreferencesModalProps> = ({
  isOpen,
  onClose,
  currency,
  onChangeCurrency,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg cursor-pointer z-10"
        >
          <X size={18} />
        </button>

        {/* Quick Feature Guide Banner */}
        <div className="bg-indigo-950/60 border border-indigo-700/50 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-indigo-300 shadow-sm">
          <Globe size={16} className="text-indigo-400 shrink-0" />
          <span><strong>Currency & Preferences:</strong> Select base currency (INR ₹, USD $, EUR €, GBP £) and default split behaviors for trips vs. apartments.</span>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold flex items-center justify-center gap-2">
            <Settings className="text-indigo-400 shrink-0" size={18} />
            <span>Group Currency & Preferences</span>
          </h2>
          <p className="text-xs text-slate-400">Updates currency symbol across all ledgers & settlements.</p>
        </div>

        {/* Currency Selection Options */}
        <div className="space-y-2">
          <label className="text-xs text-slate-300 font-semibold block">Base Group Currency</label>
          <div className="grid grid-cols-2 gap-2.5">
            {CURRENCIES.map(curr => {
              const isSelected = currency === curr.code;
              return (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => onChangeCurrency(curr.code)}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E3A5F] border-[#4A90E2] text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-sm text-[#4A90E2] shrink-0">
                      {curr.symbol}
                    </span>
                    <div className="text-left min-w-0">
                      <span className="text-xs font-bold block text-white">{curr.code}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{curr.label}</span>
                    </div>
                  </div>
                  {isSelected && <Check size={16} className="text-[#74C69D] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#4A90E2] hover:bg-indigo-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  );
};
