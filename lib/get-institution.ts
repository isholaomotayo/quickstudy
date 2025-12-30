/**
 * Server-side helper to get institution data
 * 
 * Used in API routes and server components.
 * Checks cache (cookies) first, then fetches from database.
 */

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { normalizeUrl, getInstitutionCacheKey, isLocalhost, InstitutionData } from "@/lib/institution-cache";

interface CachedInstitutionData extends InstitutionData {
  _cachedAt?: number;
  _expiresAt?: number;
}

// Simple logger interface
const logger = {
  error: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "development") {
      console.error(`[GetInstitution] ${message}`, context || "");
    }
  },
  warn: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[GetInstitution] ${message}`, context || "");
    }
  },
};

/**
 * Validates institution data structure
 */
function validateInstitutionData(data: any): InstitutionData | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  
  if (typeof data.id !== "number" || data.id < 1) {
    return null;
  }
  
  // Remove cache metadata
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
    logger.error("JSON parse error", { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return null;
  }
}

/**
 * Get institution from cookies (server-side)
 */
function getInstitutionFromServerCookies(
  cacheKey: string
): InstitutionData | null {
  try {
    const cookieStore = cookies();
    const cookieValue = cookieStore.get(cacheKey)?.value;
    
    if (!cookieValue) return null;
    
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
      logger.warn("Cookie cache expired", { cacheKey });
      return null;
    }
    
    return validateInstitutionData(parsed);
  } catch (error) {
    logger.error("Error reading institution from server cookies", { 
      cacheKey, 
      error: error instanceof Error ? error.message : String(error) 
    });
    return null;
  }
}

/**
 * Validates and sanitizes institution ID
 */
function validateInstitutionId(id: number | string | null | undefined): number | null {
  if (id === null || id === undefined) return null;
  
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  
  if (isNaN(numId) || numId < 1 || numId > 999999) {
    logger.warn("Invalid institution ID", { id, numId });
    return null;
  }
  
  return numId;
}

/**
 * Fetch institution from database by ID
 */
async function fetchInstitutionById(
  id: number | string
): Promise<InstitutionData | null> {
  try {
    const institutionId = validateInstitutionId(id);
    if (!institutionId) {
      return null;
    }
    
    const institution = await prisma.institution.findFirst({
      where: { id: institutionId },
    });
    
    return institution as InstitutionData | null;
  } catch (error) {
    logger.error("Error fetching institution by ID", { 
      id, 
      error: error instanceof Error ? error.message : String(error) 
    });
    return null;
  }
}

/**
 * Fetch institution from database by URL
 * OPTIMIZED: Uses database query instead of fetching all and filtering in memory
 * 
 * Note: For best performance, add an index on the website column:
 * CREATE INDEX idx_institution_website ON institution(website);
 * 
 * Or consider adding a normalized_website column with an index for exact matches.
 */
async function fetchInstitutionByUrl(url: string): Promise<InstitutionData | null> {
  try {
    const normalizedUrl = normalizeUrl(url);
    
    if (!normalizedUrl) {
      logger.warn("Could not normalize URL", { url });
      return null;
    }
    
    // Try exact match first (most efficient)
    const exactMatch = await prisma.institution.findFirst({
      where: {
        website: normalizedUrl,
      },
    });
    
    if (exactMatch) {
      return exactMatch as InstitutionData;
    }
    
    // Try with trailing slash variations
    const variations = [
      normalizedUrl + "/",
      normalizedUrl.replace(/\/$/, ""),
    ];
    
    for (const variation of variations) {
      const match = await prisma.institution.findFirst({
        where: {
          website: variation,
        },
      });
      
      if (match) {
        return match as InstitutionData;
      }
    }
    
    // Fallback: If exact match fails, fetch institutions with websites
    // and normalize in memory (only if necessary)
    // This is still better than fetching ALL institutions
    const institutions = await prisma.institution.findMany({
      where: {
        website: {
          not: null,
          contains: normalizedUrl.replace(/^https?:\/\//, "").split("/")[0], // Match domain
        },
      },
      take: 50, // Limit results
    });
    
    // Find institution with matching normalized URL
    for (const inst of institutions) {
      if (!inst.website) continue;
      
      const normalizedDbUrl = normalizeUrl(inst.website);
      if (
        normalizedDbUrl === normalizedUrl ||
        normalizedDbUrl === normalizedUrl.replace(/\/$/, "") ||
        normalizedUrl === normalizedDbUrl.replace(/\/$/, "")
      ) {
        return inst as InstitutionData;
      }
    }
    
    return null;
  } catch (error) {
    logger.error("Error fetching institution by URL", { 
      url, 
      error: error instanceof Error ? error.message : String(error) 
    });
    return null;
  }
}

/**
 * Get institution data (server-side)
 * 
 * Priority:
 * 1. Cache (cookies)
 * 2. Database fetch
 * 
 * @param options - Configuration options
 */
export async function getInstitution(options: {
  institutionId?: number | string | null;
  url?: string | null;
  userInstitutionId?: number | null;
}): Promise<InstitutionData | null> {
  const {
    institutionId: providedInstitutionId,
    url: providedUrl,
    userInstitutionId,
  } = options;

  // Validate and determine which institution to fetch
  let institutionId = validateInstitutionId(providedInstitutionId || userInstitutionId);
  let url = providedUrl || null;

  // For localhost, always use institution ID 1
  if (!institutionId && (!url || isLocalhost(url))) {
    institutionId = 1;
    url = null;
  }

  // Generate cache key
  const cacheKey = getInstitutionCacheKey(institutionId, url);
  
  // Check cache first
  if (cacheKey) {
    const cached = getInstitutionFromServerCookies(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Fetch from database
  let institution: InstitutionData | null = null;

  // Try URL-based lookup first (for public pages, but skip localhost)
  if (url && !isLocalhost(url)) {
    institution = await fetchInstitutionByUrl(url);
    if (institution) {
      return institution;
    }
  }

  // Fallback to ID-based lookup
  if (institutionId) {
    institution = await fetchInstitutionById(institutionId);
    if (institution) {
      return institution;
    }
  }

  // Final fallback to default institution (ID: 1)
  // This handles cases where URL lookup fails or for localhost
  if (!institution) {
    institution = await fetchInstitutionById(1);
  }

  return institution;
}

/**
 * Get institution for authenticated user (server-side)
 * Uses user's institution_id from cookies
 */
export async function getInstitutionForUser(): Promise<InstitutionData | null> {
  try {
    const cookieStore = cookies();
    const userDataCookie = cookieStore.get("userData")?.value;
    
    if (userDataCookie) {
      const userData = safeJsonParse<any>(userDataCookie, (data) => {
        if (!data || typeof data !== "object") return null;
        return data;
      });
      
      if (userData?.institution_id) {
        const userInstitutionId = validateInstitutionId(userData.institution_id);
        if (userInstitutionId) {
          return await getInstitution({
            institutionId: userInstitutionId,
            userInstitutionId: userInstitutionId,
          });
        }
      }
    }
    
    // Fallback to default institution
    return await getInstitution({ institutionId: 1 });
  } catch (error) {
    logger.error("Error getting institution for user", { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return await getInstitution({ institutionId: 1 });
  }
}
