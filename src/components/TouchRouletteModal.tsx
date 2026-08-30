import React, { useState } from 'react';
import { Sparkles, Hand, RefreshCw, X } from 'lucide-react';
import type { User } from '../types';

interface TouchRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: User[];
}

export const TouchRouletteModal: React.FC<TouchRouletteModalProps> = ({ isOpen, onClose, members }) => {
  const [activeFingers, setActiveFingers] = useState<string[]>(members.map(m => m.id));
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleFinger = (id: string) => {
    if (isSpinning) return;
    if (activeFingers.includes(id)) {
      if (activeFingers.length <= 2) return; // Need at least 2
      setActiveFingers(prev => prev.filter(f => f !== id));
    } else {
      setActiveFingers(prev => [...prev, id]);
    }
  };

  const handleStartRoulette = () => {
    if (activeFingers.length < 2 || isSpinning) return;
    setIsSpinning(true);
    setWinnerId(null);

    let counter = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * activeFingers.length);
      setWinnerId(activeFingers[randomIdx]);
      counter++;
      if (counter > 18) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 120);
  };

  const winner = members.find(m => m.id === winnerId);

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
          <Hand size={16} className="text-indigo-400 shrink-0" />
          <span><strong>Touch Roulette:</strong> Multi-finger touch screen where roommates place fingers to randomly select one person to pay the bill.</span>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="text-amber-400 shrink-0" size={18} />
            <span>Touch Roulette</span>
          </h2>
          <p className="text-xs text-slate-400">
            {isSpinning ? 'Pulsing fingers... selecting victim!' : 'Tap roommate spots to toggle participation, then pulse!'}
          </p>
        </div>

        {/* Interactive Finger Touch Field */}
        <div className="grid grid-cols-2 gap-3 min-h-[220px] bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 relative">
          {members.map((member) => {
            const isParticipating = activeFingers.includes(member.id);
            const isWinner = winnerId === member.id;

            return (
              <button
                key={member.id}
                type="button"
                onClick={() => toggleFinger(member.id)}
                disabled={isSpinning}
                className={`rounded-2xl p-4 border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden ${
                  isWinner
                    ? 'bg-rose-950/90 border-rose-500 scale-105 shadow-xl shadow-rose-950 text-white animate-bounce'
                    : isParticipating
                    ? 'bg-indigo-950/70 border-indigo-600 text-indigo-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-40'
                }`}
              >
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-extrabold ${
                  isWinner
                    ? 'bg-rose-600 border-rose-300 text-white animate-pulse'
                    : isParticipating
                    ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-slate-600'
                }`}>
                  {member.name[0]}
                </div>
                <span className="text-xs font-semibold">{member.name.split(' ')[0]}</span>
                {isParticipating && !isWinner && (
                  <span className="text-[9px] text-indigo-400 font-mono">Finger Ready</span>
                )}
                {isWinner && (
                  <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full">
                    PAYS BILL! 💳
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Winner Announcement */}
        {winner && !isSpinning && (
          <div className="bg-rose-950/80 border border-rose-700 p-3 rounded-2xl text-center space-y-1">
            <span className="text-xs text-rose-300 font-medium">Selected Bill Payer</span>
            <p className="text-base font-extrabold text-white">🎉 {winner.name} pays the bill!</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleStartRoulette}
            disabled={isSpinning || activeFingers.length < 2}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={`shrink-0 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Spinning Pulse...' : 'Pulse Finger Roulette'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
