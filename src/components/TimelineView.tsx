import React, { useState, useMemo } from 'react';
import type { Expense, User, CurrencyCode, ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';
import {
  Clock, Search, Sparkles, Calendar, ExternalLink, Filter
} from 'lucide-react';

interface TimelineViewProps {
  expenses: Expense[];
  members: User[];
  currency: CurrencyCode;
  settlements: Array<{ from: User; to: User; amount: number }>;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  expenses,
  members,
  currency,
  settlements,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');

  // Unified Timeline Event Interface
  interface TimelineEvent {
    id: string;
    type: 'expense' | 'settlement';
    date: Date;
    title: string;
    amount: number;
    paidBy: string;
    category?: ExpenseCategory;
    splitType?: string;
    regretTag?: string;
    isVegOnly?: boolean;
    optedInMembers?: string[];
    settlementFrom?: User;
    settlementTo?: User;
  }

  // Combine expenses and settlements into a single sorted timeline array
  const allEvents: TimelineEvent[] = useMemo(() => {
    const expenseEvents: TimelineEvent[] = expenses.map(exp => ({
      id: exp.id,
      type: 'expense',
      date: new Date(exp.createdAt),
      title: exp.title,
      amount: exp.totalAmount,
      paidBy: exp.paidById,
      category: exp.category,
      splitType: exp.splitType,
      regretTag: exp.regretTag,
      isVegOnly: exp.isVegOnly,
      optedInMembers: exp.optedInMembers,
    }));

    const settlementEvents: TimelineEvent[] = settlements.map((s, idx) => ({
      id: `settle-${idx}`,
      type: 'settlement',
      date: new Date(Date.now() - idx * 3600000),
      title: `${s.from.name} settlement to ${s.to.name}`,
      amount: s.amount,
      paidBy: s.from.id,
      settlementFrom: s.from,
      settlementTo: s.to,
    }));

    return [...expenseEvents, ...settlementEvents].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [expenses, settlements]);

  // Filter events based on search, member, category
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      // Search term filter
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        members.find(m => m.id === event.paidBy)?.name.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Member filter
      if (selectedMemberId !== 'all') {
        if (event.type === 'expense') {
          const isPayer = event.paidBy === selectedMemberId;
          const isParticipant = event.optedInMembers?.includes(selectedMemberId);
          if (!isPayer && !isParticipant) return false;
        } else if (event.type === 'settlement') {
          if (event.settlementFrom?.id !== selectedMemberId && event.settlementTo?.id !== selectedMemberId) {
            return false;
          }
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'settlement') {
          if (event.type !== 'settlement') return false;
        } else if (selectedCategory === 'worth_it') {
          if (event.regretTag !== 'worth_it') return false;
        } else if (selectedCategory === 'mistake') {
          if (event.regretTag !== 'mistake') return false;
        } else {
          if (event.category !== selectedCategory) return false;
        }
      }

      return true;
    });
  }, [allEvents, searchTerm, selectedMemberId, selectedCategory, members]);

  // Group events by date string (e.g. "Today", "Yesterday", "Aug 28, 2026")
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};

    filteredEvents.forEach(event => {
      const now = new Date();
      const eventDate = new Date(event.date);
      const isToday =
        now.getDate() === eventDate.getDate() &&
        now.getMonth() === eventDate.getMonth() &&
        now.getFullYear() === eventDate.getFullYear();

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday =
        yesterday.getDate() === eventDate.getDate() &&
        yesterday.getMonth() === eventDate.getMonth() &&
        yesterday.getFullYear() === eventDate.getFullYear();

      let groupKey = '';
      if (isToday) {
        groupKey = 'Today';
      } else if (isYesterday) {
        groupKey = 'Yesterday';
      } else {
        groupKey = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(event);
    });

    return groups;
  }, [filteredEvents]);

  // Metrics summary
  const totalVolume = filteredEvents.reduce((sum, e) => sum + e.amount, 0);

  // Category Icon helper
  const getCategoryIcon = (category?: ExpenseCategory, type?: string) => {
    if (type === 'settlement') return '💸';
    switch (category) {
      case 'food': return '🍔';
      case 'travel': return '🛵';
      case 'stay': return '🏖️';
      case 'utilities': return '💡';
      case 'groceries': return '🛒';
      default: return '📦';
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-900 dark:text-white">
      {/* Contextual Quick Guide Banner */}
      <div className="bg-[#1E3A5F]/10 dark:bg-slate-800/60 border border-[#1E3A5F]/20 dark:border-slate-700 text-[#1E3A5F] dark:text-indigo-300 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 font-medium shadow-sm">
        <Sparkles size={16} className="text-[#4A90E2] shrink-0" />
        <span><strong>Activity Timeline Feed:</strong> Real-time chronological audit trail of all group expenses, member splits, and direct settlements.</span>
      </div>

      {/* Timeline Header Metrics Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1E3A5F] text-white flex items-center justify-center font-bold">
              <Clock size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Chronological Activity</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{filteredEvents.length} events logged in group</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Filtered Volume</span>
            <span className="font-mono text-base font-extrabold text-[#4A90E2]">{formatCurrency(totalVolume, currency)}</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-2 pt-1">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search timeline events or members..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-[#4A90E2]"
            />
          </div>

          {/* Member Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedMemberId('all')}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer shrink-0 ${
                selectedMemberId === 'all'
                  ? 'bg-[#1E3A5F] border-[#4A90E2] text-white'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All Members
            </button>
            {members.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMemberId(m.id)}
                className={`px-3 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer shrink-0 ${
                  selectedMemberId === m.id
                    ? 'bg-[#1E3A5F] border-[#4A90E2] text-white'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <Filter size={13} className="text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Event Types & Categories</option>
              <option value="food">🍔 Food & Dining</option>
              <option value="travel">🛵 Travel & Transport</option>
              <option value="stay">🏖️ Stay & Hotel</option>
              <option value="utilities">💡 Utilities & Bills</option>
              <option value="groceries">🛒 Groceries</option>
              <option value="settlement">💸 UPI Settlements</option>
              <option value="worth_it">🔥 Regret: Worth It</option>
              <option value="mistake">💀 Regret: Mistake</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chronological Vertical Timeline Feed */}
      <div className="space-y-6 pt-2">
        {Object.keys(groupedEvents).length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center space-y-2">
            <Clock size={32} className="mx-auto text-slate-400 opacity-60" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No timeline events match your filters.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedMemberId('all'); setSelectedCategory('all'); }}
              className="text-xs text-[#4A90E2] font-bold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          Object.entries(groupedEvents).map(([dateLabel, events]) => (
            <div key={dateLabel} className="space-y-3">
              {/* Date Group Marker */}
              <div className="flex items-center gap-2 px-1">
                <Calendar size={13} className="text-[#4A90E2] shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {dateLabel}
                </span>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
              </div>

              {/* Event Nodes with Vertical Connector Line */}
              <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {events.map(event => {
                  const payerName = members.find(m => m.id === event.paidBy)?.name || 'Alex';
                  const timeStr = event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const categoryIcon = getCategoryIcon(event.category, event.type);

                  return (
                    <div key={event.id} className="relative group">
                      {/* Vertical Connector Node Circle */}
                      <div className="absolute -left-[23px] top-3.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-[#4A90E2] flex items-center justify-center z-10">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4A90E2]"></span>
                      </div>

                      {/* Timeline Item Card */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 shadow-sm space-y-2.5 transition-all hover:border-[#4A90E2]">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-base shrink-0">
                              {categoryIcon}
                            </div>

                            <div className="space-y-0.5 flex-1 min-w-0">
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {event.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                {timeStr} • Paid by <strong className="text-slate-700 dark:text-slate-200">{payerName}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-sm font-extrabold text-[#1E3A5F] dark:text-indigo-300 block">
                              {formatCurrency(event.amount, currency)}
                            </span>
                            {event.splitType && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 inline-block border border-slate-200 dark:border-slate-800">
                                {event.splitType}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Extra Badges Row (Regret Tag, Veg Filter, Settlement Link) */}
                        {event.type === 'expense' && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                            {event.regretTag === 'worth_it' && (
                              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-md font-semibold">
                                🔥 Worth It
                              </span>
                            )}
                            {event.regretTag === 'necessary' && (
                              <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 px-2 py-0.5 rounded-md font-semibold">
                                🤷 Necessary
                              </span>
                            )}
                            {event.regretTag === 'mistake' && (
                              <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-2 py-0.5 rounded-md font-semibold">
                                💀 Mistake
                              </span>
                            )}

                            {event.isVegOnly ? (
                              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                                🟢 100% Pure Veg
                              </span>
                            ) : (
                              <span className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md font-medium">
                                🔴 Non-Veg Included
                              </span>
                            )}

                            <span className="text-[10px] text-slate-400 font-medium ml-auto">
                              {event.optedInMembers?.length || members.length} roommates opt-in
                            </span>
                          </div>
                        )}

                        {event.type === 'settlement' && event.settlementFrom && event.settlementTo && (
                          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                            <a
                              href={`upi://pay?pa=${event.settlementTo.upiId}&pn=${encodeURIComponent(event.settlementTo.name)}&am=${event.amount}&cu=INR`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <span>1-Tap Re-Settle UPI</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
