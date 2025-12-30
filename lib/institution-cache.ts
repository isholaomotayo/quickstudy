/**
 * Institution Cache Utility
 * 
 * Provides functions to cache institution data in both cookies (for SSR)
 * and sessionStorage (for client-side). Cache keys are based on either
 * institution ID or normalized URL origin.
 */

// Constants
const DEFAULT_CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds
const MAX_LOCALHOST_CACHE_CHECK = 10; // Maximum institution IDs to check on localhost
const MAX_URL_LENGTH = 2048; // Maximum URL length for safety
const MAX_INSTITUTION_ID = 999999; // Maximum valid institution ID

// Type definitions
export interface InstitutionData {
  id: number;
  code?: string;
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
  motto?: string;
  website?: string;
  logo?: string;
  support_mail?: string;
  admission_mail?: string;
  [key: string]: any;
}

interface CachedInstitutionData extends InstitutionData {
  _cachedAt?: number; // Timestamp when cached
  _expiresAt?: number; // Timestamp when cache expires
}

// Simple logger interface (can be replaced with proper logging library)
const logger = {
  error: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "development") {
      console.error(`[InstitutionCache] ${message}`, context || "");
    }
    // In production, send to logging service
  },
  warn: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[InstitutionCache] ${message}`, context || "");
    }
  },
  info: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[InstitutionCache] ${message}`, context || "");
    }
  },
};

/**
 * Validates and sanitizes institution ID
 */
function validateInstitutionId(id: number | string | null | undefined): number | null {
  if (id === null || id === undefined) return null;
  
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  
  if (isNaN(numId) || numId < 1 || numId > MAX_INSTITUTION_ID) {
    logger.warn("Invalid institution ID", { id, numId });
    return null;
  }
  
  return numId;
}

/**
 * Validates institution data structure
 */
function validateInstitutionData(data: any): InstitutionData | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  
  // Validate required fields
  if (typeof data.id !== "number" || data.id < 1) {
    return null;
  }
  
  // Return sanitized data (remove cache metadata)
  const { _cachedAt, _expiresAt, ...institutionData } = data;
  return institutionData as InstitutionData;
}

/**
 * Safely parse JSON with validation
 */
function safeJsonParse<T>(json: string, validator: (data: any) => T | null): T | null {
  try {
    const parsed = JSON.parse(json);
    return validator(parsed);
  } catch (error) {
    logger.error("JSON parse error", { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Normalizes a URL for consistent caching
 * Removes www, trailing slashes, and normalizes protocol
 */
export function normalizeUrl(url: string): string {
  if (!url || typeof url !== "string") return "";
  
  // Length check for security
  if (url.length > MAX_URL_LENGTH) {
    logger.warn("URL exceeds maximum length", { length: url.length });
    return "";
  }
  
  try {
    let normalized = url.trim();
    
    // Add protocol if missing
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = `https://${normalized}`;
    }
    
    // Parse URL
    const urlObj = new URL(normalized);
    
    // Remove www. from hostname
    let hostname = urlObj.hostname.toLowerCase();
    if (hostname.startsWith("www.")) {
      hostname = hostname.substring(4);
    }
    
    // Reconstruct URL with normalized hostname and https
    return `https://${hostname}${urlObj.pathname.replace(/\/$/, "")}`;
  } catch (e) {
    // If URL parsing fails, try simple string manipulation
    let normalized = url.trim().toLowerCase();
    normalized = normalized.replace(/^https?:\/\//i, "");
    normalized = normalized.replace(/^www\./i, "");
    normalized = normalized.replace(/\/$/, "");
    return normalized ? `https://${normalized}` : "";
  }
}

/**
 * Generate cache key for institution
 * @param institutionId - Institution ID (for authenticated users)
 * @param url - URL origin (for public pages)
 */
export function getInstitutionCacheKey(
  institutionId?: number | string | null,
  url?: string | null
): string | null {
  const validatedId = validateInstitutionId(institutionId);
  if (validatedId) {
    return `institution_${validatedId}`;
  }
  
  if (url) {
    const normalizedUrl = normalizeUrl(url);
    if (normalizedUrl) {
      // Use a safe key format for URLs (replace special chars)
      const safeUrl = normalizedUrl.replace(/[^a-zA-Z0-9]/g, "_");
      // Limit key length
      const truncatedUrl = safeUrl.length > 200 ? safeUrl.substring(0, 200) : safeUrl;
      return `institution_url_${truncatedUrl}`;
    }
  }
  
  return null;
}

/**
 * Get institution data from sessionStorage (client-side only)
 */
export function getInstitutionFromSessionStorage(
  cacheKey: string
): InstitutionData | null {
  if (typeof window === "undefined") return null;
  
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const parsed = safeJsonParse<CachedInstitutionData>(cached, (data) => {
      if (!data || typeof data !== "object" || typeof data.id !== "number") {
        return null;
      }
      return data;
    });
    
    if (!parsed) return null;
    
    // Check expiration
    if (parsed._expiresAt && Date.now() > parsed._expiresAt) {
      logger.info("Cache expired, removing", { cacheKey });
      sessionStorage.removeItem(cacheKey);
      return null;
    }
    
    return validateInstitutionData(parsed);
  } catch (error) {
    logger.error("Error reading institution from sessionStorage", { 
      cacheKey, 
      error: error instanceof Error ? error.message : String(error) 
    });
    return null;
  }
}

/**
 * Set institution data in sessionStorage (client-side only)
 */
export function setInstitutionInSessionStorage(
  cacheKey: string,
  institutionData: InstitutionData,
  ttl: number = DEFAULT_CACHE_TTL
): void {
  if (typeof window === "undefined") return;
  
  const validated = validateInstitutionData(institutionData);
  if (!validated) {
    logger.warn("Invalid institution data, not caching", { cacheKey });
    return;
  }
  
  try {
    const cachedData: CachedInstitutionData = {
      ...validated,
      _cachedAt: Date.now(),
      _expiresAt: Date.now() + (ttl * 1000),
    };
    
    sessionStorage.setItem(cacheKey, JSON.stringify(cachedData));
  } catch (error) {
    logger.error("Error writing institution to sessionStorage", { 
      cacheKey, 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

/**
 * Get institution data from cookies (works in both SSR and client-side)
 */
export function getInstitutionFromCookies(cacheKey: string): InstitutionData | null {
  if (typeof document === "undefined") return null;
  
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${cacheKey}=`);
    
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(";").shift();
      if (cookieValue) {
        const decoded = decodeURIComponent(cookieValue);
        
        const parsed = safeJsonParse<CachedInstitutionData>(decoded, (data) => {
          if (!data || typeof data !== "object" || typeof data.id !== "number") {
            return null;
          }
          return data;
        });
        
        if (!parsed) return null;
        
        // Check expiration
        if (parsed._expiresAt && Date.now() > parsed._expiresAt) {
          logger.info("Cookie cache expired, removing", { cacheKey });
          document.cookie = `${cacheKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          return null;
        }
        
        return validateInstitutionData(parsed);
      }
    }
    
    return null;
  } catch (error) {
    logger.error("Error reading institution from cookies", { 
      cacheKey, 
      error: error instanceof Error ? error.message : String(error) 
    });
    return null;
  }
}

/**
 * Set institution data in cookies (client-side only)
 * For SSR, cookies should be set via Next.js cookies() API
 */
export function setInstitutionInCookies(
  cacheKey: string,
  institutionData: InstitutionData,
  maxAge: number = DEFAULT_CACHE_TTL
): void {
  if (typeof document === "undefined") return;
  
  const validated = validateInstitutionData(institutionData);
  if (!validated) {
    logger.warn("Invalid institution data, not caching in cookies", { cacheKey });
    return;
  }
  
  try {
    const cachedData: CachedInstitutionData = {
      ...validated,
      _cachedAt: Date.now(),
      _expiresAt: Date.now() + (maxAge * 1000),
    };
    
    const value = encodeURIComponent(JSON.stringify(cachedData));
    const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
    document.cookie = `${cacheKey}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (error) {
    logger.error("Error writing institution to cookies", { 
      cacheKey, 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

/**
 * Get institution from cache (checks both sessionStorage and cookies)
 * Returns null if not found or invalid
 */
export function getInstitutionFromCache(
  institutionId?: number | string | null,
  url?: string | null
): InstitutionData | null {
  const cacheKey = getInstitutionCacheKey(institutionId, url);
  if (!cacheKey) return null;
  
  // Try sessionStorage first (faster, client-side only)
  const fromStorage = getInstitutionFromSessionStorage(cacheKey);
  if (fromStorage) return fromStorage;
  
  // Fall back to cookies (works in SSR too)
  const fromCookies = getInstitutionFromCookies(cacheKey);
  if (fromCookies) {
    // Also update sessionStorage for faster future access
    setInstitutionInSessionStorage(cacheKey, fromCookies);
    return fromCookies;
  }
  
  return null;
}

/**
 * Set institution in cache (both sessionStorage and cookies)
 */
export function setInstitutionInCache(
  institutionData: InstitutionData,
  institutionId?: number | string | null,
  url?: string | null,
  maxAge: number = DEFAULT_CACHE_TTL
): void {
  const validated = validateInstitutionData(institutionData);
  if (!validated) {
    logger.warn("Invalid institution data, not caching", { institutionId, url });
    return;
  }
  
  const cacheKey = getInstitutionCacheKey(institutionId || validated.id, url);
  if (!cacheKey) {
    logger.warn("Could not generate cache key", { institutionId, url });
    return;
  }
  
  // Set in both storage mechanisms
  setInstitutionInSessionStorage(cacheKey, validated, maxAge);
  setInstitutionInCookies(cacheKey, validated, maxAge);
}

/**
 * Clear institution from cache
 */
export function clearInstitutionCache(
  institutionId?: number | string | null,
  url?: string | null
): void {
  const cacheKey = getInstitutionCacheKey(institutionId, url);
  if (!cacheKey) return;
  
  // Clear from sessionStorage
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(cacheKey);
    } catch (error) {
      logger.error("Error clearing institution from sessionStorage", { 
        cacheKey, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }
  
  // Clear from cookies
  if (typeof document !== "undefined") {
    try {
      document.cookie = `${cacheKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } catch (error) {
      logger.error("Error clearing institution from cookies", { 
        cacheKey, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }
}

/**
 * Clear all institution caches (useful for localhost to ensure clean state)
 * Optimized to use a Set to track keys instead of iterating all storage
 */
export function clearAllInstitutionCaches(): void {
  if (typeof window === "undefined") return;
  
  try {
    // Track keys to remove (more efficient than multiple iterations)
    const keysToRemove = new Set<string>();
    
    // Collect sessionStorage keys
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith("institution_")) {
        keysToRemove.add(key);
      }
    }
    
    // Remove sessionStorage items
    keysToRemove.forEach(key => {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        logger.error("Error removing sessionStorage key", { key });
      }
    });
    
    // Clear all institution cookies
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split(";");
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.startsWith("institution_")) {
          try {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          } catch (error) {
            logger.error("Error removing cookie", { name });
          }
        }
      });
    }
  } catch (error) {
    logger.error("Error clearing all institution caches", { 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

/**
 * Check if current URL is localhost or development environment
 */
export function isLocalhost(url?: string): boolean {
  if (typeof window === "undefined") {
    // Server-side: check NODE_ENV
    return process.env.NODE_ENV === "development";
  }
  
  const urlToCheck = url || window.location.origin;
  if (!urlToCheck) return false;
  
  try {
    const hostname = new URL(urlToCheck).hostname.toLowerCase();
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("localhost:") ||
      hostname.startsWith("127.0.0.1:") ||
      hostname.includes(".local") ||
      process.env.NODE_ENV === "development"
    );
  } catch {
    return false;
  }
}

/**
 * Get current URL origin (normalized)
 * Returns null for localhost to force ID-based lookup
 */
export function getCurrentUrlOrigin(): string | null {
  if (typeof window === "undefined") return null;
  
  try {
    const origin = window.location.origin;
    
    // Skip URL-based lookup for localhost
    if (isLocalhost(origin)) {
      return null;
    }
    
    return normalizeUrl(origin);
  } catch (error) {
    logger.error("Error getting current URL origin", { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return null;
  }
}

// Export constants for use in other modules
export { DEFAULT_CACHE_TTL, MAX_LOCALHOST_CACHE_CHECK };
