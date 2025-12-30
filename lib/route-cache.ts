/**
 * Simple caching utility for API routes
 * Usage:
 * 1. Import: import { cacheGet, cacheInvalidate } from '@/lib/route-cache';
 * 2. In GET handler: const cachedData = await cacheGet(cacheKey); if (cachedData) return cachedData;
 * 3. After fetching: await cacheSet(cacheKey, data, ttl);
 * 4. In POST/PUT/DELETE: await cacheInvalidate(prefix, institutionId);
 */

import { NextResponse } from 'next/server';
import {
  getCache,
  setCache,
  invalidateResourceCache,
  createCacheKey,
  CACHE_TTL,
  CACHE_PREFIX,
} from './cache';
import { createSuccessResponse } from './api-auth';

/**
 * Get cached data and return as NextResponse if found
 */
export async function cacheGet<T = any>(
  cacheKey: string
): Promise<NextResponse | null> {
  const cached = await getCache<T>(cacheKey);
  if (cached) {
    // Check if it's already a formatted response with success/data structure
    if (typeof cached === 'object' && cached !== null && 'success' in cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT' },
      });
    }
    // Return as-is
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' },
    });
  }
  return null;
}

/**
 * Cache data for future requests
 */
export async function cacheSet(
  cacheKey: string,
  data: any,
  ttl: number = CACHE_TTL.DASHBOARD_STATS
): Promise<void> {
  await setCache(cacheKey, data, ttl);
}

/**
 * Invalidate cache for a resource type
 */
export async function cacheInvalidate(
  prefix: string | string[],
  institutionId?: number | string
): Promise<void> {
  const prefixes = Array.isArray(prefix) ? prefix : [prefix];

  for (const p of prefixes) {
    await invalidateResourceCache(p, institutionId);
  }
}

/**
 * Generate cache key for a route
 */
export function routeCacheKey(
  prefix: string,
  params: Record<string, any> = {}
): string {
  return createCacheKey(prefix, '', params);
}

// Export commonly used items
export { CACHE_TTL, CACHE_PREFIX };
