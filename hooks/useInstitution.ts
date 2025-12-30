"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  getInstitutionFromCache,
  setInstitutionInCache,
  getCurrentUrlOrigin,
  isLocalhost,
  clearInstitutionCache,
  clearAllInstitutionCaches,
  InstitutionData,
  MAX_LOCALHOST_CACHE_CHECK,
} from "@/lib/institution-cache";
import { getInstituionByParams } from "@/helpers/FetchWrapper";

// Simple logger interface
const logger = {
  error: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "development") {
      console.error(`[useInstitution] ${message}`, context || "");
    }
  },
  warn: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[useInstitution] ${message}`, context || "");
    }
  },
  info: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[useInstitution] ${message}`, context || "");
    }
  },
};

interface UseInstitutionOptions {
  /**
   * Institution ID to fetch (for authenticated users)
   * If not provided, will use user's institution_id from context
   */
  institutionId?: number | string | null;
  
  /**
   * URL origin to fetch by (for public pages)
   * If not provided, will use current window.location.origin
   */
  url?: string | null;
  
  /**
   * Whether to skip automatic fetching on mount
   */
  skip?: boolean;
  
  /**
   * Whether to refetch even if data is in cache
   */
  refetch?: boolean;
}

interface UseInstitutionReturn {
  institution: InstitutionData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Validates institution response from API
 */
function validateInstitutionResponse(data: any): InstitutionData | null {
  if (data && typeof data === "object" && typeof data.id === "number" && data.id > 0) {
    return data as InstitutionData;
  }
  return null;
}

/**
 * Ensures localhost always uses institution ID 1
 * Clears wrong caches and returns true if on localhost
 */
function ensureLocalhostUsesId1(forceRefetch: boolean): boolean {
  const isOnLocalhost = isLocalhost();
  
  if (!isOnLocalhost) return false;
  
  if (!forceRefetch) {
    // Use clearAllInstitutionCaches for efficiency instead of looping
    clearAllInstitutionCaches();
    logger.info("Cleared all institution caches for localhost");
  }
  
  return true;
}

/**
 * Validates cached institution matches expected ID
 */
function validateCachedInstitution(
  cached: InstitutionData | null,
  expectedId: number | null,
  userInstitutionId: number | null | undefined
): boolean {
  if (!cached) return false;
  
  // For authenticated users, must match user's institution_id
  if (userInstitutionId) {
    return cached.id === userInstitutionId;
  }
  
  // For public pages, must match expected ID (if provided)
  if (expectedId !== null) {
    return cached.id === expectedId;
  }
  
  // For URL-based lookups, any cached data is acceptable
  return true;
}

/**
 * Hook to get institution data with caching
 * 
 * Priority:
 * 1. AppContext (if available)
 * 2. Cache (sessionStorage/cookies)
 * 3. Database fetch
 * 
 * @param options - Configuration options
 */
export function useInstitution(
  options: UseInstitutionOptions = {}
): UseInstitutionReturn {
  const {
    institutionId: providedInstitutionId,
    url: providedUrl,
    skip = false,
    refetch: forceRefetch = false,
  } = options;

  const { userData, institutionData: contextInstitutionData } = useApp();
  const [institution, setInstitution] = useState<InstitutionData | null>(
    contextInstitutionData || null
  );
  const [isLoading, setIsLoading] = useState(!skip && !contextInstitutionData);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  // Memoize localhost check to avoid redundant calls
  const isOnLocalhost = useMemo(() => isLocalhost(), []);

  // Determine which institution to fetch
  const getInstitutionIdentifier = useCallback(() => {
    // For authenticated users, prefer institution_id from userData
    if (userData?.institution_id) {
      return {
        institutionId: userData.institution_id,
        url: null,
      };
    }
    
    // Use provided values
    if (providedInstitutionId) {
      return {
        institutionId: providedInstitutionId,
        url: null,
      };
    }
    
    // Get current URL (either provided or from window)
    const currentUrl = providedUrl !== undefined 
      ? providedUrl 
      : getCurrentUrlOrigin();
    
    // For localhost or no URL, always use institution ID 1
    if (currentUrl === null || currentUrl === undefined || isOnLocalhost) {
      return {
        institutionId: 1,
        url: null,
      };
    }
    
    // For public pages with valid URL, try URL-based lookup first
    return {
      institutionId: null,
      url: currentUrl,
    };
  }, [userData, providedInstitutionId, providedUrl, isOnLocalhost]);

  // Extract URL fetch logic
  const fetchByUrl = useCallback(async (url: string): Promise<InstitutionData | null> => {
    try {
      const data = await getInstituionByParams({ url }, {});
      return validateInstitutionResponse(data);
    } catch (error) {
      logger.warn("Failed to fetch institution by URL", { 
        url, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  }, []);

  // Extract ID fetch logic
  const fetchById = useCallback(async (id: number | string): Promise<InstitutionData | null> => {
    try {
      // For localhost, always fetch ID 1
      const idToFetch = isOnLocalhost ? "1" : String(id);
      
      const data = await getInstituionByParams({ id: idToFetch }, {});
      const validated = validateInstitutionResponse(data);
      
      // For localhost, ensure we got ID 1
      if (isOnLocalhost && validated && validated.id !== 1) {
        logger.error("Localhost fetched wrong institution", { 
          fetchedId: validated.id, 
          expectedId: 1 
        });
        // Clear wrong cache
        clearInstitutionCache(validated.id, null);
        // Retry with ID 1
        const retryData = await getInstituionByParams({ id: "1" }, {});
        return validateInstitutionResponse(retryData);
      }
      
      return validated;
    } catch (error) {
      logger.error("Failed to fetch institution by ID", { 
        id, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  }, [isOnLocalhost]);

  // Fetch institution from database
  const fetchInstitution = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    const { institutionId, url } = getInstitutionIdentifier();
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      let fetchedInstitution: InstitutionData | null = null;

      // Try URL-based lookup first (for public pages, but skip localhost)
      if (url && !isOnLocalhost) {
        fetchedInstitution = await fetchByUrl(url);
        if (fetchedInstitution) {
          setInstitutionInCache(fetchedInstitution, fetchedInstitution.id, url);
          setInstitution(fetchedInstitution);
          setIsLoading(false);
          isFetchingRef.current = false;
          return;
        }
      }

      // Fallback to ID-based lookup
      if (!fetchedInstitution && institutionId) {
        fetchedInstitution = await fetchById(institutionId);
        if (fetchedInstitution) {
          setInstitutionInCache(fetchedInstitution, institutionId, url);
          setInstitution(fetchedInstitution);
          setIsLoading(false);
          isFetchingRef.current = false;
          return;
        }
      }

      // Final fallback to default institution (ID: 1)
      if (!fetchedInstitution) {
        fetchedInstitution = await fetchById(1);
        if (fetchedInstitution) {
          setInstitutionInCache(fetchedInstitution, 1, null);
          setInstitution(fetchedInstitution);
        } else {
          throw new Error("Failed to fetch default institution");
        }
      }
    } catch (err) {
      logger.error("Error fetching institution", { 
        error: err instanceof Error ? err.message : String(err) 
      });
      setError(err instanceof Error ? err.message : "Failed to load institution");
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [getInstitutionIdentifier, fetchByUrl, fetchById, isOnLocalhost]);

  // Load institution data
  useEffect(() => {
    if (skip) return;

    // FOR LOCALHOST: Always fetch ID 1, completely bypass cache and context
    if (ensureLocalhostUsesId1(forceRefetch)) {
      fetchInstitution();
      return;
    }

    // For public pages (when userData is not available), don't use context data
    const isPublicPage = !userData;
    
    // Validate context data before using it
    if (contextInstitutionData && !forceRefetch && !isPublicPage) {
      const contextMatchesUser = 
        userData?.institution_id && 
        contextInstitutionData.id === userData.institution_id;
      
      if (contextMatchesUser) {
        setInstitution(contextInstitutionData);
        setIsLoading(false);
        return;
      } else if (userData?.institution_id) {
        logger.warn("Context institution doesn't match user institution", {
          contextId: contextInstitutionData.id,
          userId: userData.institution_id,
        });
      }
    }

    // Check cache first (unless forcing refetch)
    if (!forceRefetch) {
      const { institutionId, url } = getInstitutionIdentifier();
      const expectedId = isOnLocalhost ? 1 : (institutionId as number | null);
      
      const cached = getInstitutionFromCache(institutionId, url);
      
      if (cached) {
        // Validate cached data
        const isValid = validateCachedInstitution(
          cached,
          expectedId,
          userData?.institution_id
        );
        
        if (isValid) {
          setInstitution(cached);
          setIsLoading(false);
          return;
        } else {
          // Cache doesn't match, clear it
          logger.warn("Cached institution doesn't match expected", {
            cachedId: cached.id,
            expectedId,
            userInstitutionId: userData?.institution_id,
          });
          clearInstitutionCache(cached.id, url);
        }
      }
    }

    // Fetch from database
    fetchInstitution();
  }, [skip, forceRefetch, contextInstitutionData, userData, getInstitutionIdentifier, fetchInstitution, isOnLocalhost]);

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchInstitution();
  }, [fetchInstitution]);

  return {
    institution,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Convenience hook for authenticated users (uses institution_id from context)
 */
export function useInstitutionForUser(): UseInstitutionReturn {
  return useInstitution({});
}

/**
 * Convenience hook for public pages (uses URL origin)
 * For localhost, automatically falls back to institution ID 1
 */
export function useInstitutionByUrl(url?: string): UseInstitutionReturn {
  const isOnLocalhost = isLocalhost();
  
  // If on localhost, explicitly use institution ID 1 and ignore URL
  if (isOnLocalhost) {
    return useInstitution({ institutionId: 1, url: null });
  }
  
  // If URL is explicitly provided, use it
  // Otherwise, get current URL origin
  const currentUrl = url !== undefined ? url : getCurrentUrlOrigin();
  
  // Pass the URL for non-localhost
  return useInstitution({ url: currentUrl });
}
