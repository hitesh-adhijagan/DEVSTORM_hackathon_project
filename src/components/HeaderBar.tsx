import React, { useState } from 'react';
import { useDivvyStore } from '../store/useDivvyStore';
import { Copy, Check, LogOut, Code, PiggyBank, Users, QrCode } from 'lucide-react';

interface HeaderBarProps {
  onOpenInspector: () => void;
  onOpenQRModal: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onOpenInspector, onOpenQRModal }) => {
  const currentRoom = useDivvyStore((state) => state.currentRoom);
  const currentUser = useDivvyStore((state) => state.currentUser);
  const switchRoomMode = useDivvyStore((state) => state.switchRoomMode);
  const leaveRoom = useDivvyStore((state) => state.leaveRoom);

  const [copied, setCopied] = useState(false);

  if (!currentRoom) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(currentRoom.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="glass-card mb-6 flex flex-wrap items-center justify-between gap-4 py-4 px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl font-extrabold text-indigo-400 shadow-md shadow-indigo-500/20 shrink-0">
          D
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white leading-none">{currentRoom.title}</h1>
            <button
              onClick={copyCode}
              className="code-badge inline-flex items-center gap-1.5 hover:bg-indigo-500/30 transition-colors cursor-pointer"
              title="Click to copy room code"
            >
              <span>{currentRoom.code}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Logged in as <span className="font-semibold text-slate-200">{currentUser?.name}</span>
            {currentUser?.upiId && ` (${currentUser.upiId})`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* QR Code Share Button */}
        <button
          onClick={onOpenQRModal}
          className="btn-secondary text-xs border-indigo-500/30 hover:bg-indigo-600/20 text-indigo-300 transition-all cursor-pointer"
          title="Share Room QR & Invite Link"
        >
          <QrCode className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Share QR</span>
        </button>

        {/* Mode Switcher */}
        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => switchRoomMode('standard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentRoom.mode === 'standard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Standard Split</span>
          </button>
          <button
            onClick={() => switchRoomMode('prepaid_kitty')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentRoom.mode === 'prepaid_kitty'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5 shrink-0" />
            <span>Prepaid Kitty</span>
          </button>
        </div>

        {/* State Inspector Button */}
        <button
          onClick={onOpenInspector}
          className="btn-secondary text-xs transition-all cursor-pointer"
          title="Inspect Zustand State & Models"
        >
          <Code className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>JSON State</span>
        </button>

        {/* Leave Room Button */}
        <button
          onClick={leaveRoom}
          className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer shrink-0 flex items-center justify-center"
          title="Leave Room"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
