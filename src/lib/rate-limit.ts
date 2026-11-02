import "server-only";

/**
 * A small fixed-window limiter kept in memory. On Vercel each function instance has its own
 * counters, so this is a speed bump against casual abuse, not a hard guarantee: the real
 * backstops are the provider's own limits and the validation in front of it.
 */
export interface RateLimiter {
  /** Records a hit; returns false once `limit` hits were already made in the current window. */
  hit(key: string, now?: number): boolean;
}

export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const windows = new Map<string, { start: number; count: number }>();
  return {
    hit(key, now = Date.now()) {
      if (windows.size > 5_000) {
        for (const [candidate, window] of windows) if (now - window.start >= windowMs) windows.delete(candidate);
      }
      const window = windows.get(key);
      if (!window || now - window.start >= windowMs) {
        windows.set(key, { start: now, count: 1 });
        return true;
      }
      if (window.count >= limit) return false;
      window.count += 1;
      return true;
    },
  };
}
