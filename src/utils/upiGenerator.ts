export type SupportedUpiApp = 'gpay' | 'phonepe' | 'paytm' | 'generic';

export interface UpiUriParams {
  payeeUpiId: string;
  payeeName: string;
  amount: number;
  roomCode: string;
  note?: string;
}

/**
 * Validates standard Indian VPA / UPI ID format (e.g., user@bank, 9876543210@paytm, name@okicici)
 */
export function validateUpiId(upiId: string): boolean {
  if (!upiId) return false;
  const clean = upiId.trim();
  // Standard VPA regex: username@bank
  return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(clean);
}

/**
 * Generates an NPCI-compliant standard UPI URI string.
 * Format: upi://pay?pa={upiId}&pn={payeeName}&am={amount}&cu=INR&tn=DivvyUp-Settlement-{roomCode}
 */
export function generateUpiUri(params: UpiUriParams): string {
  const { payeeUpiId, payeeName, amount, roomCode, note } = params;

  const cleanUpi = payeeUpiId.trim();
  const cleanName = payeeName.trim();
  const formattedAmount = amount.toFixed(2);
  const transactionNote = note ? note.trim() : `DivvyUp-Settlement-${roomCode}`;

  const queryParams = new URLSearchParams({
    pa: cleanUpi,
    pn: cleanName,
    am: formattedAmount,
    cu: 'INR',
    tn: transactionNote,
  });

  return `upi://pay?${queryParams.toString()}`;
}

/**
 * Generates app-specific intent URIs for Indian payment apps on mobile:
 * - GPay: gpay://upi/pay?...
 * - PhonePe: phonepe://pay?...
 * - Paytm: paytmmp://pay?...
 * - Generic: upi://pay?...
 */
export function generateAppSpecificUpiUri(
  app: SupportedUpiApp,
  params: UpiUriParams
): string {
  const standardUri = generateUpiUri(params);

  switch (app) {
    case 'gpay':
      return standardUri.replace(/^upi:\/\/pay\?/, 'gpay://upi/pay?');
    case 'phonepe':
      return standardUri.replace(/^upi:\/\/pay\?/, 'phonepe://pay?');
    case 'paytm':
      return standardUri.replace(/^upi:\/\/pay\?/, 'paytmmp://pay?');
    case 'generic':
    default:
      return standardUri;
  }
}
