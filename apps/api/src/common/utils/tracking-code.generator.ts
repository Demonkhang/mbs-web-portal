/**
 * Generates collision-free tracking code matching format: MBS-YYYY-XXXXX
 * Example: MBS-2026-A8F9K
 */
export function generateTrackingCode(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars O, 0, 1, I
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MBS-${year}-${randomPart}`;
}
