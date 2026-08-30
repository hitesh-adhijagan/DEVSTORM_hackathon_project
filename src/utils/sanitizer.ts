import type { User } from '../types';

/**
 * Sanitizes display name by stripping HTML/scripts, trimming whitespace, and capping length.
 */
export function sanitizeDisplayName(name: string): string {
  if (!name) return '';
  // Strip HTML tags and dangerous characters
  const clean = name.replace(/<[^>]*>?/gm, '').trim();
  // Cap at 30 characters
  return clean.slice(0, 30);
}

/**
 * Validates that a display name is non-empty and unique within the current room (case-insensitive).
 */
export function validateUniqueName(
  name: string,
  members: User[] = [],
  currentUserId?: string
): { valid: boolean; error?: string; cleanName: string } {
  const cleanName = sanitizeDisplayName(name);

  if (!cleanName) {
    return { valid: false, error: 'Please enter a valid display name.', cleanName: '' };
  }

  if (cleanName.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long.', cleanName };
  }

  const isDuplicate = members.some((member) => {
    // Ignore current user when editing/validating self
    if (currentUserId && member.id === currentUserId) return false;
    return member.name.trim().toLowerCase() === cleanName.toLowerCase();
  });

  if (isDuplicate) {
    return {
      valid: false,
      error: `Name '${cleanName}' is already taken in this room. Please choose another name.`,
      cleanName,
    };
  }

  return { valid: true, cleanName };
}

/**
 * Formats and sanitizes a 6-character room code (e.g. 'div-409' -> 'DIV-409')
 */
export function sanitizeRoomCode(code: string): string {
  if (!code) return '';
  const uppercase = code.toUpperCase().trim();
  // Strip non-alphanumeric and non-hyphen chars
  const clean = uppercase.replace(/[^A-Z0-9-]/g, '');

  // If user enters 6 alphanumeric chars like 'DIV409', format to 'DIV-409'
  if (/^[A-Z]{3}[0-9]{3}$/.test(clean)) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }

  return clean.slice(0, 10);
}
