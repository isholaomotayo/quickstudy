/**
 * API Wrapper - DEPRECATED
 * 
 * This file is kept for backward compatibility.
 * All new code should use lib/api-client.ts instead.
 * 
 * This wrapper now delegates to the standardized api-client.
 */

import { api as apiClient } from "./api-client";

// Re-export types for backward compatibility
export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, any>;
  baseURL?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

// Helper to convert params to query string
function buildURL(endpoint: string, params?: Record<string, any>): string {
  let url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

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

// Wrapper to maintain backward compatibility
async function request<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, baseURL, ...fetchOptions } = options;
  const url = baseURL ? `${baseURL}${endpoint}` : buildURL(endpoint, params);
  
  const response = await apiClient.request<T>(url, fetchOptions);
  return response;
}

/**
 * API client - delegates to standardized api-client
 * @deprecated Use lib/api-client.ts directly for new code
 */
export const api = {
  get: async <T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> => {
    const { params, ...fetchOptions } = options || {};
    const url = buildURL(endpoint, params);
    return apiClient.get<T>(url, fetchOptions);
  },

  post: async <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> => {
    const { params, ...fetchOptions } = options || {};
    const url = buildURL(endpoint, params);
    return apiClient.post<T>(url, data, fetchOptions);
  },

  put: async <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> => {
    const { params, ...fetchOptions } = options || {};
    const url = buildURL(endpoint, params);
    return apiClient.put<T>(url, data, fetchOptions);
  },

  patch: async <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> => {
    const { params, ...fetchOptions } = options || {};
    const url = buildURL(endpoint, params);
    return apiClient.patch<T>(url, data, fetchOptions);
  },

  delete: async <T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> => {
    const { params, ...fetchOptions } = options || {};
    const url = buildURL(endpoint, params);
    return apiClient.delete<T>(url, fetchOptions);
  },

  request,
};
