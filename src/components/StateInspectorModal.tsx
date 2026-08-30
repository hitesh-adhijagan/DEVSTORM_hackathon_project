import React, { useState } from 'react';
import { useDivvyStore } from '../store/useDivvyStore';
import { X, Copy, Check, Database } from 'lucide-react';

interface StateInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StateInspectorModal: React.FC<StateInspectorModalProps> = ({ isOpen, onClose }) => {
  const storeState = useDivvyStore((state) => state);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Filter out functions from the state object for clean JSON representation
  const cleanState = {
    currentRoom: storeState.currentRoom,
    currentUser: storeState.currentUser,
    expenses: storeState.expenses,
    settlements: storeState.settlements,
    kittyPool: storeState.kittyPool,
    localStorageKey: 'divvyup_session_v1',
    localStorageRaw: typeof window !== 'undefined' ? localStorage.getItem('divvyup_session_v1') : null,
  };

  const jsonString = JSON.stringify(cleanState, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
      <div className="glass-card w-full max-w-3xl p-6 bg-slate-900 border-slate-700 max-h-[85vh] flex flex-col rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400 shrink-0" />
            <h3 className="text-base font-bold text-white">Live Zustand Store & Entity Inspector</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="btn-secondary text-xs py-1.5 px-3 cursor-pointer shrink-0 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mt-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-indigo-300">
          <pre>{jsonString}</pre>
        </div>
      </div>
    </div>
  );
};
