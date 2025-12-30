"use client";

import type React from "react";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import { removeCookies } from "cookies-next";
import {
  getInstitutionFromCache,
  setInstitutionInCache,
  getCurrentUrlOrigin,
  clearInstitutionCache,
  isLocalhost,
} from "@/lib/institution-cache";
import { getInstituionByParams } from "@/helpers/FetchWrapper";

interface UserData {
  id: number;
  institution_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  avatar: string;
  token?: string;
  student_id?: string;
  fee_plan?: string;
  staff_id?: string;
  // Additional properties for student data
  reg_no?: string;
  other_name?: string;
  programme_id?: number;
  programme_name?: string;
  department_id?: number;
  department_name?: string;
  student?: {
    session_admitted_id?: number;
  };
}

// InstitutionData is imported from institution-cache

interface AppState {
  // User data
  userData: UserData | null;
  isLoading: boolean;
  refreshUserData: () => void;
  clearAuthCookies: () => void;

  // Additional app state
  count: number;
  setCount: (n: number) => void;

  // Theme state
  theme: "light" | "dark";
  toggleTheme: () => void;

  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Institution data
  institutionData: InstitutionData | null;
  institutionLoading: boolean;
  loadInstitution: (institutionId?: number | string | null, url?: string | null) => Promise<void>;
  refreshInstitution: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [institutionData, setInstitutionData] = useState<InstitutionData | null>(null);
  const [institutionLoading, setInstitutionLoading] = useState(false);
  const hasInitiallyLoaded = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const institutionFetchingRef = useRef(false);
  const router = useRouter();

  const loadUserData = useCallback(() => {
    const getCookieValue = (name: string): string | null => {
      if (typeof document === "undefined") return null;

      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null;
      }
      return null;
    };

    try {
      // Get userData cookie directly from document.cookie
      const userDataCookie = getCookieValue("userData");
      const tokenCookie = getCookieValue("token");
      const roleCookie = getCookieValue("role");
      const userIdCookie = getCookieValue("userId");
      const institutionIdCookie = getCookieValue("institutionId");

      // If we have a token but no userData, try to reconstruct userData
      if (tokenCookie && roleCookie && !userDataCookie) {
        // Try to get basic user info from other cookies
        const userId = userIdCookie;
        const institutionId = institutionIdCookie;

        if (userId && institutionId) {
          const reconstructedUserData: UserData = {
            id: parseInt(userId),
            institution_id: parseInt(institutionId),
            username: "",
            first_name: "",
            last_name: "",
            email: "",
            role: roleCookie,
            avatar: "",
            token: tokenCookie,
          };

          setUserData(reconstructedUserData);
          setIsLoading(false);
          return;
        }
      }

      if (userDataCookie) {
        try {
          // Decode URI component in case it's encoded
          const decodedCookie = decodeURIComponent(userDataCookie);

          // Parse the JSON
          const parsedUserData = JSON.parse(decodedCookie);

          // Validate that we have the minimum required fields
          if (parsedUserData && parsedUserData.id && parsedUserData.role) {
            if (!hasInitiallyLoaded.current) {
              hasInitiallyLoaded.current = true;
            }
            setUserData(parsedUserData);

            // Expose userData to window for roleDecorators and other client-side checks
            // Note: Server-side signature verification is the source of truth
            if (typeof window !== 'undefined') {
              (window as any).__APP_USER_DATA = parsedUserData;
            }

            retryCount.current = 0; // Reset retry count on success
          } else {
            console.warn(
              "Invalid userData cookie - missing required fields:",
              parsedUserData
            );
            setUserData(null);
            // Don't redirect automatically - let the component handle this
          }
        } catch (parseError) {
          console.error("Error parsing userData cookie:", parseError);
          setUserData(null);
          // Don't redirect automatically - let the component handle this
        }
      } else {
        if (!hasInitiallyLoaded.current) {
          hasInitiallyLoaded.current = true;
        }
        setUserData(null);
        // Don't redirect automatically - let the component handle this
      }
    } catch (error) {
      console.error("Error loading user data from cookies:", error);
      setUserData(null);
      // Don't redirect automatically - let the component handle this
    } finally {
      // Add a small delay to ensure loading state is visible
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  }, []);

  const refreshUserData = useCallback(() => {
    if (retryCount.current < maxRetries) {
      retryCount.current += 1;
      setIsLoading(true);
      // Add a small delay before retrying to allow cookies to be set
      setTimeout(() => {
        loadUserData();
      }, 200);
    } else {
      setIsLoading(false);
    }
  }, [loadUserData]);

  const clearAuthCookies = useCallback(async () => {
    try {
      // Call backend API to delete httpOnly cookies (userSignature, roleSignature, token)
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to logout on server');
      }
    } catch (error) {
      console.error('Error calling logout API:', error);
    }

    // Clear client-side cookies
    if (typeof document !== "undefined") {
      const cookieOptions = { path: "/" };

      removeCookies(null, "userData", cookieOptions);
      removeCookies(null, "role", cookieOptions);
      removeCookies(null, "userId", cookieOptions);
      removeCookies(null, "institutionId", cookieOptions);

      // Clear the userData state
      setUserData(null);

      // Clear window.__APP_USER_DATA
      if (typeof window !== 'undefined') {
        (window as any).__APP_USER_DATA = null;
      }

      // Clear institution data
      setInstitutionData(null);
      if (userData?.institution_id) {
        clearInstitutionCache(userData.institution_id, null);
      }
      const currentUrl = typeof window !== "undefined" ? getCurrentUrlOrigin() : null;
      if (currentUrl) {
        clearInstitutionCache(null, currentUrl);
      }

      // Reset retry count
      retryCount.current = 0;
    }
  }, [userData]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const loadInstitution = useCallback(
    async (institutionId?: number | string | null, url?: string | null) => {
      if (institutionFetchingRef.current) return;

      // Determine which institution to fetch
      let targetInstitutionId = institutionId || userData?.institution_id || null;
      let targetUrl = url || (typeof window !== "undefined" ? getCurrentUrlOrigin() : null);

      // For localhost, always use institution ID 1
      if (!targetInstitutionId && (!targetUrl || isLocalhost(targetUrl))) {
        targetInstitutionId = 1;
        targetUrl = null;
      }

      // Check cache first
      const cached = getInstitutionFromCache(targetInstitutionId, targetUrl);
      if (cached) {
        setInstitutionData(cached);
        setInstitutionLoading(false);
        return;
      }

      // Fetch from database
      institutionFetchingRef.current = true;
      setInstitutionLoading(true);

      try {
        let fetchedInstitution: any = null;

        // Try URL-based lookup first (for public pages, but skip localhost)
        if (targetUrl && !isLocalhost(targetUrl)) {
          try {
            fetchedInstitution = await getInstituionByParams({ url: targetUrl }, {});
            if (
              fetchedInstitution &&
              typeof fetchedInstitution === "object" &&
              fetchedInstitution.id
            ) {
              setInstitutionInCache(fetchedInstitution, fetchedInstitution.id, targetUrl);
              setInstitutionData(fetchedInstitution);
              setInstitutionLoading(false);
              institutionFetchingRef.current = false;
              return;
            }
          } catch (urlError) {
            // Silently fail URL lookup, will fallback to ID
          }
        }

        // Fallback to ID-based lookup
        if (!fetchedInstitution && targetInstitutionId) {
          try {
            fetchedInstitution = await getInstituionByParams(
              { id: String(targetInstitutionId) },
              {}
            );
            if (
              fetchedInstitution &&
              typeof fetchedInstitution === "object" &&
              fetchedInstitution.id
            ) {
              setInstitutionInCache(fetchedInstitution, targetInstitutionId, targetUrl);
              setInstitutionData(fetchedInstitution);
              setInstitutionLoading(false);
              institutionFetchingRef.current = false;
              return;
            }
          } catch (idError) {
            // Log error but continue to fallback
            if (process.env.NODE_ENV === "development") {
              console.error("Failed to fetch institution by ID:", idError);
            }
          }
        }

        // Final fallback to default institution (ID: 1)
        // This handles cases where URL lookup fails or for localhost
        if (!fetchedInstitution) {
          try {
            fetchedInstitution = await getInstituionByParams({ id: "1" }, {});
            if (
              fetchedInstitution &&
              typeof fetchedInstitution === "object" &&
              fetchedInstitution.id
            ) {
              // Cache with the institution ID, not the URL
              setInstitutionInCache(fetchedInstitution, 1, null);
              setInstitutionData(fetchedInstitution);
            }
          } catch (defaultError) {
            if (process.env.NODE_ENV === "development") {
              console.error("Failed to fetch default institution:", defaultError);
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error loading institution:", error);
        }
      } finally {
        setInstitutionLoading(false);
        institutionFetchingRef.current = false;
      }
    },
    [userData]
  );

  const refreshInstitution = useCallback(async () => {
    // Clear current institution data state
    setInstitutionData(null);
    
    // Clear cache to force refetch
    if (userData?.institution_id) {
      clearInstitutionCache(userData.institution_id, null);
    }
    // Also clear any cached data for the old institution (if it exists and differs)
    if (institutionData?.id && institutionData.id !== userData?.institution_id) {
      clearInstitutionCache(institutionData.id, null);
    }
    
    const currentUrl = typeof window !== "undefined" ? getCurrentUrlOrigin() : null;
    if (currentUrl) {
      clearInstitutionCache(null, currentUrl);
    }

    // Reload institution
    await loadInstitution();
  }, [loadInstitution, userData, institutionData]);

  // Load institution when user data is available
  // Also refresh if institution_id changes (user switched institutions)
  useEffect(() => {
    if (userData?.institution_id) {
      // Check if context has wrong institution data
      const hasWrongInstitution = 
        institutionData && 
        institutionData.id !== userData.institution_id;
      
      // If no institution data or wrong institution, load it
      if (!institutionData || hasWrongInstitution) {
        if (hasWrongInstitution) {
          // Clear wrong institution cache
          clearInstitutionCache(institutionData.id, null);
        }
        loadInstitution();
      }
    } else if (userData === null && institutionData) {
      // User logged out, clear institution data
      setInstitutionData(null);
      // Clear all institution caches
      if (typeof window !== "undefined") {
        const currentUrl = getCurrentUrlOrigin();
        if (currentUrl) {
          clearInstitutionCache(null, currentUrl);
        }
      }
    }
  }, [userData, institutionData, institutionLoading, loadInstitution]);

  useEffect(() => {
    // Add a delay before loading user data to ensure loading state is visible
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        loadUserData();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [loadUserData]);

  // Add a listener for storage events to refresh user data when cookies change
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Check if userData cookie has changed
      if (e.key === null || e.key.includes("userData")) {
        refreshUserData();
      }
    };

    // Listen for cookie changes (this is a fallback since cookies don't trigger storage events)
    const checkForCookieChanges = () => {
      const currentUserData = document.cookie.match(/userData=([^;]+)/)?.[1];
      if (currentUserData && !userData) {
        refreshUserData();
      }
    };

    // Check for cookie changes periodically
    const interval = setInterval(checkForCookieChanges, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [refreshUserData, userData]);

  return (
    <AppContext.Provider
      value={{
        userData,
        isLoading,
        refreshUserData,
        clearAuthCookies,
        count,
        setCount,
        theme,
        toggleTheme,
        sidebarOpen,
        setSidebarOpen,
        institutionData,
        institutionLoading,
        loadInstitution,
        refreshInstitution,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

// Convenience hooks for specific parts of the context
export function useUser() {
  const { userData, isLoading, refreshUserData } = useApp();
  return { userData, isLoading, refreshUserData };
}

export function useTheme() {
  const { theme, toggleTheme } = useApp();
  return { theme, toggleTheme };
}

export function useSidebar() {
  const { sidebarOpen, setSidebarOpen } = useApp();
  return { sidebarOpen, setSidebarOpen };
}
