import { useState, useMemo, useEffect } from 'react';
import {
  Home, Plus, Users, Gamepad2, Sparkles, QrCode, LogOut,
  User as UserIcon, Camera, FileSpreadsheet, Smile, Hand, Disc, Coins,
  ExternalLink, Sun, Moon
} from 'lucide-react';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { AuthScreen } from './components/AuthScreen';
import { DUMonogramLogo } from './components/DUMonogramLogo';
import { QRCodeModal } from './components/QRCodeModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { TouchRouletteModal } from './components/TouchRouletteModal';
import { SpinWheelModal } from './components/SpinWheelModal';
import { CoinFlipModal } from './components/CoinFlipModal';
import { MemeNudgeModal } from './components/MemeNudgeModal';
import { ExpenseWrappedModal } from './components/ExpenseWrappedModal';
import { ScanSplitModal } from './components/ScanSplitModal';
import { LivingDynamicsView } from './components/LivingDynamicsView';
import { TimelineView } from './components/TimelineView';
import { CurrencyPreferencesModal } from './components/CurrencyPreferencesModal';
import type { User, CurrencyCode, Expense, ExpenseItem } from './types';
import { formatCurrency } from './utils/currencyFormatter';
import { exportExpensesToCSV } from './utils/csvExporter';

export default function DivvyUpApp() {
  // --- AUTH & THEME STORE ---
  const { currentUser, currentRoom, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  // --- NAVIGATION STATE & SESSION RECOVERY ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeline' | 'split' | 'dynamics' | 'games' | 'settle'>('dashboard');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isTouchRouletteOpen, setIsTouchRouletteOpen] = useState(false);
  const [isSpinWheelOpen, setIsSpinWheelOpen] = useState(false);
  const [isCoinFlipOpen, setIsCoinFlipOpen] = useState(false);
  const [isMemeNudgeOpen, setIsMemeNudgeOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [isScanSplitOpen, setIsScanSplitOpen] = useState(false);

  // --- DRAFT SESSION RECOVERY ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedDraft = localStorage.getItem('divvyup_draft_session');
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.activeTab) setActiveTab(parsed.activeTab);
          if (parsed.currency) setCurrency(parsed.currency);
        }
      } catch (e) {
        console.warn('Could not restore draft session', e);
      }
    }
  }, []);

  // Save current active session state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('divvyup_draft_session', JSON.stringify({
        activeTab,
        currency,
        updatedAt: new Date().toISOString()
      }));
    }
  }, [activeTab, currency]);

  // Roommates State with Adaptive Modifiers
  const [members, setMembers] = useState<User[]>([
    { id: '1', name: 'Alex (You)', isGuest: false, upiId: 'alex@okhdfcbank', joinedAt: new Date().toISOString() },
    { id: '2', name: 'Priya', isGuest: false, upiId: 'priya@upi', joinedAt: new Date().toISOString() },
    { id: '3', name: 'Rahul', isGuest: true, upiId: 'rahul@paytm', joinedAt: new Date().toISOString() },
    { id: '4', name: 'Sam', isGuest: false, upiId: 'sam@axl', joinedAt: new Date().toISOString() },
  ]);

  // Expenses State
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 'exp-1',
      roomId: 'DIV-409',
      title: 'Beach Shack Seafood Dinner',
      totalAmount: 3200,
      paidById: '1',
      category: 'food',
      splitType: 'itemized',
      items: [
        { id: 'i1', name: 'Tiger Prawns', amount: 1400, consumedBy: ['1', '3'] },
        { id: 'i2', name: 'Paneer Butter Masala', amount: 800, consumedBy: ['2', '4'] },
        { id: 'i3', name: 'Beverages & Mocktails', amount: 1000, consumedBy: ['1', '2', '3', '4'] },
      ],
      optedInMembers: ['1', '2', '3', '4'],
      regretTag: 'worth_it',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'exp-2',
      roomId: 'DIV-409',
      title: 'Scooter Rental',
      totalAmount: 1600,
      paidById: '2',
      category: 'travel',
      splitType: 'equal',
      items: [],
      optedInMembers: ['1', '2', '3', '4'],
      regretTag: 'necessary',
      createdAt: new Date(Date.now() - 43200000).toISOString(),
    },
    {
      id: 'exp-3',
      roomId: 'DIV-409',
      title: 'Overpriced Beach Club Cocktails',
      totalAmount: 2400,
      paidById: '4',
      category: 'other',
      splitType: 'equal',
      items: [],
      optedInMembers: ['1', '4'],
      regretTag: 'mistake',
      createdAt: new Date(Date.now() - 21600000).toISOString(),
    },
  ]);

  // Handlers for Adaptive Modifiers
  const handleUpdateVacation = (userId: string, isAway: boolean, startDate?: string, endDate?: string) => {
    setMembers(prev => prev.map(m => m.id === userId ? {
      ...m,
      vacation: { isAway, startDate, endDate }
    } : m));
  };

  const handleUpdateGuest = (userId: string, active: boolean, guestCount: number, guestDays: number) => {
    setMembers(prev => prev.map(m => m.id === userId ? {
      ...m,
      guestModifier: { active, guestCount, guestDays }
    } : m));
  };

  // Add Scanned Expense from OCR
  const handleAddScannedExpense = (title: string, totalAmount: number, items: ExpenseItem[]) => {
    const newExp: Expense = {
      id: Date.now().toString(),
      roomId: currentRoom?.code || 'DIV-409',
      title,
      totalAmount,
      paidById: currentUser?.id || '1',
      category: 'food',
      splitType: 'itemized',
      items,
      optedInMembers: members.map(m => m.id),
      regretTag: 'worth_it',
      createdAt: new Date().toISOString(),
    };
    setExpenses([newExp, ...expenses]);
  };

  // Calculate Net Balances for Dashboard (Tab 1)
  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.totalAmount, 0), [expenses]);
  const userYouAreOwed = 1200; // Emerald (#2D6A4F)
  const userYouOwe = 450;    // Soft Coral (#F4845F)

  // Direct settlements for Tab 5
  const settlements = useMemo(() => [
    { from: members[0], to: members[1], amount: 485 },
    { from: members[2], to: members[1], amount: 215 },
  ], [members]);

  // --- AUTH GATE ---
  if (!currentUser || !currentRoom) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex justify-center items-stretch transition-colors duration-200">
      
      {/* MOBILE-FIRST PORTRAIT FRAME CONTAINER (Constrained to max-w-md) */}
      <div className="w-full max-w-md min-h-screen shadow-2xl relative bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 flex flex-col font-sans transition-colors duration-200">

        {/* ========================================================================= */}
        {/* SCROLLABLE BODY CONTENT CONTAINER */}
        {/* ========================================================================= */}
        <main className="pt-4 pb-24 px-4 space-y-4 flex-1">

          {/* Minimal Inline Top App Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <DUMonogramLogo size={32} />
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-extrabold tracking-tight leading-none text-slate-900 dark:text-white">DivvyUp</h1>
                  <span className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold inline-flex items-center border border-indigo-200 dark:border-indigo-800">
                    Apt 302 • {currentRoom.code}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5 leading-none">
                  <UserIcon size={10} className="shrink-0" /> {currentUser.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {theme === 'light' ? <Moon size={14} className="text-amber-500" /> : <Sun size={14} className="text-amber-400" />}
              </button>
              <button
                onClick={logout}
                title="Logout session"
                className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-all cursor-pointer flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900/40"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: DASHBOARD */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              {/* Contextual Quick Guide Banner */}
              <div className="bg-[#1E3A5F]/10 dark:bg-slate-800/60 border border-[#1E3A5F]/20 dark:border-slate-700 text-[#1E3A5F] dark:text-indigo-300 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 font-medium shadow-sm">
                <Sparkles size={16} className="text-[#4A90E2] shrink-0" />
                <span><strong>Dashboard Overview:</strong> Track net balances, recent transactions, room QR code, and currency preferences.</span>
              </div>

              {/* Live Net Balance Card */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                      Total Group Volume
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 leading-tight">
                      {formatCurrency(totalSpent, currency)}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsQROpen(true)}
                    className="bg-[#1E3A5F] dark:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-semibold hover:bg-indigo-900 transition-all cursor-pointer shadow-sm shrink-0"
                  >
                    <QrCode size={13} /> {currentRoom.code}
                  </button>
                </div>

                {/* Net Debt Status Cards (Emerald Owed vs Coral Owe) */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Emerald Owed */}
                  <div className="bg-[#2D6A4F]/10 border border-[#2D6A4F]/30 p-4 rounded-2xl space-y-1">
                    <span className="text-[10px] text-[#2D6A4F] dark:text-[#74C69D] font-bold block uppercase tracking-wider">
                      You Are Owed
                    </span>
                    <span className="font-mono text-xl font-extrabold text-[#2D6A4F] dark:text-[#74C69D] block">
                      +{formatCurrency(userYouAreOwed, currency)}
                    </span>
                  </div>

                  {/* Soft Coral Owe */}
                  <div className="bg-[#F4845F]/10 border border-[#F4845F]/30 p-4 rounded-2xl space-y-1">
                    <span className="text-[10px] text-[#F4845F] font-bold block uppercase tracking-wider">
                      You Owe
                    </span>
                    <span className="font-mono text-xl font-extrabold text-[#F4845F] block">
                      -{formatCurrency(userYouOwe, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* CLEANED UP RECENT LEDGER / TRANSACTION HISTORY LIST */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Recent Transactions</h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">{expenses.length} recorded</span>
                </div>

                <div className="space-y-2.5">
                  {expenses.map(exp => {
                    const payer = members.find(m => m.id === exp.paidById)?.name || 'Alex';
                    const dateStr = new Date(exp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const participantCount = exp.optedInMembers ? exp.optedInMembers.length : members.length;

                    return (
                      <div key={exp.id} className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex justify-between items-center text-xs gap-3">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white truncate">{exp.title}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                            {dateStr} • Paid by {payer} • {participantCount} members
                          </p>
                        </div>

                        <div className="text-right space-y-1 shrink-0 flex flex-col items-end">
                          <span className="font-mono text-sm font-extrabold text-indigo-600 dark:text-indigo-400 block">
                            {formatCurrency(exp.totalAmount, currency)}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 inline-flex items-center justify-center">
                            {exp.splitType}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1.5: CHRONOLOGICAL ACTIVITY TIMELINE */}
          {/* ========================================================================= */}
          {activeTab === 'timeline' && (
            <TimelineView
              expenses={expenses}
              members={members}
              currency={currency}
              settlements={settlements}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SMART SPLIT (Center Coral FAB Target) */}
          {/* ========================================================================= */}
          {activeTab === 'split' && (
            <div className="space-y-4">
              {/* Contextual Banner */}
              <div className="bg-[#1E3A5F]/10 dark:bg-slate-800/60 border border-[#1E3A5F]/20 dark:border-slate-700 text-[#1E3A5F] dark:text-indigo-300 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 font-medium shadow-sm">
                <Sparkles size={16} className="text-[#4A90E2] shrink-0" />
                <span><strong>Smart Split Engine:</strong> Log expenses with multi-payer splits, 1-tap opt-in/out, veg/non-veg tags, regret badges, or OCR scan.</span>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsAddExpenseOpen(true)}
                  className="bg-[#F4845F] hover:bg-[#e0714c] text-white font-bold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Plus size={16} className="shrink-0" />
                  <span>+ Add Smart Expense</span>
                </button>

                <button
                  onClick={() => setIsScanSplitOpen(true)}
                  className="bg-[#1E3A5F] dark:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border border-[#1E3A5F] dark:border-slate-700"
                >
                  <Camera size={16} className="text-[#74C69D] shrink-0" />
                  <span>Scan Receipt OCR</span>
                </button>
              </div>

              {/* Detailed Clean Expense Log */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 space-y-3 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Expense Itemization Ledger</h3>
                <div className="space-y-2.5">
                  {expenses.map(exp => (
                    <div key={exp.id} className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex justify-between items-center text-xs gap-3">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{exp.title}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {new Date(exp.createdAt).toLocaleDateString()} • {exp.category.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end">
                        <span className="font-mono font-extrabold text-sm text-indigo-600 dark:text-indigo-400 block">
                          {formatCurrency(exp.totalAmount, currency)}
                        </span>
                        <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-full uppercase inline-flex items-center justify-center">
                          {exp.splitType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: DYNAMICS (Vacation Mode, Guest Mode, Prepaid Pool) */}
          {/* ========================================================================= */}
          {activeTab === 'dynamics' && (
            <LivingDynamicsView
              members={members}
              currency={currency}
              onUpdateVacation={handleUpdateVacation}
              onUpdateGuest={handleUpdateGuest}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 4: PLAY & GAMES (Touch Roulette, Spin Wheel, Coin Flip) */}
          {/* ========================================================================= */}
          {activeTab === 'games' && (
            <div className="space-y-4">
              {/* Contextual Banner */}
              <div className="bg-[#1E3A5F]/10 dark:bg-slate-800/60 border border-[#1E3A5F]/20 dark:border-slate-700 text-[#1E3A5F] dark:text-indigo-300 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 font-medium shadow-sm">
                <Sparkles size={16} className="text-[#4A90E2] shrink-0" />
                <span><strong>Decision Playground:</strong> Place fingers for Touch Roulette, spin the Chore Wheel, or flip a double-or-nothing coin for micro-debts.</span>
              </div>

              {/* Game 1: Touch Roulette */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 space-y-3.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-2xl text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Hand size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Touch Roulette</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Multi-finger touch screen to randomly pick who pays the bill.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTouchRouletteOpen(true)}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 px-4 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Hand size={15} />
                  <span>Launch Touch Roulette</span>
                </button>
              </div>

              {/* Game 2: Spin Wheel */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 space-y-3.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-800 rounded-2xl text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Disc size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Spin Wheel Duty Picker</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Randomly assign daily chores or $5 water bottle purchases.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSpinWheelOpen(true)}
                  className="w-full bg-[#1E3A5F] dark:bg-slate-900 hover:bg-indigo-900 text-white font-bold text-xs py-3 px-4 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Disc size={15} />
                  <span>Spin Chore Wheel</span>
                </button>
              </div>

              {/* Game 3: Coin Flip Settle */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 space-y-3.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-2xl text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Coins size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Coin Flip Settle</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Double-or-nothing coin-flip mini-game for micro-debts under $5 / ₹50.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCoinFlipOpen(true)}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-3 px-4 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Coins size={15} />
                  <span>Play Coin Flip Settle</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: ANALYTICS & SETTLEMENTS */}
          {/* ========================================================================= */}
          {activeTab === 'settle' && (
            <div className="space-y-4">
              {/* Contextual Banner */}
              <div className="bg-[#1E3A5F]/10 dark:bg-slate-800/60 border border-[#1E3A5F]/20 dark:border-slate-700 text-[#1E3A5F] dark:text-indigo-300 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 font-medium shadow-sm">
                <Sparkles size={16} className="text-[#4A90E2] shrink-0" />
                <span><strong>Analytics & Settlements:</strong> 1-Tap UPI intent links, Meme Nudges, CSV Expense Export, and Monthly Wrapped summary.</span>
              </div>

              {/* Hub 5 Action Tool Grid with Uniform 3-Column Gap */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setIsMemeNudgeOpen(true)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#4A90E2] p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Smile className="text-amber-500 shrink-0" size={22} />
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block text-center leading-tight">Meme Nudge</span>
                </button>

                <button
                  onClick={() => exportExpensesToCSV(currentRoom, expenses)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="text-[#2D6A4F] dark:text-[#74C69D] shrink-0" size={22} />
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block text-center leading-tight">CSV Export</span>
                </button>

                <button
                  onClick={() => setIsWrappedOpen(true)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#4A90E2] p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Sparkles className="text-[#4A90E2] shrink-0" size={22} />
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block text-center leading-tight">Wrapped</span>
                </button>
              </div>

              {/* Direct UPI Settlement Cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider px-1">Required Direct UPI Settlements</h3>

                {settlements.map((s, idx) => {
                  const upiLink = `upi://pay?pa=${s.to.upiId}&pn=${encodeURIComponent(s.to.name)}&am=${s.amount}&cu=INR&tn=DivvyUp-Room-${currentRoom.code}`;

                  return (
                    <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">{s.from.name}</span>
                          <span className="text-slate-500 dark:text-slate-400">owes</span>
                          <span className="font-extrabold text-[#2D6A4F] dark:text-[#74C69D]">{s.to.name}</span>
                        </div>
                        <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                          {formatCurrency(s.amount, currency)}
                        </span>
                      </div>

                      <a
                        href={upiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#2D6A4F] hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
                      >
                        <span>Pay {formatCurrency(s.amount, currency)} via 1-Tap UPI</span>
                        <ExternalLink size={13} className="shrink-0" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>

        {/* ========================================================================= */}
        {/* 2. FIXED BOTTOM APP TOOLBAR (Native Tab Bar constrained to max-w-md) */}
        {/* ========================================================================= */}
        <nav className="fixed bottom-0 max-w-md w-full z-50 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg px-3 flex items-center justify-between backdrop-blur-md">

          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'text-[#4A90E2] font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Home size={20} className="shrink-0" />
            <span className="text-[10px] font-semibold mt-0.5 leading-none">Dashboard</span>
            {activeTab === 'dashboard' && <span className="w-1.5 h-1.5 rounded-full bg-[#4A90E2] mt-0.5"></span>}
          </button>

          {/* Tab 3: Dynamics */}
          <button
            onClick={() => setActiveTab('dynamics')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all cursor-pointer ${
              activeTab === 'dynamics' ? 'text-[#4A90E2] font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users size={20} className="shrink-0" />
            <span className="text-[10px] font-semibold mt-0.5 leading-none">Dynamics</span>
            {activeTab === 'dynamics' && <span className="w-1.5 h-1.5 rounded-full bg-[#4A90E2] mt-0.5"></span>}
          </button>

          {/* CENTER ELEVATED FAB: Tab 2 Smart Split */}
          <button
            onClick={() => {
              setActiveTab('split');
              setIsAddExpenseOpen(true);
            }}
            className="-translate-y-5 w-14 h-14 rounded-full bg-[#F4845F] hover:bg-[#e0714c] text-white shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-900 transition-all cursor-pointer hover:scale-105 shrink-0"
            title="Create New Smart Split Expense"
          >
            <Plus size={26} strokeWidth={2.8} />
          </button>

          {/* Tab 4: Play & Games */}
          <button
            onClick={() => setActiveTab('games')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all cursor-pointer ${
              activeTab === 'games' ? 'text-[#4A90E2] font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gamepad2 size={20} className="shrink-0" />
            <span className="text-[10px] font-semibold mt-0.5 leading-none">Games</span>
            {activeTab === 'games' && <span className="w-1.5 h-1.5 rounded-full bg-[#4A90E2] mt-0.5"></span>}
          </button>

          {/* Tab 5: Analytics */}
          <button
            onClick={() => setActiveTab('settle')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all cursor-pointer ${
              activeTab === 'settle' ? 'text-[#4A90E2] font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles size={20} className="shrink-0" />
            <span className="text-[10px] font-semibold mt-0.5 leading-none">Analytics</span>
            {activeTab === 'settle' && <span className="w-1.5 h-1.5 rounded-full bg-[#4A90E2] mt-0.5"></span>}
          </button>

        </nav>

        {/* --- ALL MODALS INTEGRATED --- */}
        <AddExpenseModal
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
        />

        <QRCodeModal
          isOpen={isQROpen}
          onClose={() => setIsQROpen(false)}
          roomCode={currentRoom.code}
          roomTitle={currentRoom.title}
        />

        <CurrencyPreferencesModal
          isOpen={isPreferencesOpen}
          onClose={() => setIsPreferencesOpen(false)}
          currency={currency}
          onChangeCurrency={setCurrency}
        />

        <TouchRouletteModal
          isOpen={isTouchRouletteOpen}
          onClose={() => setIsTouchRouletteOpen(false)}
          members={members}
        />

        <SpinWheelModal
          isOpen={isSpinWheelOpen}
          onClose={() => setIsSpinWheelOpen(false)}
          members={members}
        />

        <CoinFlipModal
          isOpen={isCoinFlipOpen}
          onClose={() => setIsCoinFlipOpen(false)}
          members={members}
          currency={currency}
        />

        <MemeNudgeModal
          isOpen={isMemeNudgeOpen}
          onClose={() => setIsMemeNudgeOpen(false)}
          members={members}
          currency={currency}
        />

        <ExpenseWrappedModal
          isOpen={isWrappedOpen}
          onClose={() => setIsWrappedOpen(false)}
          room={currentRoom}
          expenses={expenses}
        />

        <ScanSplitModal
          isOpen={isScanSplitOpen}
          onClose={() => setIsScanSplitOpen(false)}
          members={members}
          currency={currency}
          onAddScannedExpense={handleAddScannedExpense}
        />

      </div>
    </div>
  );
}
