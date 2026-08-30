import React, { useState } from 'react';
import { RotateCw, X, Disc, Sparkles } from 'lucide-react';
import type { User } from '../types';

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: User[];
}

const PRESET_DUTIES = [
  'Who buys the $5 water can today? 💧',
  'Who takes out the trash tonight? 🗑️',
  'Who gets the morning coffee/tea? ☕',
  'Who orders tonight’s snacks? 🍕',
];

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({ isOpen, onClose, members }) => {
  const [selectedDuty, setSelectedDuty] = useState(PRESET_DUTIES[0]);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [chosenMember, setChosenMember] = useState<User | null>(null);

  if (!isOpen) return null;

  const handleSpinWheel = () => {
    if (isSpinning || members.length === 0) return;
    setIsSpinning(true);
    setChosenMember(null);

    const randomMemberIdx = Math.floor(Math.random() * members.length);
    const sliceAngle = 360 / members.length;
    const extraSpins = 5 * 360;
    const targetDegree = rotationDegree + extraSpins + (360 - randomMemberIdx * sliceAngle - sliceAngle / 2);

    setRotationDegree(targetDegree);

    setTimeout(() => {
      setIsSpinning(false);
      setChosenMember(members[randomMemberIdx]);
    }, 3000);
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
          <Disc size={16} className="text-indigo-400 shrink-0" />
          <span><strong>Spin Wheel:</strong> Digital name wheel to randomly assign minor daily duties or micro-purchases without logging debt.</span>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="text-amber-400 shrink-0" size={18} />
            <span>Spin Wheel Duty Picker</span>
          </h2>
          <p className="text-xs text-slate-400">Select a micro-duty or chore, then spin!</p>
        </div>

        {/* Preset Chore Buttons */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {PRESET_DUTIES.map((duty, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedDuty(duty)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer font-medium ${
                selectedDuty === duty
                  ? 'bg-indigo-950 border-indigo-600 text-indigo-200 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {duty}
            </button>
          ))}
        </div>

        {/* Visual Rotating Wheel Graphic */}
        <div className="flex flex-col items-center justify-center my-1 relative py-2">
          <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-12 border-t-amber-400 mb-1 z-10 shadow-lg"></div>

          <div
            className="w-48 h-48 rounded-full border-4 border-indigo-600/50 shadow-2xl relative flex items-center justify-center overflow-hidden transition-transform duration-[3000ms] ease-out bg-slate-950"
            style={{ transform: `rotate(${rotationDegree}deg)` }}
          >
            {members.map((member, i) => {
              const angle = (360 / members.length) * i;
              return (
                <div
                  key={member.id}
                  className="absolute w-full h-full flex justify-center pt-2 text-[11px] font-bold text-indigo-300"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                    {member.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
            <div className="w-12 h-12 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center font-extrabold text-white z-10 shadow-lg">
              🎯
            </div>
          </div>
        </div>

        {/* Selected Chore Result */}
        {chosenMember && !isSpinning && (
          <div className="bg-emerald-950/80 border border-emerald-700 p-3.5 rounded-2xl text-center space-y-1">
            <span className="text-xs text-emerald-300 font-medium">{selectedDuty}</span>
            <p className="text-base font-extrabold text-white">🏆 Assigned to {chosenMember.name}!</p>
          </div>
        )}

        <button
          onClick={handleSpinWheel}
          disabled={isSpinning}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <RotateCw size={14} className={`shrink-0 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'Wheel Spinning...' : 'Spin the Duty Wheel'}</span>
        </button>
      </div>
    </div>
  );
};
