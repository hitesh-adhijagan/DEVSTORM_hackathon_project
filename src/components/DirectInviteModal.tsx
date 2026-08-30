import React, { useState } from 'react';
import { useDivvyStore } from '../store/useDivvyStore';
import { LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { sanitizeDisplayName } from '../utils/sanitizer';

interface DirectInviteModalProps {
  inviteCode: string;
  onSuccess: () => void;
}

export const DirectInviteModal: React.FC<DirectInviteModalProps> = ({ inviteCode, onSuccess }) => {
  const joinRoom = useDivvyStore((state) => state.joinRoom);
  const currentRoom = useDivvyStore((state) => state.currentRoom);

  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const roomTitle = currentRoom?.code === inviteCode ? currentRoom.title : `Room ${inviteCode}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = sanitizeDisplayName(name);
    if (!cleanName) {
      setErrorMsg('Please enter a valid display name.');
      return;
    }

    const result = joinRoom(inviteCode, cleanName, true, upiId.trim() || undefined);

    if (!result.success && result.error) {
      setErrorMsg(result.error);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 z-50 font-sans">
      <div className="glass-card w-full max-w-md p-8 bg-slate-900 border-slate-700 shadow-2xl rounded-3xl space-y-4">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-indigo-500/30 shrink-0">
            D
          </div>
          <span className="code-badge text-xs uppercase tracking-widest font-mono inline-block">
            Invite Code: {inviteCode}
          </span>
          <h2 className="text-2xl font-black text-white">Join {roomTitle}</h2>
          <p className="text-xs text-slate-400">
            Zero-Auth Instant Entry • Enter your display name to start divvying up
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Your Display Name</label>
            <input
              type="text"
              placeholder="e.g. Maya, Alex, Rohan"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              required
              autoFocus
              className="w-full bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Your UPI ID (Optional)</label>
            <input
              type="text"
              placeholder="e.g. maya@upi (for instant settlements)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button type="submit" className="btn-primary w-full justify-center text-xs py-3 rounded-xl shadow-lg transition-all cursor-pointer mt-2">
            <LogIn className="w-4 h-4 shrink-0" />
            <span>Join Room Now</span>
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>No sign-up or password required. Session saved to browser.</span>
        </div>
      </div>
    </div>
  );
};
