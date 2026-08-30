import React, { useState } from 'react';
import { useDivvyStore } from '../store/useDivvyStore';
import { UserPlus, User as UserIcon, QrCode, Settings } from 'lucide-react';
import { generateUUID } from '../utils/codeGenerator';
import type { DietaryPreference } from '../types';

const DIETARY_LABELS: Record<DietaryPreference, { label: string; badge: string }> = {
  all: { label: 'No Restrictions (All)', badge: 'All' },
  veg_only: { label: 'Veg Only 🥗', badge: '🥗 Veg' },
  no_alcohol: { label: 'No Alcohol 🚫🍺', badge: '🚫🍺 No Alc' },
  veg_no_alcohol: { label: 'Veg & No Alcohol 🥗🚫🍺', badge: '🥗🚫🍺' },
};

export const MemberAvatars: React.FC = () => {
  const currentRoom = useDivvyStore((state) => state.currentRoom);
  const addMemberToRoom = useDivvyStore((state) => state.addMemberToRoom);
  const updateMemberDietaryPreference = useDivvyStore(
    (state) => state.updateMemberDietaryPreference
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Add form state
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isGuest, setIsGuest] = useState(true);
  const [dietaryPref, setDietaryPref] = useState<DietaryPreference>('all');

  if (!currentRoom) return null;

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMemberToRoom({
      id: generateUUID(),
      name: name.trim(),
      upiId: upiId.trim() || undefined,
      isGuest,
      dietaryPreference: dietaryPref,
      joinedAt: new Date().toISOString(),
    });

    setName('');
    setUpiId('');
    setDietaryPref('all');
    setShowAddModal(false);
  };

  return (
    <div className="glass-card mb-6 p-4 md:p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Room Members & Dietary Preferences ({currentRoom.members.length})</span>
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-secondary text-xs py-1.5 px-3 transition-colors cursor-pointer shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5 shrink-0" />
          <span>Add Member / Guest</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {currentRoom.members.map((member) => {
          const prefKey = member.dietaryPreference || 'all';
          const prefBadge = DIETARY_LABELS[prefKey];

          return (
            <div
              key={member.id}
              className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl px-3.5 py-2.5 transition-all hover:border-slate-700 shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md shrink-0">
                {member.name.charAt(0).toUpperCase()}
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">{member.name}</span>
                  {member.isGuest && <span className="tag-guest shrink-0">Guest</span>}
                </div>

                <div className="flex items-center gap-1.5">
                  {member.upiId && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <QrCode className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{member.upiId}</span>
                    </span>
                  )}

                  {/* Dietary Preference Badge & Inline Selector */}
                  <button
                    onClick={() => setEditingUserId(member.id)}
                    className="text-[10px] font-semibold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-800/40 hover:bg-indigo-900/60 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    title="Click to edit dietary preference"
                  >
                    <span>{prefBadge.badge}</span>
                    <Settings className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-sans">
          <div className="glass-card w-full max-w-md p-6 bg-slate-900 border-slate-700 rounded-3xl space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add User or Guest</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vikram"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">UPI ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. vikram@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Dietary Preference</label>
                <select
                  value={dietaryPref}
                  onChange={(e) => setDietaryPref(e.target.value as DietaryPreference)}
                  className="w-full bg-slate-950 border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">No Restrictions (Eats Everything)</option>
                  <option value="veg_only">Veg Only 🥗</option>
                  <option value="no_alcohol">No Alcohol 🚫🍺</option>
                  <option value="veg_no_alcohol">Veg & No Alcohol 🥗🚫🍺</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isGuestCheck"
                  checked={isGuest}
                  onChange={(e) => setIsGuest(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-indigo-600 cursor-pointer"
                />
                <label htmlFor="isGuestCheck" className="text-xs text-slate-300 cursor-pointer font-medium">
                  Mark as Guest User (no account required)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs py-2 px-3 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-3 shadow-md cursor-pointer">
                  Add to Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dietary Preference Modal */}
      {editingUserId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-sans">
          <div className="glass-card w-full max-w-sm p-6 bg-slate-900 border-slate-700 rounded-3xl space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Set Preference for {currentRoom.members.find((m) => m.id === editingUserId)?.name}
            </h3>

            <div className="space-y-2">
              {(Object.keys(DIETARY_LABELS) as DietaryPreference[]).map((key) => {
                const isSelected =
                  currentRoom.members.find((m) => m.id === editingUserId)?.dietaryPreference === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      updateMemberDietaryPreference(editingUserId, key);
                      setEditingUserId(null);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {DIETARY_LABELS[key].label}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setEditingUserId(null)}
                className="btn-secondary text-xs py-2 px-3 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
