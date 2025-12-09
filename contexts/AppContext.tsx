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
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasInitiallyLoaded = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;
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

  const clearAuthCookies = useCallback(() => {
    if (typeof document !== "undefined") {
      // Clear all authentication cookies
      document.cookie =
        "userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "institutionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "userSignature=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "roleSignature=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      // Clear the userData state
      setUserData(null);
      
      // Reset retry count
      retryCount.current = 0;
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

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
