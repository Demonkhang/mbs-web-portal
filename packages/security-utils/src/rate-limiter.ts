export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

const memoryStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, options: RateLimitOptions = { windowMs: 60000, max: 100 }): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = memoryStore.get(ip);

  if (!record || now > record.resetTime) {
    memoryStore.set(ip, { count: 1, resetTime: now + options.windowMs });
    return { allowed: true, remaining: options.max - 1, resetInMs: options.windowMs };
  }

  if (record.count >= options.max) {
    return { allowed: false, remaining: 0, resetInMs: record.resetTime - now };
  }

  record.count += 1;
  return { allowed: true, remaining: options.max - record.count, resetInMs: record.resetTime - now };
}
