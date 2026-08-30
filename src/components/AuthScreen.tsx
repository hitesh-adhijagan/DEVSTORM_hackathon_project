import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { DUMonogramLogo } from './DUMonogramLogo';
import {
  LogIn, UserPlus, Phone, Lock, User, Key, ArrowRight,
  ShieldCheck, Sparkles, CheckCircle2, AlertCircle, Users
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { login, signup, joinRoom, rememberMe, setRememberMe } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'signup' | 'room'>('login');

  // Form State
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Room Form State
  const [roomMode, setRoomMode] = useState<'join' | 'create'>('join');
  const [roomCode, setRoomCode] = useState('DIV-409');
  const [roomPassword, setRoomPassword] = useState('1234');
  const [roomTitle, setRoomTitle] = useState('Goa Trip 🏖️');

  // Validation / Error state
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick Test Account Handler (User: 1, Password: 1)
  const handleQuickTestLogin = () => {
    setError(null);
    setPhone('1');
    setPassword('1');
    const res = login('1', '1');
    if (res.success) {
      setSuccessMsg('Logged in as Test User!');
      setTimeout(() => {
        onSuccess?.();
      }, 400);
    } else {
      setError(res.error || 'Quick login failed');
    }
  };

  // Login Submit Handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!phone || !password) {
      setError('Please fill in both Phone / User ID and Password');
      return;
    }

    const res = login(phone, password);
    if (res.success) {
      setSuccessMsg('Login successful! Welcome back.');
      setTimeout(() => {
        onSuccess?.();
      }, 400);
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  // Signup Submit Handler
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter a valid Phone Number or User ID');
      return;
    }
    if (!password) {
      setError('Please enter a password');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify!');
      return;
    }

    const res = signup(fullName, phone, password);
    if (res.success) {
      setSuccessMsg('Account created successfully! Proceeding to Room Setup...');
      setTimeout(() => {
        setMode('room');
      }, 500);
    } else {
      setError(res.error || 'Signup failed');
    }
  };

  // Room Submit Handler
  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!roomCode.trim()) {
      setError('Please enter a Room Code');
      return;
    }

    const res = joinRoom(roomCode, roomPassword, roomMode === 'create' ? roomTitle : undefined);
    if (res.success) {
      setSuccessMsg('Room connected! Redirecting to Dashboard...');
      setTimeout(() => {
        onSuccess?.();
      }, 400);
    } else {
      setError(res.error || 'Failed to join room');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">

        {/* Brand Header with Interlocking DU Monogram Logo */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <DUMonogramLogo size={48} />
          <h1 className="text-2xl font-extrabold text-white tracking-tight">DivvyUp</h1>
          <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">
            {mode === 'login' && 'Welcome Back • Zero Friction Splits'}
            {mode === 'signup' && 'Create Account • Instant Room Setup'}
            {mode === 'room' && 'Join or Create Expense Room'}
          </p>
        </div>

        {/* Mode Navigation Tabs (Login / Signup) */}
        {mode !== 'room' && (
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
              className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                mode === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn size={14} className="shrink-0" />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
              className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                mode === 'signup' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus size={14} className="shrink-0" />
              <span>Sign Up</span>
            </button>
          </div>
        )}

        {/* Feedback Alerts */}
        {error && (
          <div className="bg-rose-950/80 border border-rose-800/80 rounded-xl p-3 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* --- VIEW 1: LOGIN FORM --- */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Phone size={13} className="text-indigo-400 shrink-0" />
                <span>Phone Number / User ID</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 1 or +91 9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock size={13} className="text-indigo-400 shrink-0" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember me</span>
              </label>
              <span className="text-slate-500 text-[11px]">Default test login below</span>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-950 transition-all cursor-pointer"
            >
              <span>Login to Dashboard</span>
              <ArrowRight size={14} className="shrink-0" />
            </button>

            {/* Quick Demo Login Pill */}
            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleQuickTestLogin}
                className="w-full bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer font-medium"
              >
                <Sparkles size={13} className="text-amber-400 shrink-0" />
                <span>⚡ 1-Click Quick Login as Test User (1 / 1)</span>
              </button>
            </div>
          </form>
        )}

        {/* --- VIEW 2: SIGN UP FORM --- */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <User size={13} className="text-indigo-400 shrink-0" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Sharma"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Phone size={13} className="text-indigo-400 shrink-0" />
                <span>Phone Number / User ID</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock size={13} className="text-indigo-400 shrink-0" />
                <span>Password</span>
              </label>
              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-indigo-400 shrink-0" />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-950 transition-all cursor-pointer mt-2"
            >
              <span>Create Account & Join Room</span>
              <ArrowRight size={14} className="shrink-0" />
            </button>
          </form>
        )}

        {/* --- VIEW 3: ROOM JOIN / CREATE STEP --- */}
        {mode === 'room' && (
          <form onSubmit={handleRoomSubmit} className="space-y-4">
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold mb-2">
              <button
                type="button"
                onClick={() => setRoomMode('join')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  roomMode === 'join' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users size={13} className="shrink-0" />
                <span>Join Existing Room</span>
              </button>
              <button
                type="button"
                onClick={() => setRoomMode('create')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  roomMode === 'create' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles size={13} className="shrink-0" />
                <span>Create New Room</span>
              </button>
            </div>

            {roomMode === 'create' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Room Title / Expense Group</label>
                <input
                  type="text"
                  placeholder="e.g. Goa Trip 🏖️ or House Rent"
                  value={roomTitle}
                  onChange={e => setRoomTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Key size={13} className="text-indigo-400 shrink-0" />
                <span>Room Code</span>
              </label>
              <input
                type="text"
                placeholder="DIV-409"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 uppercase tracking-wider placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock size={13} className="text-indigo-400 shrink-0" />
                <span>Room Password / PIN (Optional)</span>
              </label>
              <input
                type="password"
                placeholder="1234"
                value={roomPassword}
                onChange={e => setRoomPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
            >
              <span>Enter Room & Start Splitting</span>
              <ArrowRight size={14} className="shrink-0" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
