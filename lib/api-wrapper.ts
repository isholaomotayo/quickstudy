/**
 * API Wrapper - Minimal routing layer for Fastify -> Next.js migration
 * Routes requests to legacy Fastify or new Next.js APIs based on feature flags
 */

import { featureFlags } from "./feature-flags";

/**
 * API request options
 */
export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, any>;
  baseURL?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

/**
 * Route configuration for API endpoints
 */
interface RouteConfig {
  pattern: RegExp;
  flag: keyof typeof featureFlags;
}

/**
 * Route mapping for feature flags
 */
const routeMapping: RouteConfig[] = [
  // Phase 1: Core APIs
  { pattern: /^\/api\/profile/, flag: "USE_NEXTJS_PROFILE" },
  {
    pattern: /^\/api\/course(?!module|lesson|announcement|test|question)/,
    flag: "USE_NEXTJS_COURSES",
  },
  { pattern: /^\/api\/coursemodule/, flag: "USE_NEXTJS_COURSE_MODULES" },
  { pattern: /^\/api\/courselesson/, flag: "USE_NEXTJS_COURSE_LESSONS" },

  // Phase 2: Announcements
  {
    pattern: /^\/api\/(school)?announcement/,
    flag: "USE_NEXTJS_ANNOUNCEMENTS",
  },
  { pattern: /^\/api\/courseannouncement/, flag: "USE_NEXTJS_ANNOUNCEMENTS" },

  // Phase 3: Forum & Connect
  { pattern: /^\/api\/(course)?forum/, flag: "USE_NEXTJS_FORUM" },
  { pattern: /^\/api\/discussion/, flag: "USE_NEXTJS_DISCUSSION" },

  // Phase 4: Student Course & Assessments
  { pattern: /^\/api\/course-register/, flag: "USE_NEXTJS_STUDENT_COURSE" },
  { pattern: /^\/api\/studentcourse/, flag: "USE_NEXTJS_STUDENT_COURSE" },
  { pattern: /^\/api\/coursetest/, flag: "USE_NEXTJS_TESTS" },
  { pattern: /^\/api\/coursequestion/, flag: "USE_NEXTJS_TESTS" },
  { pattern: /^\/api\/studenttest/, flag: "USE_NEXTJS_TESTS" },

  // Additional APIs
  { pattern: /^\/api\/studentresult/, flag: "USE_NEXTJS_RESULTS" },
  { pattern: /^\/api\/studentgpa/, flag: "USE_NEXTJS_RESULTS" },
  { pattern: /^\/api\/payment2/, flag: "USE_NEXTJS_PAYMENTS" },
  { pattern: /^\/api\/calendar/, flag: "USE_NEXTJS_CALENDAR" },
];

/**
 * Determine if request should use Next.js API or Fastify
 */
function shouldUseNextJS(endpoint: string): boolean {
  const route = routeMapping.find((r) => r.pattern.test(endpoint));
  if (!route) return false;
  return featureFlags[route.flag];
}

/**
 * Build full URL for API request
 */
function buildURL(endpoint: string, params?: Record<string, any>): string {
  const useNextJS = shouldUseNextJS(endpoint);
  const baseURL = useNextJS ? "" : process.env.API_URL || "";

  let url = `${baseURL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  return url;
}

/**
 * Core request method
 */
async function request<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, baseURL, ...fetchOptions } = options;

  const url = baseURL ? `${baseURL}${endpoint}` : buildURL(endpoint, params);

  // Always include credentials for cookie-based auth
  const defaultOptions: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...fetchOptions,
  });

  let data: T;
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = (await response.text()) as any;
  }

  if (!response.ok) {
    throw {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      message:
        (data as any)?.message || (data as any)?.error || response.statusText,
    };
  }

  // Unwrap the data property if it exists (for Next.js API routes)
  // This handles responses like { success: true, data: {...} }
  const unwrappedData = (data as any)?.data !== undefined ? (data as any).data : data;

  return {
    data: unwrappedData,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  };
}

/**
 * API client with method shortcuts
 */
export const api = {
  /**
   * GET request - returns just the data
   */
  get: async <T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> => {
    const response = await request<T>(endpoint, { ...options, method: "GET" });
    return response.data;
  },

  /**
   * POST request - returns just the data
   */
  post: async <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> => {
    const response = await request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data;
  },

  /**
   * PUT request - returns just the data
   */
  put: async <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> => {
    const response = await request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data;
  },

  /**
   * PATCH request - returns just the data
   */
  patch: async <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> => {
    const response = await request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data;
  },

  /**
   * DELETE request - returns just the data
   */
  delete: async <T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> => {
    const response = await request<T>(endpoint, { ...options, method: "DELETE" });
    return response.data;
  },

  /**
   * Raw request method for custom configurations - returns full response with status, headers
   */
  request,
};

/**
 * Helper to check which API backend will be used
 */
export function getAPIBackend(endpoint: string): "nextjs" | "fastify" {
  return shouldUseNextJS(endpoint) ? "nextjs" : "fastify";
}

/**
 * Development helper to log API routing decisions
 */
if (
  process.env.NODE_ENV === "development" &&
  process.env.DEBUG_API_ROUTING === "true"
) {
  const originalRequest = api.request;
  api.request = async (endpoint: string, options?: ApiRequestOptions) => {
    const backend = getAPIBackend(endpoint);
    console.log(`[API] ${options?.method || "GET"} ${endpoint} -> ${backend}`);
    return originalRequest(endpoint, options);
  };
}
