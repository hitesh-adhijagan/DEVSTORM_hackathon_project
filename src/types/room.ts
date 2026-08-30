import type { User } from './user';

export type RoomMode = 'standard' | 'prepaid_kitty';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

/**
 * Room / Group Entity Definition
 */
export interface Room {
  id: string; // UUID
  code: string; // 6-character uppercase alphanumeric e.g., 'DIV-409'
  title: string;
  createdAt: string; // ISO Date String
  currency: CurrencyCode; // Default 'INR' (INR ₹, USD $, EUR €, GBP £)
  mode: RoomMode;
  members: User[];
}

export type CreateRoomInput = Omit<Room, 'id' | 'code' | 'createdAt' | 'members'> & {
  creator: User;
};
