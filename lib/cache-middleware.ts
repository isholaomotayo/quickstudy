import { NextRequest, NextResponse } from 'next/server';
import {
  getCache,
  setCache,
  invalidateResourceCache,
  getCacheKeyFromUrl,
  CACHE_TTL,
  CACHE_PREFIX,
} from './cache';

/**
 * Cache configuration for specific routes
 */
const ROUTE_CACHE_CONFIG: Record<string, { ttl: number; prefix: string }> = {
  '/api/announcements': { ttl: CACHE_TTL.ANNOUNCEMENTS, prefix: CACHE_PREFIX.ANNOUNCEMENT },
  '/api/forum/topics': { ttl: CACHE_TTL.FORUM_TOPICS, prefix: CACHE_PREFIX.FORUM },
  '/api/forum/course': { ttl: CACHE_TTL.FORUM_TOPICS, prefix: CACHE_PREFIX.FORUM },
  '/api/student/dashboard': { ttl: CACHE_TTL.STUDENT_DASHBOARD, prefix: CACHE_PREFIX.STUDENT },
  '/api/dashboard/stats': { ttl: CACHE_TTL.DASHBOARD_STATS, prefix: CACHE_PREFIX.DASHBOARD },
  '/api/payments/records': { ttl: CACHE_TTL.PAYMENT_RECORDS, prefix: CACHE_PREFIX.PAYMENT },
  '/api/courses': { ttl: CACHE_TTL.COURSE_LIST, prefix: CACHE_PREFIX.COURSE },
  '/api/studentcourses': { ttl: CACHE_TTL.STUDENT_COURSES, prefix: CACHE_PREFIX.STUDENT },
  '/api/coursemodule': { ttl: CACHE_TTL.COURSE_MODULES, prefix: CACHE_PREFIX.COURSE },
  '/api/courselesson': { ttl: CACHE_TTL.COURSE_LESSONS, prefix: CACHE_PREFIX.COURSE },
};

/**
 * Route invalidation map: which routes should invalidate which cache prefixes
 */
const INVALIDATION_MAP: Record<string, string[]> = {
  // Announcement routes
  '/api/announcements': [CACHE_PREFIX.ANNOUNCEMENT],

  // Forum routes
  '/api/forum/topics': [CACHE_PREFIX.FORUM],
  '/api/forum/course': [CACHE_PREFIX.FORUM],
  '/api/courseForumTopic': [CACHE_PREFIX.FORUM],
  '/api/forumTopic': [CACHE_PREFIX.FORUM],

  // Course routes
  '/api/courses': [CACHE_PREFIX.COURSE, CACHE_PREFIX.STUDENT],
  '/api/coursemodule': [CACHE_PREFIX.COURSE],
  '/api/courselesson': [CACHE_PREFIX.COURSE],

  // Student course routes
  '/api/studentcourses': [CACHE_PREFIX.STUDENT, CACHE_PREFIX.COURSE],
  '/api/student/dashboard': [CACHE_PREFIX.STUDENT],

  // Payment routes
  '/api/payments': [CACHE_PREFIX.PAYMENT, CACHE_PREFIX.STUDENT],
  '/api/payment2': [CACHE_PREFIX.PAYMENT, CACHE_PREFIX.STUDENT],

  // Grade routes
  '/api/grades': [CACHE_PREFIX.GRADE, CACHE_PREFIX.STUDENT],
  '/api/studentresult': [CACHE_PREFIX.GRADE, CACHE_PREFIX.STUDENT, CACHE_PREFIX.DASHBOARD],

  // Institution structure routes
  '/api/faculty': [CACHE_PREFIX.FACULTY, CACHE_PREFIX.INSTITUTION],
  '/api/department': [CACHE_PREFIX.DEPARTMENT, CACHE_PREFIX.INSTITUTION],
  '/api/programme': [CACHE_PREFIX.PROGRAMME, CACHE_PREFIX.INSTITUTION],

  // Session/Semester routes
  '/api/session': [CACHE_PREFIX.SESSION, CACHE_PREFIX.INSTITUTION],
  '/api/semester': [CACHE_PREFIX.SEMESTER, CACHE_PREFIX.INSTITUTION],

  // Dashboard routes (invalidate on any major data change)
  '/api/dashboard': [CACHE_PREFIX.DASHBOARD],
};

/**
 * Get cache configuration for a route
 */
function getCacheConfig(pathname: string): { ttl: number; prefix: string } | null {
  // Exact match
  if (ROUTE_CACHE_CONFIG[pathname]) {
    return ROUTE_CACHE_CONFIG[pathname];
  }

  // Partial match (for dynamic routes)
  for (const [route, config] of Object.entries(ROUTE_CACHE_CONFIG)) {
    if (pathname.startsWith(route)) {
      return config;
    }
  }

  return null;
}

/**
 * Get cache prefixes to invalidate for a route
 */
function getInvalidationPrefixes(pathname: string): string[] {
  const prefixes: string[] = [];

  // Exact match
  if (INVALIDATION_MAP[pathname]) {
    prefixes.push(...INVALIDATION_MAP[pathname]);
  }

  // Partial match (for dynamic routes)
  for (const [route, routePrefixes] of Object.entries(INVALIDATION_MAP)) {
    if (pathname.startsWith(route)) {
      prefixes.push(...routePrefixes);
    }
  }

  return [...new Set(prefixes)]; // Remove duplicates
}

/**
 * Middleware to cache GET responses
 */
export async function withCacheMiddleware<T>(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  options?: {
    institutionId?: number | string;
    userId?: string;
    customKey?: string;
  }
): Promise<NextResponse> {
  const method = request.method;
  const url = request.url;
  const { pathname } = new URL(url);

  // Only cache GET requests
  if (method !== 'GET') {
    return handler();
  }

  const config = getCacheConfig(pathname);
  if (!config) {
    // Route not configured for caching
    return handler();
  }

  // Generate cache key
  const cacheKey = options?.customKey || getCacheKeyFromUrl(url, options?.institutionId);
  const fullCacheKey = `${config.prefix}:${cacheKey}`;

  // Try to get from cache
  const cached = await getCache<any>(fullCacheKey);
  if (cached) {
    // Return cached response
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'X-Cache-Key': fullCacheKey,
      },
    });
  }

  // Execute handler
  const response = await handler();

  // Cache the response if it's successful
  if (response.ok) {
    try {
      const data = await response.clone().json();
      await setCache(fullCacheKey, data, config.ttl);

      // Add cache miss header
      return new NextResponse(JSON.stringify(data), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'MISS',
          'X-Cache-Key': fullCacheKey,
        },
      });
    } catch (error) {
      console.error('[Cache Middleware] Error caching response:', error);
    }
  }

  return response;
}

/**
 * Middleware to invalidate cache on POST/PUT/DELETE
 */
export async function invalidateCacheMiddleware(
  request: NextRequest,
  options?: {
    institutionId?: number | string;
    customPrefixes?: string[];
  }
): Promise<void> {
  const method = request.method;
  const { pathname } = new URL(request.url);

  // Only invalidate on write operations
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return;
  }

  // Get prefixes to invalidate
  const prefixes = options?.customPrefixes || getInvalidationPrefixes(pathname);

  if (prefixes.length === 0) {
    return;
  }

  // Invalidate cache for each prefix
  for (const prefix of prefixes) {
    await invalidateResourceCache(prefix, options?.institutionId);
  }
}

/**
 * Helper function to wrap API route handlers with caching
 */
export function withCache<T = any>(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options?: {
    getInstitutionId?: (request: NextRequest) => Promise<number | string | undefined>;
    getUserId?: (request: NextRequest) => Promise<string | undefined>;
  }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Get institution ID and user ID if extractors provided
      const institutionId = options?.getInstitutionId
        ? await options.getInstitutionId(request)
        : undefined;
      const userId = options?.getUserId
        ? await options.getUserId(request)
        : undefined;

      // Invalidate cache on write operations
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        await invalidateCacheMiddleware(request, { institutionId });
        return handler(request);
      }

      // Cache GET requests
      return withCacheMiddleware(request, () => handler(request), {
        institutionId,
        userId,
      });
    } catch (error) {
      console.error('[Cache Wrapper] Error:', error);
      return handler(request);
    }
  };
}
