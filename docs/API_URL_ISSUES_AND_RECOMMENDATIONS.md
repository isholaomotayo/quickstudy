# API URL Issues and Recommendations

## Executive Summary

This document outlines critical issues with API URL construction across the codebase that cause CORS errors, production failures, and inconsistent API access patterns. The problems stem from direct usage of `process.env.API_URL` in client-side code, which is not available in the browser environment.

---

## Current State Analysis

### Issues Identified

#### 1. **Primary Issue: Client-Side Environment Variable Access**

- **Problem**: `process.env.API_URL` is used directly in 50+ functions in `FetchWrapper.js`
- **Impact**:
  - In browser: `process.env.API_URL` is `undefined` (not prefixed with `NEXT_PUBLIC_`)
  - Falls back to `http://localhost:8080` from `next.config.js` default
  - Causes CORS errors when production frontend tries to call localhost
  - All API requests fail in production

#### 2. **Inconsistent API Access Patterns**

- **Location**: Multiple files use different patterns:
  - `helpers/FetchWrapper.js` - 50+ functions with direct `process.env.API_URL`
  - `lib/hooks/useForumData.ts` - Uses `NEXT_PUBLIC_API_URL` with localhost fallback
  - `lib/hooks/useCourseData.ts` - Same pattern
  - `app/(simple)/cgpa/cgpa-client.tsx` - Direct API_URL usage
  - Various components with inline fetch calls

#### 3. **Mixed API Route Patterns**

- **Next.js API Routes**: Some endpoints exist at `/app/api/*` (Next.js routes)
- **Legacy Backend**: Other endpoints use Fastify backend at separate URL
- **No Clear Separation**: Code doesn't distinguish between Next.js routes and external API

#### 4. **No Centralized API Client**

- Each function constructs URLs independently
- No request/response interceptors
- No centralized error handling
- No request cancellation support
- Difficult to add authentication headers globally

---

## Root Cause Analysis

### Technical Root Causes

1. **Next.js Environment Variable Limitations**

   - Only `NEXT_PUBLIC_*` variables are available in browser
   - `process.env.API_URL` is server-only
   - Build-time vs runtime environment variable confusion

2. **Legacy Architecture**

   - Codebase evolved from separate frontend/backend
   - Migration to Next.js API routes incomplete
   - Mixed patterns from different development phases

3. **No API Abstraction Layer**

   - Direct fetch calls throughout codebase
   - No unified API client
   - Inconsistent error handling

4. **Configuration Issues**
   - `next.config.js` sets `API_URL` but it's not accessible client-side
   - No clear production vs development URL strategy
   - Environment-specific configuration scattered

---

## Detailed Problem Manifestations

### Problem 1: CORS Errors in Production

**Example Error:**

```
Access to fetch at 'http://localhost:8080/api/institution/params'
from origin 'https://www.tuftsmanagementedu.org' has been blocked by CORS policy
```

**Why It Happens:**

- Client-side code tries to access `process.env.API_URL`
- Gets `undefined` or default `http://localhost:8080`
- Browser blocks cross-origin request

**Affected Files:**

- `helpers/FetchWrapper.js` - All 50+ functions
- `app/apply/page.tsx` - Institution fetching
- `app/apply/layout.tsx` - Institution loading
- `app/apply/start/page.tsx` - Application data loading

### Problem 2: Inconsistent URL Construction

**Current Patterns Found:**

```javascript
// Pattern 1: Direct process.env.API_URL (BROKEN in browser)
fetch(`${process.env.API_URL}/api/login`);

// Pattern 2: NEXT_PUBLIC_API_URL with localhost fallback (WORKS but inconsistent)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
fetch(`${API_BASE_URL}/api/endpoint`);

// Pattern 3: Relative URLs (WORKS for Next.js routes)
fetch("/api/institution/params");

// Pattern 4: Mixed (some functions use relative, others use absolute)
```

### Problem 3: No Request/Response Interception

**Missing Capabilities:**

- Automatic authentication token injection
- Request/response logging
- Error transformation
- Retry logic
- Request cancellation
- Loading state management

---

## Recommendations

### Recommendation 1: Implement Centralized API Client

#### Option A: Axios-Based Solution (Recommended for Full Control)

**Why Axios:**

- Interceptors for request/response handling
- Automatic JSON parsing
- Request/response transformation
- Built-in timeout support
- Request cancellation
- Wide browser support

**Implementation:**

```typescript
// lib/api-client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

class ApiClient {
  private client: AxiosInstance;
  private isServer: boolean;

  constructor() {
    this.isServer = typeof window === "undefined";

    // Determine base URL
    const baseURL = this.getBaseUrl();

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      withCredentials: true, // For cookie-based auth
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private getBaseUrl(): string {
    // Client-side: use relative URLs for Next.js API routes
    if (!this.isServer) {
      return ""; // Relative URLs
    }

    // Server-side: use environment variable
    return (
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.API_URL ||
      "http://localhost:8080"
    );
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth tokens, logging
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        if (typeof window !== "undefined") {
          const token = this.getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        // Log requests in development
        if (process.env.NODE_ENV === "development") {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - error handling, logging
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        // Handle common errors
        if (error.response) {
          // Server responded with error
          const status = error.response.status;

          if (status === 401) {
            // Handle unauthorized - redirect to login
            if (typeof window !== "undefined") {
              window.location.href = "/signin?logout=1";
            }
          } else if (status === 403) {
            // Handle forbidden
            console.error("Access forbidden");
          } else if (status >= 500) {
            // Handle server errors
            console.error("Server error:", error.response.data);
          }
        } else if (error.request) {
          // Request made but no response
          console.error("Network error:", error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    // Get token from cookies or localStorage
    if (typeof window === "undefined") return null;

    // Implementation depends on your auth system
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((c) => c.trim().startsWith("token="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  }

  // Public methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // For legacy endpoints that need full URL
  async fetchLegacy<T = any>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const baseURL = this.getBaseUrl();
    const url = baseURL ? `${baseURL}${endpoint}` : endpoint;

    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type { AxiosRequestConfig, AxiosError };
```

**Usage Example:**

```typescript
// Before (BROKEN)
export const userLogin = async (props, req = {}) => {
  return await fetch(`${process.env.API_URL}/api/login`, {
    method: "post",
    body: JSON.stringify(props),
  });
};

// After (WORKS)
import { apiClient } from "@/lib/api-client";

export const userLogin = async (props) => {
  return await apiClient.post("/api/login", props);
};
```

#### Option B: Lightweight Fetch Wrapper (Minimal Dependencies)

**Implementation:**

```typescript
// lib/fetch-client.ts
type RequestOptions = RequestInit & {
  baseURL?: string;
  timeout?: number;
};

class FetchClient {
  private defaultOptions: RequestOptions;

  constructor() {
    this.defaultOptions = {
      credentials: "include" as RequestCredentials,
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  private getBaseUrl(): string {
    if (typeof window === "undefined") {
      // Server-side
      return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "";
    }
    // Client-side: use relative URLs
    return "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const baseURL = options.baseURL ?? this.getBaseUrl();
    const url = baseURL ? `${baseURL}${endpoint}` : endpoint;

    // Add timeout support
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options.timeout || 30000
    );

    try {
      const response = await fetch(url, {
        ...this.defaultOptions,
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const fetchClient = new FetchClient();
```

#### Option C: SWR/React Query Integration (Recommended for Data Fetching)

**Why SWR:**

- Built-in caching
- Automatic revalidation
- Request deduplication
- Loading/error states
- Optimistic updates
- Lightweight (~5KB)

**Implementation:**

```typescript
// lib/swr-config.ts (already exists, enhance it)
import useSWR, { SWRConfiguration } from "swr";

// Enhanced fetcher with proper URL handling
const fetcher = async (url: string) => {
  const baseURL =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || ""
      : "";

  const fullUrl = baseURL ? `${baseURL}${url}` : url;

  const response = await fetch(fullUrl, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the data.");
    // @ts-ignore
    error.info = await response.json();
    // @ts-ignore
    error.status = response.status;
    throw error;
  }

  return response.json();
};

// Export configured SWR hook
export function useApiData<T>(url: string | null, config?: SWRConfiguration) {
  return useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    ...config,
  });
}

// Usage
export function useInstitution(id: string) {
  const { data, error, isLoading } = useApiData<Institution>(
    id ? `/api/institution/${id}` : null
  );

  return { institution: data, error, isLoading };
}
```

---

### Recommendation 2: Environment Variable Strategy

#### Create Environment Configuration Module

```typescript
// lib/env-config.ts
export const envConfig = {
  // API Configuration
  api: {
    // Client-side: always use relative URLs
    baseURL:
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_API_URL ||
          process.env.API_URL ||
          "http://localhost:8080"
        : "",

    // Legacy API URL (for external Fastify backend)
    legacyURL:
      process.env.NEXT_PUBLIC_LEGACY_API_URL ||
      process.env.LEGACY_API_URL ||
      "http://localhost:8080",

    timeout: 30000,
  },

  // Feature flags
  features: {
    useNextApiRoutes: process.env.NEXT_PUBLIC_USE_NEXT_API === "true",
  },

  // Environment
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isClient: typeof window !== "undefined",
  isServer: typeof window === "undefined",
};

// Type-safe environment access
export function getApiUrl(endpoint: string, useLegacy = false): string {
  const baseURL = useLegacy ? envConfig.api.legacyURL : envConfig.api.baseURL;

  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Client-side: always use relative URLs for Next.js routes
  if (envConfig.isClient && !useLegacy) {
    return cleanEndpoint;
  }

  return baseURL ? `${baseURL}${cleanEndpoint}` : cleanEndpoint;
}
```

---

### Recommendation 3: Migration Strategy

#### Phase 1: Create API Client Infrastructure (Week 1)

1. ✅ Create `lib/api-client.ts` with Axios or fetch wrapper
2. ✅ Create `lib/env-config.ts` for environment management
3. ✅ Add request/response interceptors
4. ✅ Set up error handling
5. ✅ Write unit tests

#### Phase 2: Migrate Critical Paths (Week 2)

1. ✅ Migrate authentication flows (`userLogin`, `getInstituionByParams`)
2. ✅ Migrate apply page API calls
3. ✅ Migrate institution fetching
4. ✅ Test in production environment

#### Phase 3: Migrate Remaining Functions (Week 3-4)

1. ✅ Migrate all functions in `FetchWrapper.js`
2. ✅ Update all components using direct fetch
3. ✅ Update hooks using API calls
4. ✅ Remove old `FetchWrapper.js` functions

#### Phase 4: Enhance with SWR (Week 5)

1. ✅ Integrate SWR for data fetching
2. ✅ Add caching strategies
3. ✅ Implement optimistic updates
4. ✅ Add loading states

---

### Recommendation 4: Code Patterns

#### Pattern 1: API Service Layer

```typescript
// lib/api/services/institution.service.ts
import { apiClient } from "../api-client";

export interface Institution {
  id: number;
  name: string;
  website: string;
  logo?: string;
}

export const institutionService = {
  async getById(id: string | number): Promise<Institution> {
    return apiClient.get<Institution>(`/api/institution/${id}`);
  },

  async getByUrl(url: string): Promise<Institution> {
    return apiClient.post<Institution>("/api/institution/params", { url });
  },

  async getAll(): Promise<Institution[]> {
    return apiClient.get<Institution[]>("/api/institution");
  },
};
```

#### Pattern 2: React Hooks with SWR

```typescript
// hooks/useInstitution.ts
import useSWR from "swr";
import { institutionService } from "@/lib/api/services/institution.service";

export function useInstitution(id?: string | number) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? [`institution`, id] : null,
    ([, institutionId]) => institutionService.getById(institutionId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    institution: data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

export function useInstitutionByUrl(url?: string) {
  const { data, error, isLoading } = useSWR(
    url ? [`institution-url`, url] : null,
    ([, institutionUrl]) => institutionService.getByUrl(institutionUrl)
  );

  return {
    institution: data,
    isLoading,
    isError: error,
  };
}
```

#### Pattern 3: Mutation Hooks

```typescript
// hooks/useInstitutionMutations.ts
import { useSWRConfig } from "swr";
import { institutionService } from "@/lib/api/services/institution.service";
import { toast } from "react-hot-toast";

export function useInstitutionMutations() {
  const { mutate } = useSWRConfig();

  const updateInstitution = async (id: number, data: Partial<Institution>) => {
    try {
      const updated = await institutionService.update(id, data);

      // Revalidate cache
      mutate([`institution`, id], updated, false);

      toast.success("Institution updated successfully");
      return updated;
    } catch (error) {
      toast.error("Failed to update institution");
      throw error;
    }
  };

  return { updateInstitution };
}
```

---

### Recommendation 5: Error Handling Strategy

```typescript
// lib/api/errors.ts
export class ApiError extends Error {
  constructor(message: string, public status: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

// Error handler
export function handleApiError(error: unknown): never {
  if (error instanceof ApiError) {
    // Handle API errors
    switch (error.status) {
      case 401:
        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/signin?logout=1";
        }
        break;
      case 403:
        toast.error("You do not have permission to perform this action");
        break;
      case 404:
        toast.error("Resource not found");
        break;
      case 500:
        toast.error("Server error. Please try again later");
        break;
      default:
        toast.error(error.message || "An error occurred");
    }
    throw error;
  }

  if (error instanceof NetworkError) {
    toast.error("Network error. Please check your connection");
    throw error;
  }

  // Unknown error
  console.error("Unknown error:", error);
  toast.error("An unexpected error occurred");
  throw error;
}
```

---

## Implementation Checklist

### Immediate Actions (Critical)

- [ ] Create centralized API client (`lib/api-client.ts`)
- [ ] Create environment config module (`lib/env-config.ts`)
- [ ] Fix `getInstituionByParams` function
- [ ] Fix all apply page API calls
- [ ] Test in production environment

### Short-term (1-2 weeks)

- [ ] Migrate all `FetchWrapper.js` functions
- [ ] Add request/response interceptors
- [ ] Implement error handling
- [ ] Add logging for debugging
- [ ] Write migration tests

### Medium-term (1 month)

- [ ] Integrate SWR for data fetching
- [ ] Create service layer for all API endpoints
- [ ] Add React hooks for common data fetching
- [ ] Implement caching strategies
- [ ] Add request cancellation support

### Long-term (2-3 months)

- [ ] Migrate to TypeScript throughout
- [ ] Add API documentation
- [ ] Implement request/response type safety
- [ ] Add integration tests
- [ ] Performance optimization

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/lib/api-client.test.ts
import { apiClient } from "@/lib/api-client";

describe("ApiClient", () => {
  it("should use relative URLs in browser", () => {
    // Mock window
    Object.defineProperty(window, "location", {
      value: { origin: "https://example.com" },
    });

    // Test that baseURL is empty string
    expect(apiClient.getBaseUrl()).toBe("");
  });

  it("should use environment variable on server", () => {
    // Test server-side behavior
  });
});
```

### Integration Tests

- Test API calls in different environments
- Test error handling
- Test authentication flow
- Test CORS behavior

---

## Performance Considerations

### Bundle Size

- **Axios**: ~13KB gzipped
- **SWR**: ~5KB gzipped
- **Fetch wrapper**: ~2KB gzipped

### Recommendations

- Use SWR for data fetching (smaller, better caching)
- Use lightweight fetch wrapper if bundle size is critical
- Use Axios only if you need advanced features

---

## Conclusion

The current API URL construction issues stem from:

1. Direct usage of server-only environment variables in client code
2. Lack of centralized API client
3. Inconsistent patterns across the codebase

**Recommended Solution:**

1. Implement Axios-based API client for full control
2. Use SWR for data fetching hooks
3. Create service layer for type safety
4. Migrate gradually with proper testing

This approach will:

- ✅ Fix CORS issues
- ✅ Provide consistent API access
- ✅ Enable better error handling
- ✅ Improve developer experience
- ✅ Support future scalability

---

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [SWR Documentation](https://swr.vercel.app/)
- [React Query Documentation](https://tanstack.com/query/latest)

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-29  
**Author**: AI Assistant  
**Status**: Draft for Review
