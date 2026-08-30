import type { StateCreator } from 'zustand';
import type { Room, RoomMode, User, DietaryPreference, CurrencyCode } from '../../types';
import { generateRoomCode, generateUUID } from '../../utils/codeGenerator';
import { sanitizeDisplayName, sanitizeRoomCode, validateUniqueName } from '../../utils/sanitizer';

export interface DivvySessionToken {
  roomId: string;
  userId: string;
  name: string;
  token: string;
}

export interface RoomSlice {
  currentRoom: Room | null;
  currentUser: User | null;
  joinError: string | null;
  setCurrentUser: (user: User) => void;
  createRoom: (
    title: string,
    mode: RoomMode,
    currency?: CurrencyCode,
    creatorName?: string,
    creatorUpiId?: string
  ) => { room: Room; error?: string };
  joinRoom: (
    code: string,
    userName: string,
    isGuest?: boolean,
    upiId?: string
  ) => { success: boolean; error?: string };
  leaveRoom: () => void;
  addMemberToRoom: (user: User) => { success: boolean; error?: string };
  updateMemberDietaryPreference: (userId: string, preference: DietaryPreference) => void;
  updateMemberUpiId: (userId: string, upiId: string) => void;
  switchRoomMode: (mode: RoomMode) => void;
  setJoinError: (error: string | null) => void;
}

export const createRoomSlice: StateCreator<RoomSlice, [], [], RoomSlice> = (set, get) => ({
  currentRoom: null,
  currentUser: null,
  joinError: null,

  setJoinError: (error) => set({ joinError: error }),

  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  createRoom: (title, mode = 'standard', currency = 'INR', creatorName = 'You', creatorUpiId = '') => {
    const cleanTitle = title.trim();
    const cleanCreatorName = sanitizeDisplayName(creatorName || 'You');

    let user = get().currentUser;
    if (!user || user.name !== cleanCreatorName) {
      user = {
        id: generateUUID(),
        name: cleanCreatorName,
        upiId: creatorUpiId ? creatorUpiId.trim() : undefined,
        isGuest: false,
        dietaryPreference: 'all',
        joinedAt: new Date().toISOString(),
      };
      set({ currentUser: user });
    }

    const newRoom: Room = {
      id: generateUUID(),
      code: generateRoomCode(),
      title: cleanTitle,
      createdAt: new Date().toISOString(),
      currency,
      mode,
      members: [user],
    };

    set({ currentRoom: newRoom, joinError: null });

    const sessionToken: DivvySessionToken = {
      roomId: newRoom.id,
      userId: user.id,
      name: user.name,
      token: `sess_${generateUUID()}`,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('divvyup_session', JSON.stringify(sessionToken));
    }

    return { room: newRoom };
  },

  joinRoom: (code, userName, isGuest = true, upiId) => {
    const formattedCode = sanitizeRoomCode(code);
    const existingRoom = get().currentRoom;

    const currentMembers = existingRoom ? existingRoom.members : [];
    const validation = validateUniqueName(userName, currentMembers, get().currentUser?.id);

    if (!validation.valid) {
      set({ joinError: validation.error });
      return { success: false, error: validation.error };
    }

    const cleanName = validation.cleanName;

    let user = get().currentUser;
    if (!user || user.name.toLowerCase() !== cleanName.toLowerCase()) {
      user = {
        id: generateUUID(),
        name: cleanName,
        upiId: upiId ? upiId.trim() : undefined,
        isGuest,
        dietaryPreference: 'all',
        joinedAt: new Date().toISOString(),
      };
      set({ currentUser: user });
    }

    let targetRoom: Room;

    if (existingRoom) {
      const existingMember = existingRoom.members.find(
        (m) => m.id === user?.id || m.name.toLowerCase() === cleanName.toLowerCase()
      );

      const updatedMembers = existingMember || !user ? existingRoom.members : [...existingRoom.members, user];

      targetRoom = {
        ...existingRoom,
        code: formattedCode || existingRoom.code,
        members: updatedMembers,
      };
    } else {
      targetRoom = {
        id: generateUUID(),
        code: formattedCode || 'DIV-409',
        title: `Room (${formattedCode})`,
        createdAt: new Date().toISOString(),
        currency: 'INR',
        mode: 'standard',
        members: user ? [user] : [],
      };
    }

    set({ currentRoom: targetRoom, joinError: null });

    if (user) {
      const sessionToken: DivvySessionToken = {
        roomId: targetRoom.id,
        userId: user.id,
        name: user.name,
        token: `sess_${generateUUID()}`,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('divvyup_session', JSON.stringify(sessionToken));
      }
    }

    return { success: true };
  },

  leaveRoom: () => {
    set({ currentRoom: null, joinError: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('divvyup_session');
    }
  },

  addMemberToRoom: (newUser) => {
    const room = get().currentRoom;
    if (!room) return { success: false, error: 'No active room found' };

    const validation = validateUniqueName(newUser.name, room.members);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const cleanUser: User = {
      ...newUser,
      name: validation.cleanName,
      dietaryPreference: newUser.dietaryPreference || 'all',
    };

    const updatedRoom: Room = {
      ...room,
      members: [...room.members, cleanUser],
    };
    set({ currentRoom: updatedRoom });

    return { success: true };
  },

  updateMemberDietaryPreference: (userId, preference) => {
    const room = get().currentRoom;
    if (!room) return;

    const updatedMembers = room.members.map((m) =>
      m.id === userId ? { ...m, dietaryPreference: preference } : m
    );

    const currentUser = get().currentUser;
    const updatedCurrentUser =
      currentUser && currentUser.id === userId
        ? { ...currentUser, dietaryPreference: preference }
        : currentUser;

    set({
      currentRoom: { ...room, members: updatedMembers },
      currentUser: updatedCurrentUser,
    });
  },

  updateMemberUpiId: (userId, upiId) => {
    const room = get().currentRoom;
    if (!room) return;

    const cleanUpi = upiId.trim();
    const updatedMembers = room.members.map((m) =>
      m.id === userId ? { ...m, upiId: cleanUpi || undefined } : m
    );

    const currentUser = get().currentUser;
    const updatedCurrentUser =
      currentUser && currentUser.id === userId
        ? { ...currentUser, upiId: cleanUpi || undefined }
        : currentUser;

    set({
      currentRoom: { ...room, members: updatedMembers },
      currentUser: updatedCurrentUser,
    });
  },

  switchRoomMode: (mode) => {
    const room = get().currentRoom;
    if (!room) return;

    set({
      currentRoom: {
        ...room,
        mode,
      },
    });
  },
});
