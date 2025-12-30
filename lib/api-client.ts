/**
 * Standardized API Client for Next.js
 * 
 * Features:
 * - Single source of truth for all API requests
 * - Comprehensive request/response logging
 * - Performance monitoring and tracking
 * - Request deduplication to prevent duplicate calls
 * - Error tracking and reporting
 * - Works for both client and server-side
 */

interface RequestLog {
  method: string;
  endpoint: string;
  timestamp: number;
  duration?: number;
  status?: number;
  statusText?: string;
  error?: string;
  requestSize?: number;
  responseSize?: number;
  cached?: boolean;
}

interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalDuration: number;
  averageDuration: number;
  slowRequests: RequestLog[];
  duplicateRequests: number;
  totalRequestSize: number;
  totalResponseSize: number;
}

class ApiClient {
  private requestCache = new Map<string, { promise: Promise<any>; timestamp: number }>();
  private requestLogs: RequestLog[] = [];
  private readonly CACHE_DURATION = 100; // 100ms deduplication window
  private readonly SLOW_REQUEST_THRESHOLD = 1000; // 1 second
  private readonly MAX_LOGS = 1000; // Keep last 1000 requests

  /**
   * Generate cache key for request deduplication
   */
  private getCacheKey(method: string, endpoint: string, body?: any): string {
    const bodyHash = body ? JSON.stringify(body).slice(0, 100) : "";
    return `${method}:${endpoint}:${bodyHash}`;
  }

  /**
   * Log request for monitoring
   */
  private logRequest(log: RequestLog): void {
    this.requestLogs.push(log);
    
    // Keep only last MAX_LOGS entries
    if (this.requestLogs.length > this.MAX_LOGS) {
      this.requestLogs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      const logMessage = `[API] ${log.method} ${log.endpoint} - ${log.duration}ms - ${log.status || "ERROR"}`;
      
      if (log.error) {
        console.error(logMessage, log.error);
      } else if (log.duration && log.duration > this.SLOW_REQUEST_THRESHOLD) {
        console.warn(`⚠️ ${logMessage} (SLOW)`);
      } else {
        console.log(logMessage);
      }
    }

    // Log to server in production (you can extend this to send to monitoring service)
    if (process.env.NODE_ENV === "production" && typeof window === "undefined") {
      // Server-side logging - can be extended to send to monitoring service
      if (log.error || (log.duration && log.duration > this.SLOW_REQUEST_THRESHOLD)) {
        console.error("[API Error/Slow]", {
          method: log.method,
          endpoint: log.endpoint,
          duration: log.duration,
          status: log.status,
          error: log.error,
        });
      }
    }
  }

  /**
   * Calculate request/response sizes
   */
  private calculateSize(data: any): number {
    if (!data) return 0;
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return JSON.stringify(data).length;
    }
  }

  /**
   * Core request method with logging and performance tracking
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit & { serverRequest?: Request } = {}
  ): Promise<{ data: T; status: number; statusText: string; headers: Headers }> {
    const method = options.method || "GET";
    const { serverRequest, ...fetchOptions } = options;
    
    // Use performance.now() if available, fallback to Date.now()
    const perfNow = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    const startTime = perfNow;
    const timestamp = Date.now();
    
    // Ensure endpoint starts with /
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    
    // Determine URL - server-side needs absolute URL
    let url: string;
    if (typeof window === "undefined" && serverRequest) {
      // Server-side: construct absolute URL
      try {
        const requestUrl = new URL(serverRequest.url);
        url = `${requestUrl.origin}${cleanEndpoint}`;
      } catch {
        url = cleanEndpoint;
      }
    } else {
      // Client-side: use relative URL
      url = cleanEndpoint;
    }

    // Calculate request size
    const requestSize = options.body ? this.calculateSize(options.body) : 0;

    // Check for duplicate requests (deduplication)
    const cacheKey = this.getCacheKey(method, cleanEndpoint, options.body);
    const cached = this.requestCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      this.logRequest({
        method,
        endpoint: cleanEndpoint,
        timestamp,
        cached: true,
      });
      return cached.promise;
    }

    // Create request promise
    const requestPromise = (async () => {
      try {
        // Always include credentials for cookie-based auth
        const defaultOptions: RequestInit = {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            // Server-side: forward cookies from request
            ...(typeof window === "undefined" && serverRequest && serverRequest.headers.get("cookie")
              ? { Cookie: serverRequest.headers.get("cookie") || "" }
              : {}),
            ...fetchOptions.headers,
          },
        };

        const response = await fetch(url, {
          ...defaultOptions,
          ...fetchOptions,
        });

        const perfNow = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        const endTime = perfNow;
        const duration = Math.round(endTime - startTime);

        let data: T;
        const contentType = response.headers.get("content-type");
        const responseSize = response.headers.get("content-length") 
          ? parseInt(response.headers.get("content-length") || "0")
          : 0;

        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else {
          data = (await response.text()) as any;
        }

        // Log successful request
        this.logRequest({
          method,
          endpoint: cleanEndpoint,
          timestamp,
          duration,
          status: response.status,
          statusText: response.statusText,
          requestSize,
          responseSize: responseSize || this.calculateSize(data),
        });

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
        const unwrappedData = (data as any)?.data !== undefined ? (data as any).data : data;

        return {
          data: unwrappedData,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      } catch (error: any) {
        const perfNow = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        const endTime = perfNow;
        const duration = Math.round(endTime - startTime);

        // Log failed request
        this.logRequest({
          method,
          endpoint: cleanEndpoint,
          timestamp,
          duration,
          status: error.status,
          statusText: error.statusText,
          error: error.message || String(error),
          requestSize,
        });

        throw error;
      } finally {
        // Clean up cache after request completes
        setTimeout(() => {
          this.requestCache.delete(cacheKey);
        }, this.CACHE_DURATION);
      }
    })();

    // Cache the promise
    this.requestCache.set(cacheKey, {
      promise: requestPromise,
      timestamp: Date.now(),
    });

    return requestPromise;
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: RequestInit & { serverRequest?: Request }): Promise<T> {
    const response = await this.request<T>(endpoint, { ...options, method: "GET" });
    return response.data;
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any, options?: RequestInit & { serverRequest?: Request }): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any, options?: RequestInit & { serverRequest?: Request }): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any, options?: RequestInit & { serverRequest?: Request }): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options?: RequestInit & { serverRequest?: Request }): Promise<T> {
    const response = await this.request<T>(endpoint, { ...options, method: "DELETE" });
    return response.data;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const successful = this.requestLogs.filter((log) => log.status && log.status < 400);
    const failed = this.requestLogs.filter((log) => log.error || (log.status && log.status >= 400));
    const totalDuration = this.requestLogs
      .filter((log) => log.duration)
      .reduce((sum, log) => sum + (log.duration || 0), 0);
    const averageDuration = successful.length > 0 ? totalDuration / successful.length : 0;
    const slowRequests = this.requestLogs.filter(
      (log) => log.duration && log.duration > this.SLOW_REQUEST_THRESHOLD
    );
    const duplicateRequests = this.requestLogs.filter((log) => log.cached).length;
    const totalRequestSize = this.requestLogs.reduce(
      (sum, log) => sum + (log.requestSize || 0),
      0
    );
    const totalResponseSize = this.requestLogs.reduce(
      (sum, log) => sum + (log.responseSize || 0),
      0
    );

    return {
      totalRequests: this.requestLogs.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      totalDuration,
      averageDuration: Math.round(averageDuration),
      slowRequests: slowRequests.slice(-10), // Last 10 slow requests
      duplicateRequests,
      totalRequestSize,
      totalResponseSize,
    };
  }

  /**
   * Get recent request logs
   */
  getRecentLogs(limit: number = 50): RequestLog[] {
    return this.requestLogs.slice(-limit).reverse();
  }

  /**
   * Clear logs (useful for testing or memory management)
   */
  clearLogs(): void {
    this.requestLogs = [];
    this.requestCache.clear();
  }

  /**
   * Get slow requests (requests taking longer than threshold)
   */
  getSlowRequests(): RequestLog[] {
    return this.requestLogs.filter(
      (log) => log.duration && log.duration > this.SLOW_REQUEST_THRESHOLD
    );
  }

  /**
   * Get duplicate requests count
   */
  getDuplicateRequestsCount(): number {
    return this.requestLogs.filter((log) => log.cached).length;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type { RequestLog, PerformanceMetrics };

// Export convenience methods matching the old api wrapper
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit & { serverRequest?: Request }) =>
    apiClient.get<T>(endpoint, options),
  post: <T = any>(endpoint: string, data?: any, options?: RequestInit & { serverRequest?: Request }) =>
    apiClient.post<T>(endpoint, data, options),
  put: <T = any>(endpoint: string, data?: any, options?: RequestInit & { serverRequest?: Request }) =>
    apiClient.put<T>(endpoint, data, options),
  patch: <T = any>(endpoint: string, data?: any, options?: RequestInit & { serverRequest?: Request }) =>
    apiClient.patch<T>(endpoint, data, options),
  delete: <T = any>(endpoint: string, options?: RequestInit & { serverRequest?: Request }) =>
    apiClient.delete<T>(endpoint, options),
  request: <T = any>(endpoint: string, options?: RequestInit & { serverRequest?: Request }) =>
    apiClient.request<T>(endpoint, options),
};

// Export metrics access
export const getApiMetrics = () => apiClient.getMetrics();
export const getRecentApiLogs = (limit?: number) => apiClient.getRecentLogs(limit);
export const getSlowApiRequests = () => apiClient.getSlowRequests();
export const clearApiLogs = () => apiClient.clearLogs();

