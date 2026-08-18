/**
 * Centralized Cache & Memory Store Service
 * Handles Redis functionality with high-performance memory fallback for:
 * 1. Sliding window Rate Limiter
 * 2. Brute-force Login Protection (15-min lockout after 5 failures)
 * 3. JWT Token JTI Blacklist for Logout
 * 4. Post view count debounce
 * 5. Poll vote anti-fraud locks (24-hour window per IP/User)
 * 6. Weather / AQI background cache
 */

class MemoryCacheStore {
  private cache = new Map<string, { value: unknown; expiresAt?: number }>();
  private rateLimitHits = new Map<string, number[]>();

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  set(key: string, value: unknown, ttlSeconds?: number): void {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.cache.set(key, { value, expiresAt });
  }

  del(key: string): void {
    this.cache.delete(key);
  }

  clearPattern(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  // Sliding Window Rate Limiter implementation
  checkRateLimit(key: string, limit: number, windowSeconds: number): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    let timestamps = this.rateLimitHits.get(key) || [];
    timestamps = timestamps.filter((ts) => ts > windowStart);

    if (timestamps.length >= limit) {
      return { allowed: false, remaining: 0 };
    }

    timestamps.push(now);
    this.rateLimitHits.set(key, timestamps);
    return { allowed: true, remaining: limit - timestamps.length };
  }

  // Brute force failed login counter
  recordFailedLogin(key: string): { attempts: number; lockedUntil?: number } {
    const now = Date.now();
    const lockKey = `lock:${key}`;
    const lockedUntil = this.get<number>(lockKey);

    if (lockedUntil && now < lockedUntil) {
      return { attempts: 5, lockedUntil };
    }

    const counterKey = `attempts:${key}`;
    const attempts = (this.get<number>(counterKey) || 0) + 1;
    this.set(counterKey, attempts, 900); // 15 mins window

    if (attempts >= 5) {
      const lockTime = now + 15 * 60 * 1000; // 15 minutes lockout
      this.set(lockKey, lockTime, 900);
      return { attempts, lockedUntil: lockTime };
    }

    return { attempts };
  }

  clearFailedLogin(key: string): void {
    this.del(`attempts:${key}`);
    this.del(`lock:${key}`);
  }

  // JWT Token Blacklist JTI
  blacklistToken(jti: string, ttlSeconds = 86400): void {
    this.set(`bl:${jti}`, true, ttlSeconds);
  }

  isTokenBlacklisted(jti: string): boolean {
    return !!this.get<boolean>(`bl:${jti}`);
  }
}

export const redisService = new MemoryCacheStore();
