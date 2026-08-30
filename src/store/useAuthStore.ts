import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Room } from '../types';

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  upiId?: string;
}

export interface AuthRoom extends Room {
  name: string;
  passcode?: string;
}

interface AuthState {
  users: Record<string, { phone: string; name: string; passwordHash: string; upiId?: string }>;
  currentUser: AuthUser | null;
  currentRoom: AuthRoom | null;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
  login: (phone: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, phone: string, password: string) => { success: boolean; error?: string };
  joinRoom: (code: string, password?: string, roomName?: string) => { success: boolean; error?: string };
  logout: () => void;
}

const DEFAULT_MOCK_ROOM: AuthRoom = {
  id: 'room-goa-409',
  code: 'DIV-409',
  title: 'Goa Trip 🏖️',
  name: 'Goa Trip 🏖️',
  createdAt: new Date().toISOString(),
  currency: 'INR',
  mode: 'standard',
  members: [
    { id: '1', name: 'Alex (You)', isGuest: false, upiId: 'alex@okhdfcbank', joinedAt: new Date().toISOString() },
    { id: '2', name: 'Priya', isGuest: false, upiId: 'priya@upi', joinedAt: new Date().toISOString() },
    { id: '3', name: 'Rahul', isGuest: true, upiId: 'rahul@paytm', joinedAt: new Date().toISOString() },
    { id: '4', name: 'Sam', isGuest: false, upiId: 'sam@axl', joinedAt: new Date().toISOString() },
  ],
  passcode: '1234',
};

const INITIAL_MOCK_USERS: Record<string, { phone: string; name: string; passwordHash: string }> = {
  '1': { phone: '1', name: 'Test User', passwordHash: '1' },
  'alex': { phone: 'alex', name: 'Alex (You)', passwordHash: 'alex123' },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: INITIAL_MOCK_USERS,
      currentUser: { id: '1', phone: '1', name: 'Test User', upiId: 'testuser@upi' },
      currentRoom: DEFAULT_MOCK_ROOM,
      rememberMe: true,

      setRememberMe: (remember) => set({ rememberMe: remember }),

      login: (phone, password) => {
        const cleanPhone = phone.trim();
        const user = get().users[cleanPhone];
        if (!user) {
          return { success: false, error: 'User ID / Phone number not found in mock database.' };
        }
        if (user.passwordHash !== password) {
          return { success: false, error: 'Incorrect password. Try again!' };
        }

        const authUser: AuthUser = {
          id: cleanPhone,
          phone: cleanPhone,
          name: user.name,
          upiId: user.upiId || undefined,
        };

        const room = get().currentRoom || DEFAULT_MOCK_ROOM;
        set({ currentUser: authUser, currentRoom: room });
        return { success: true };
      },

      signup: (name, phone, password) => {
        const cleanName = name.trim();
        const cleanPhone = phone.trim();

        if (get().users[cleanPhone]) {
          return { success: false, error: 'An account with this Phone / User ID already exists!' };
        }

        const updatedUsers = {
          ...get().users,
          [cleanPhone]: { phone: cleanPhone, name: cleanName, passwordHash: password },
        };

        const authUser: AuthUser = {
          id: cleanPhone,
          phone: cleanPhone,
          name: cleanName,
          upiId: undefined,
        };

        set({ users: updatedUsers, currentUser: authUser, currentRoom: DEFAULT_MOCK_ROOM });
        return { success: true };
      },

      joinRoom: (code, password = '1234', roomName = 'Dinner Split') => {
        const cleanCode = code.trim().toUpperCase() || 'DIV-409';
        const authRoom: AuthRoom = {
          ...DEFAULT_MOCK_ROOM,
          code: cleanCode.startsWith('DIV-') ? cleanCode : `DIV-${cleanCode}`,
          title: roomName,
          name: roomName,
          passcode: password,
        };
        set({ currentRoom: authRoom });
        return { success: true };
      },

      logout: () => {
        set({ currentUser: null, currentRoom: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('divvyup_auth_v2');
        }
      },
    }),
    {
      name: 'divvyup_auth_v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
