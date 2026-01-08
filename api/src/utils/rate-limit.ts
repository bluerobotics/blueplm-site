import type { Env } from '../types';

/**
 * Simple in-memory rate limiter for Cloudflare Workers
 * Falls back to in-memory when KV is not available
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory fallback (resets on cold start)
const memoryStore = new Map<string, RateLimitEntry>();

/**
 * Check if a request should be rate limited
 */
export async function checkRateLimit(
  env: Env,
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const kvKey = `ratelimit:${key}`;

  // Try KV first if available
  if (env.RATE_LIMIT_KV) {
    try {
      const stored = await env.RATE_LIMIT_KV.get(kvKey, 'json') as RateLimitEntry | null;
      
      if (!stored || stored.resetAt < now) {
        // New window
        const entry: RateLimitEntry = {
          count: 1,
          resetAt: now + windowMs,
        };
        await env.RATE_LIMIT_KV.put(kvKey, JSON.stringify(entry), {
          expirationTtl: Math.ceil(windowMs / 1000) + 60,
        });
        return { allowed: true, remaining: limit - 1, resetAt: entry.resetAt };
      }

      if (stored.count >= limit) {
        return { allowed: false, remaining: 0, resetAt: stored.resetAt };
      }

      // Increment
      const updated: RateLimitEntry = {
        count: stored.count + 1,
        resetAt: stored.resetAt,
      };
      await env.RATE_LIMIT_KV.put(kvKey, JSON.stringify(updated), {
        expirationTtl: Math.ceil((stored.resetAt - now) / 1000) + 60,
      });
      return {
        allowed: true,
        remaining: limit - updated.count,
        resetAt: stored.resetAt,
      };
    } catch {
      // Fall through to memory store
    }
  }

  // In-memory fallback
  const stored = memoryStore.get(key);

  if (!stored || stored.resetAt < now) {
    const entry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    memoryStore.set(key, entry);
    return { allowed: true, remaining: limit - 1, resetAt: entry.resetAt };
  }

  if (stored.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: stored.resetAt };
  }

  stored.count++;
  return {
    allowed: true,
    remaining: limit - stored.count,
    resetAt: stored.resetAt,
  };
}

/**
 * Create rate limit headers
 */
export function rateLimitHeaders(
  limit: number,
  remaining: number,
  resetAt: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
  };
}
