import React, { useState } from 'react';
import { Smile, X, Copy, Sparkles, MessageCircle } from 'lucide-react';
import type { User } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';

interface MemeNudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: User[];
  currency?: 'INR' | 'USD' | 'EUR' | 'GBP';
}

const MEME_TEMPLATES = [
  { id: '1', title: 'Gentle Cat Reminder 🐱', template: 'Hey {name}! Just a friendly meow to settle {amount} for DivvyUp expenses. No rush, but please! 🙏' },
  { id: '2', title: 'Drake Approves Meme 😎', template: 'Ignoring DMs ❌ | Settling {amount} on DivvyUp immediately ✅. Pay {name} here!' },
  { id: '3', title: 'Distracted Boyfriend 🙈', template: 'Me looking at {name} owed {amount}... Let’s settle up before we order more pizza!' },
  { id: '4', title: 'Spider-Man Pointing 🕷️', template: 'You owe me, I owe you... wait! {name} actually owes {amount}. Pay now via 1-tap UPI!' },
];

export const MemeNudgeModal: React.FC<MemeNudgeModalProps> = ({ isOpen, onClose, members, currency = 'INR' }) => {
  const [selectedTarget, setSelectedTarget] = useState<User>(members[1] || members[0]);
  const [selectedMeme, setSelectedMeme] = useState(MEME_TEMPLATES[0]);
  const [amount, setAmount] = useState<number>(450);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generatedMessage = selectedMeme.template
    .replace('{name}', selectedTarget.name)
    .replace('{amount}', formatCurrency(amount, currency));

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(`*DivvyUp Meme Nudge* 😂\n\n${generatedMessage}\n\nPay via UPI / App Link: upi://pay?pa=${selectedTarget.upiId || 'test@upi'}&am=${amount}`);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <Smile size={16} className="text-indigo-400 shrink-0" />
          <span><strong>Meme Nudge:</strong> Playful, non-confrontational payment reminders with customizable meme templates and direct WhatsApp link.</span>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="text-amber-400 shrink-0" size={18} />
            <span>Meme Nudge Generator</span>
          </h2>
          <p className="text-xs text-slate-400">Pick a roommate and meme vibe to send a non-awkward reminder!</p>
        </div>

        {/* Roommate & Amount Pickers */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Nudge Who?</label>
            <select
              value={selectedTarget.id}
              onChange={e => {
                const found = members.find(m => m.id === e.target.value);
                if (found) setSelectedTarget(found);
              }}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Amount Owed</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 font-mono font-bold rounded-xl px-3.5 py-2.5 text-right focus:outline-none"
            />
          </div>
        </div>

        {/* Meme Template Selector */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-300 font-semibold block">Choose Meme Template</label>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {MEME_TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedMeme(tpl)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer font-medium ${
                  selectedMeme.id === tpl.id
                    ? 'bg-indigo-950 border-indigo-600 text-indigo-200 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tpl.title}
              </button>
            ))}
          </div>
        </div>

        {/* Live Card Preview */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 space-y-1.5 relative shadow-lg">
          <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block">
            Generated Meme Card Preview
          </span>
          <p className="text-xs text-slate-200 leading-relaxed font-sans italic">
            "{generatedMessage}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={handleCopyText}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Copy size={14} className="shrink-0" />
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <MessageCircle size={14} className="shrink-0" />
            <span>Nudge via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
