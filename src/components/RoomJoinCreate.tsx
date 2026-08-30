import React, { useState } from 'react';
import { useDivvyStore } from '../store/useDivvyStore';
import { LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { sanitizeRoomCode } from '../utils/sanitizer';

export const RoomJoinCreate: React.FC = () => {
  const createRoom = useDivvyStore((state) => state.createRoom);
  const joinRoom = useDivvyStore((state) => state.joinRoom);
  const joinError = useDivvyStore((state) => state.joinError);
  const setJoinError = useDivvyStore((state) => state.setJoinError);

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  // Create room state
  const [title, setTitle] = useState('');
  const [roomMode, setRoomMode] = useState<'standard' | 'prepaid_kitty'>('standard');
  const [creatorName, setCreatorName] = useState('');
  const [creatorUpiId, setCreatorUpiId] = useState('');

  // Join room state
  const [code, setCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinUpiId, setJoinUpiId] = useState('');
  const [isGuest, setIsGuest] = useState(true);

  const handleTabChange = (tab: 'create' | 'join') => {
    setActiveTab(tab);
    setJoinError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    if (!title.trim()) return;

    createRoom(
      title.trim(),
      roomMode,
      'INR',
      creatorName.trim() || 'You',
      creatorUpiId.trim() || undefined
    );
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);

    const formattedCode = sanitizeRoomCode(code);
    if (!formattedCode || !joinName.trim()) return;

    joinRoom(formattedCode, joinName.trim(), isGuest, joinUpiId.trim() || undefined);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setCode(sanitizeRoomCode(raw));
    if (joinError) setJoinError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 bg-slate-900/90 border-slate-800 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-indigo-500/30">
            D
          </div>
          <h1 className="text-2xl font-extrabold text-white">DivvyUp</h1>
          <p className="text-xs text-slate-400 mt-1">Zero-Friction Group Expense Distributor</p>
        </div>

        {/* Tab Switcher: [Create Room] and [Join Room] */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6 text-xs font-bold">
          <button
            onClick={() => handleTabChange('create')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => handleTabChange('join')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'join'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Join Room
          </button>
        </div>

        {/* Error Feedback */}
        {joinError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{joinError}</span>
          </div>
        )}

        {activeTab === 'create' ? (
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Room / Trip Title</label>
              <input
                type="text"
                placeholder="e.g. Goa Trip 🏖️, Flatmates 🏠"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Room Mode</label>
              <select
                value={roomMode}
                onChange={(e) => setRoomMode(e.target.value as any)}
                className="w-full bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="standard">Standard Split (Post-Trip Settle)</option>
                <option value="prepaid_kitty">Prepaid Kitty Pool (Advance Pool)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="w-full bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Your UPI ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. alex@upi"
                  value={creatorUpiId}
                  onChange={(e) => setCreatorUpiId(e.target.value)}
                  className="w-full bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center text-xs py-3 mt-2 shadow-lg cursor-pointer">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Create New Room</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">6-Character Room Code</label>
              <input
                type="text"
                placeholder="e.g. DIV-409"
                value={code}
                onChange={handleCodeChange}
                required
                className="w-full bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-center tracking-widest uppercase text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Your Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul"
                  value={joinName}
                  onChange={(e) => {
                    setJoinName(e.target.value);
                    if (joinError) setJoinError(null);
                  }}
                  required
                  className="w-full bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">UPI ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. rahul@upi"
                  value={joinUpiId}
                  onChange={(e) => setJoinUpiId(e.target.value)}
                  className="w-full bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isGuestJoin"
                checked={isGuest}
                onChange={(e) => setIsGuest(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-indigo-600 cursor-pointer"
              />
              <label htmlFor="isGuestJoin" className="text-xs text-slate-300 cursor-pointer font-medium">
                Join as Guest User (Zero-Auth)
              </label>
            </div>

            <button type="submit" className="btn-primary w-full justify-center text-xs py-3 mt-2 shadow-lg cursor-pointer">
              <LogIn className="w-4 h-4 shrink-0" />
              <span>Join Room</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
