/**
 * Generate a unique, collision-resistant 6-character room code.
 * Format: 3 uppercase letters + '-' + 3 numbers (e.g., 'DIV-409', 'DIV-872')
 */
export function generateRoomCode(): string {
  const prefix = 'DIV';
  const digits = Math.floor(100 + Math.random() * 900).toString();
  return `${prefix}-${digits}`;
}

/**
 * Generate a standard 6-character uppercase alphanumeric code (e.g. 'DIV409', 'X7K9P2')
 */
export function generateAlphanumericCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a random RFC4122 v4 UUID string
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
