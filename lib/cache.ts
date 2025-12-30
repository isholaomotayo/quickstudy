import { redis, isRedisReady } from './redis';
import crypto from 'crypto';

/**
 * Cache Configuration
 * Define TTL (Time To Live) for different cache types
 */
export const CACHE_TTL = {
  // Short-lived caches (5 minutes)
  DASHBOARD_STATS: 300,
  STUDENT_DASHBOARD: 300,
  ANNOUNCEMENTS: 300,
  FORUM_TOPICS: 300,

  // Medium-lived caches (15 minutes)
  COURSE_LIST: 900,
  STUDENT_COURSES: 900,
  PAYMENT_RECORDS: 900,
  DEPARTMENT_STATS: 900,

  // Long-lived caches (1 hour)
  INSTITUTION_PARAMS: 3600,
  ACTIVE_SESSION: 3600,
  ACTIVE_SEMESTER: 3600,
  GRADE_CONFIG: 3600,
  FACULTY_LIST: 3600,
  PROGRAMME_LIST: 3600,

  // Very long-lived caches (24 hours)
  COURSE_MODULES: 86400,
  COURSE_LESSONS: 86400,
} as const;

/**
 * Cache key prefixes for different resource types
 */
export const CACHE_PREFIX = {
  ANNOUNCEMENT: 'announcements',
  COURSE: 'courses',
  STUDENT: 'students',
  PAYMENT: 'payments',
  DASHBOARD: 'dashboard',
  FORUM: 'forum',
  INSTITUTION: 'institution',
  SESSION: 'session',
  SEMESTER: 'semester',
  GRADE: 'grades',
  FACULTY: 'faculty',
  DEPARTMENT: 'department',
  PROGRAMME: 'programme',
  STAFF: 'staff',
  USER: 'users',
} as const;

/**
 * Generate a cache key from route path and query parameters
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, any> = {}
): string {
  // Sort params for consistent key generation
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  const paramsString = JSON.stringify(sortedParams);
  const hash = crypto.createHash('md5').update(paramsString).digest('hex');

  return `${prefix}:${hash}`;
}

/**
 * Generate cache key from URL and query parameters
 */
export function getCacheKeyFromUrl(url: string, institutionId?: number | string): string {
  const urlObj = new URL(url, 'http://localhost');
  const pathname = urlObj.pathname;
  const searchParams = Object.fromEntries(urlObj.searchParams.entries());

  // Add institution ID to ensure cache separation by institution
  if (institutionId) {
    searchParams.institution_id = String(institutionId);
  }

  // Extract route prefix from pathname
  const pathParts = pathname.split('/').filter(Boolean);
  const prefix = pathParts[pathParts.length - 1] || 'default';

  return generateCacheKey(prefix, searchParams);
}

/**
 * Get data from cache
 * Failsafe: Returns null if Redis is down or any error occurs - app continues without cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  // Graceful degradation: Return null if Redis not ready
  if (!isRedisReady() || !redis) {
    return null;
  }

  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`[Cache] HIT: ${key}`);
      return JSON.parse(cached) as T;
    }
    console.log(`[Cache] MISS: ${key}`);
    return null;
  } catch (error) {
    // Failsafe: Log error but don't crash - app continues without cache
    console.error('[Cache] Get error (app continues without cache):', error);
    return null;
  }
}

/**
 * Set data in cache
 * Failsafe: Returns false if Redis is down - app continues without caching this data
 */
export async function setCache(
  key: string,
  data: any,
  ttl: number = CACHE_TTL.DASHBOARD_STATS
): Promise<boolean> {
  // Graceful degradation: Skip caching if Redis not ready
  if (!isRedisReady() || !redis) {
    return false;
  }

  try {
    const serialized = JSON.stringify(data);
    await redis.setex(key, ttl, serialized);
    console.log(`[Cache] SET: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    // Failsafe: Log error but don't crash - app continues without caching this data
    console.error('[Cache] Set error (app continues, data not cached):', error);
    return false;
  }
}

/**
 * Delete a specific cache key
 * Failsafe: Returns false if Redis is down - app continues normally
 */
export async function deleteCache(key: string): Promise<boolean> {
  // Graceful degradation: Skip deletion if Redis not ready
  if (!isRedisReady() || !redis) {
    return false;
  }

  try {
    await redis.del(key);
    console.log(`[Cache] DELETE: ${key}`);
    return true;
  } catch (error) {
    // Failsafe: Log error but don't crash
    console.error('[Cache] Delete error (app continues):', error);
    return false;
  }
}

/**
 * Invalidate all cache keys matching a pattern
 * Failsafe: Returns 0 if Redis is down - app continues normally
 */
export async function invalidateCachePattern(pattern: string): Promise<number> {
  // Graceful degradation: Skip invalidation if Redis not ready
  if (!isRedisReady() || !redis) {
    return 0;
  }

  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }

    await redis.del(...keys);
    console.log(`[Cache] INVALIDATED ${keys.length} keys matching: ${pattern}`);
    return keys.length;
  } catch (error) {
    // Failsafe: Log error but don't crash
    console.error('[Cache] Invalidate pattern error (app continues):', error);
    return 0;
  }
}

/**
 * Invalidate cache for a specific resource type
 */
export async function invalidateResourceCache(
  prefix: string,
  institutionId?: number | string
): Promise<number> {
  // Match any key that starts with the prefix and optionally contains the institution ID
  const pattern = institutionId
    ? `${prefix}*${institutionId}*`
    : `${prefix}*`;

  return invalidateCachePattern(pattern);
}

/**
 * Wrapper function for cached database queries
 */
export async function withCache<T>(
  cacheKey: string,
  ttl: number,
  fetchFunction: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = await getCache<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // If not in cache, fetch from database
  const data = await fetchFunction();

  // Store in cache for next time
  await setCache(cacheKey, data, ttl);

  return data;
}

/**
 * Cache middleware helper for API routes
 */
export function createCacheKey(
  resourceType: string,
  identifier: string | number,
  params?: Record<string, any>
): string {
  const baseKey = `${resourceType}:${identifier}`;
  if (!params || Object.keys(params).length === 0) {
    return baseKey;
  }
  return generateCacheKey(baseKey, params);
}
