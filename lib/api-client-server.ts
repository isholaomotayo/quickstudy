/**
 * Server-side API Client Helper
 * 
 * Use this in Next.js API routes to get an api client instance
 * that automatically handles server-side URL construction
 */

import { api } from "./api-client";
import { NextRequest } from "next/server";

/**
 * Create server-side API client with request context
 * Returns API methods that automatically use the request for URL construction
 */
export function getServerApiClient(request: NextRequest) {
  return {
    get: <T = any>(endpoint: string, options?: RequestInit) =>
      api.get<T>(endpoint, { ...options, serverRequest: request }),
    post: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
      api.post<T>(endpoint, data, { ...options, serverRequest: request }),
    put: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
      api.put<T>(endpoint, data, { ...options, serverRequest: request }),
    patch: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
      api.patch<T>(endpoint, data, { ...options, serverRequest: request }),
    delete: <T = any>(endpoint: string, options?: RequestInit) =>
      api.delete<T>(endpoint, { ...options, serverRequest: request }),
    request: <T = any>(endpoint: string, options?: RequestInit) =>
      api.request<T>(endpoint, { ...options, serverRequest: request }),
  };
}

