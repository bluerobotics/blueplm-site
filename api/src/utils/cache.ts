import type { Context } from 'hono';
import type { Env, Variables } from '../types';

/**
 * Create cache headers for responses
 */
export function cacheHeaders(
  ttlSeconds: number,
  options: {
    public?: boolean;
    staleWhileRevalidate?: number;
    staleIfError?: number;
  } = {}
): Record<string, string> {
  const directives: string[] = [];

  if (options.public !== false) {
    directives.push('public');
  }

  directives.push(`max-age=${ttlSeconds}`);

  if (options.staleWhileRevalidate) {
    directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }

  if (options.staleIfError) {
    directives.push(`stale-if-error=${options.staleIfError}`);
  }

  return {
    'Cache-Control': directives.join(', '),
  };
}

/**
 * No-cache headers
 */
export function noCacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
  };
}

/**
 * Get cache TTL from environment
 */
export function getCacheTtl(env: Env): number {
  return parseInt(env.CACHE_TTL_SECONDS || '60', 10);
}

/**
 * Apply caching to a response
 */
export function withCache<T>(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  data: T,
  ttlSeconds?: number
): Response {
  const ttl = ttlSeconds ?? getCacheTtl(c.env);
  const headers = cacheHeaders(ttl, {
    staleWhileRevalidate: ttl * 2,
    staleIfError: ttl * 10,
  });

  return c.json({ success: true, data } as const, 200, headers);
}
