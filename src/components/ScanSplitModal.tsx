import React, { useState } from 'react';
import { Camera, Upload, X, Check, Sparkles } from 'lucide-react';
import type { User, ExpenseItem } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';

interface ScanSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: User[];
  currency?: 'INR' | 'USD' | 'EUR' | 'GBP';
  onAddScannedExpense: (title: string, total: number, items: ExpenseItem[]) => void;
}

const MOCK_SCANNED_ITEMS: ExpenseItem[] = [
  { id: 'ocr-1', name: 'Woodfired Truffle Pizza 🍕', amount: 850, consumedBy: ['1', '2', '3', '4'], dietaryTag: 'veg' },
  { id: 'ocr-2', name: 'Grilled Chicken Tacos 🌮', amount: 650, consumedBy: ['1', '4'], dietaryTag: 'non_veg' },
  { id: 'ocr-3', name: 'Craft IPA Beer Pitcher 🍺', amount: 900, consumedBy: ['1', '3', '4'], dietaryTag: 'alcohol' },
  { id: 'ocr-4', name: 'Sparkling Mineral Water 💧', amount: 200, consumedBy: ['1', '2', '3', '4'], dietaryTag: 'general' },
];

export const ScanSplitModal: React.FC<ScanSplitModalProps> = ({
  isOpen,
  onClose,
  members,
  currency = 'INR',
  onAddScannedExpense
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<ExpenseItem[]>([]);
  const [receiptName, setReceiptName] = useState('Bistro Dinner Bill 🧾');

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedItems(MOCK_SCANNED_ITEMS);
    }, 1500);
  };

  const toggleItemConsumption = (itemId: string, memberId: string) => {
    setScannedItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const exists = item.consumedBy.includes(memberId);
      return {
        ...item,
        consumedBy: exists
          ? item.consumedBy.filter(id => id !== memberId)
          : [...item.consumedBy, memberId]
      };
    }));
  };

  const totalBillAmount = scannedItems.reduce((sum, item) => sum + item.amount, 0);

  const handleSaveScannedBill = () => {
    if (scannedItems.length === 0) return;
    onAddScannedExpense(receiptName, totalBillAmount, scannedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Quick Feature Guide Banner */}
        <div className="bg-indigo-950/60 border border-indigo-700/50 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-indigo-300 shadow-sm">
          <Camera size={16} className="text-indigo-400 shrink-0" />
          <span><strong>Scan & Split (OCR Itemization):</strong> Scan your receipt and let everyone tap only the items they personally consumed.</span>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="text-amber-400 shrink-0" size={18} />
            <span>Scan & Split Receipt OCR</span>
          </h2>
          <p className="text-xs text-slate-400">Mock receipt scanner extracts line items & prices!</p>
        </div>

        {/* Scan Upload Action Area */}
        {scannedItems.length === 0 && (
          <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500 rounded-2xl p-8 text-center space-y-3 transition-colors bg-slate-950/50">
            <div className="w-16 h-16 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-400 mx-auto shadow-inner">
              <Camera size={28} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Upload or Snap Receipt Image</p>
              <span className="text-[10px] text-slate-500">Supports JPEG, PNG & PDF receipts</span>
            </div>

            <button
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg mx-auto transition-all cursor-pointer"
            >
              <Upload size={14} className={`shrink-0 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'OCR Extracting Line Items...' : 'Simulate Receipt OCR Scan'}</span>
            </button>
          </div>
        )}

        {/* Scanned Line Items & Tappable Consumption */}
        {scannedItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <input
                type="text"
                value={receiptName}
                onChange={e => setReceiptName(e.target.value)}
                className="bg-transparent font-semibold text-xs text-slate-100 border-none p-0 focus:ring-0 focus:outline-none"
              />
              <span className="font-mono font-bold text-sm text-indigo-400 shrink-0">
                Total: {formatCurrency(totalBillAmount, currency)}
              </span>
            </div>

            <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider">
              TAP ROOMMATES WHO CONSUMED EACH DISH:
            </span>

            <div className="space-y-2.5">
              {scannedItems.map(item => (
                <div key={item.id} className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <span className="font-mono font-bold text-slate-100">{formatCurrency(item.amount, currency)}</span>
                  </div>

                  {/* Roommate Selector Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-900">
                    {members.map(member => {
                      const isSelected = item.consumedBy.includes(member.id);
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => toggleItemConsumption(item.id, member.id)}
                          className={`text-[10px] px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 cursor-pointer font-medium ${
                            isSelected
                              ? 'bg-indigo-950 border-indigo-600 text-indigo-200 font-semibold shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
                          }`}
                        >
                          <span>{member.name.split(' ')[0]}</span>
                          {isSelected ? <Check size={10} className="text-indigo-400 shrink-0" /> : <span className="text-slate-400">+</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveScannedBill}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer mt-2"
            >
              <span>Confirm & Log OCR Bill</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
