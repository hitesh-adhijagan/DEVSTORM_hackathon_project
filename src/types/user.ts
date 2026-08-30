export type DietaryPreference = 'all' | 'veg_only' | 'no_alcohol' | 'veg_no_alcohol';

export interface UserVacation {
  isAway: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UserGuestModifier {
  active: boolean;
  guestCount: number;
  guestDays: number;
}

/**
 * User / Roommate Entity Definition with Adaptive Modifiers
 */
export interface User {
  id: string; // UUID
  name: string;
  upiId?: string; // Optional UPI ID (e.g. user@upi)
  isGuest: boolean;
  dietaryPreference?: DietaryPreference;
  vacation?: UserVacation; // Vacation (Away) Mode
  guestModifier?: UserGuestModifier; // Guest Mode (+N guests for X days)
  joinedAt: string; // ISO Date String
}

export type CreateUserInput = Omit<User, 'id' | 'joinedAt'>;
