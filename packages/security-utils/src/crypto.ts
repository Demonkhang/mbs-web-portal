/**
 * Utility for hashing or masking sensitive payload fields.
 */
export function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain || name.length <= 2) return email;
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
}
