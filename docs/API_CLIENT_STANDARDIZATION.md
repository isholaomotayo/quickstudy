# API Client Standardization

## Overview

All API requests in the application should use the standardized API client located at `lib/api-client.ts`. This ensures:

- **Single source of truth** for all API requests
- **Comprehensive logging** of all requests and responses
- **Performance monitoring** to identify slow requests
- **Request deduplication** to prevent unnecessary duplicate calls
- **Error tracking** for debugging and monitoring
- **Consistent behavior** across the entire application

## Usage

### Basic Usage

```typescript
import { api } from "@/lib/api-client";

// GET request
const courses = await api.get("/api/course");

// POST request
const newCourse = await api.post("/api/course", {
  name: "Introduction to Computer Science",
  code: "CS101",
});

// PUT request
const updated = await api.put("/api/course/123", {
  name: "Advanced Computer Science",
});

// DELETE request
await api.delete("/api/course/123");
```

### With TypeScript

```typescript
import { api } from "@/lib/api-client";

interface Course {
  id: number;
  name: string;
  code: string;
}

// Type-safe requests
const course: Course = await api.get<Course>("/api/course/123");
const courses: Course[] = await api.get<Course[]>("/api/course");
```

### Custom Options

```typescript
import { api } from "@/lib/api-client";

// Custom headers
const data = await api.get("/api/course", {
  headers: {
    "Custom-Header": "value",
  },
});

// Custom fetch options
const response = await api.request("/api/course", {
  method: "GET",
  cache: "no-store",
});
```

## Features

### 1. Automatic Logging

All requests are automatically logged with:
- Method and endpoint
- Request duration
- Status code
- Request/response sizes
- Errors (if any)

**Development Mode:**
- Logs appear in browser console and server logs
- Slow requests (>1s) are highlighted with ⚠️
- Errors are logged with full details

**Production Mode:**
- Errors and slow requests are logged to server
- Can be extended to send to monitoring services (Datadog, Sentry, etc.)

### 2. Request Deduplication

The client automatically prevents duplicate requests within a 100ms window. If the same request is made multiple times quickly, only one actual request is sent, and all callers receive the same response.

```typescript
// These two calls will result in only ONE actual request
const promise1 = api.get("/api/course");
const promise2 = api.get("/api/course"); // Cached, uses same promise
```

### 3. Performance Monitoring

Track API performance metrics:

```typescript
import { getApiMetrics, getSlowApiRequests, getRecentApiLogs } from "@/lib/api-client";

// Get overall metrics
const metrics = getApiMetrics();
console.log(metrics);
// {
//   totalRequests: 150,
//   successfulRequests: 145,
//   failedRequests: 5,
//   averageDuration: 234,
//   slowRequests: [...],
//   duplicateRequests: 12,
//   totalRequestSize: 1024000,
//   totalResponseSize: 2048000
// }

// Get slow requests
const slowRequests = getSlowApiRequests();
// Returns all requests that took longer than 1 second

// Get recent logs
const recentLogs = getRecentApiLogs(50);
// Returns last 50 requests
```

### 4. Admin Metrics Dashboard

Access the metrics dashboard at `/api/admin/metrics` (admin only) or use the `ApiMetricsPanel` component:

```typescript
import { ApiMetricsPanel } from "@/components/admin/ApiMetricsPanel";

// In your admin page
<ApiMetricsPanel />
```

## Migration Guide

### From Direct Fetch Calls

**Before:**
```typescript
const response = await fetch("/api/course", {
  method: "GET",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
});
const data = await response.json();
```

**After:**
```typescript
import { api } from "@/lib/api-client";
const data = await api.get("/api/course");
```

### From api-wrapper.ts

The old `api-wrapper.ts` is now a compatibility layer that delegates to the new client. You can continue using it, but new code should import directly from `api-client.ts`:

**Old (still works):**
```typescript
import { api } from "@/lib/api-wrapper";
```

**New (recommended):**
```typescript
import { api } from "@/lib/api-client";
```

### From FetchWrapper.js

**Before:**
```javascript
import { getCourseById } from "@/helpers/FetchWrapper";

const course = await getCourseById(123);
```

**After:**
```typescript
import { api } from "@/lib/api-client";

const course = await api.get("/api/course/123");
```

## Best Practices

### 1. Always Use the API Client

❌ **Don't:**
```typescript
const response = await fetch("/api/course");
```

✅ **Do:**
```typescript
const courses = await api.get("/api/course");
```

### 2. Use TypeScript Types

✅ **Do:**
```typescript
interface Course {
  id: number;
  name: string;
}

const course = await api.get<Course>("/api/course/123");
```

### 3. Handle Errors Properly

```typescript
try {
  const course = await api.get("/api/course/123");
} catch (error: any) {
  if (error.status === 404) {
    // Handle not found
  } else if (error.status >= 500) {
    // Handle server error
  }
}
```

### 4. Use SWR for Data Fetching

For React components, use SWR with the API client:

```typescript
import useSWR from "swr";
import { api } from "@/lib/api-client";

function CourseList() {
  const { data, error, isLoading } = useSWR(
    "/api/course",
    (url) => api.get(url)
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* Render courses */}</div>;
}
```

## Monitoring and Debugging

### View Metrics in Development

In development mode, all requests are logged to the console:
```
[API] GET /api/course - 234ms - 200
[API] POST /api/course - 456ms - 201
⚠️ [API] GET /api/student/123 - 1234ms - 200 (SLOW)
[API] GET /api/course - 0ms - 200 (CACHED)
```

### Access Admin Dashboard

1. Navigate to an admin page
2. Add the `ApiMetricsPanel` component
3. View real-time metrics, slow requests, and recent logs

### Identify Performance Issues

1. Check slow requests: `getSlowApiRequests()`
2. Review metrics: `getApiMetrics()`
3. Look for duplicate requests (high duplicate rate indicates unnecessary calls)
4. Monitor average duration trends

## Configuration

### Adjust Slow Request Threshold

Edit `lib/api-client.ts`:
```typescript
private readonly SLOW_REQUEST_THRESHOLD = 1000; // 1 second (default)
```

### Adjust Deduplication Window

Edit `lib/api-client.ts`:
```typescript
private readonly CACHE_DURATION = 100; // 100ms (default)
```

### Clear Logs

```typescript
import { clearApiLogs } from "@/lib/api-client";

// Clear all logs (useful for testing)
clearApiLogs();
```

## Server-Side Usage

For server-side API routes that need to make internal API calls, use the `getServerApiUrl` helper:

```typescript
import { getServerApiUrl } from "@/lib/server-api-url";
import { api } from "@/lib/api-client";

// In a Next.js API route
export async function GET(request: NextRequest) {
  // Construct absolute URL for server-side fetch
  const url = getServerApiUrl(request, "/api/course");
  const courses = await api.get(url);
  
  return NextResponse.json(courses);
}
```

## Troubleshooting

### Request Not Logged

- Ensure you're using `api` from `@/lib/api-client`
- Check that the request actually completed (not cancelled)
- Verify console is not filtered

### High Duplicate Request Rate

- Review component re-renders
- Use SWR or React Query for data fetching
- Implement proper caching strategies

### Slow Requests

- Check network tab for actual request duration
- Review server-side processing time
- Look for N+1 query problems
- Check database query performance

## Future Enhancements

- [ ] Integration with monitoring services (Datadog, Sentry)
- [ ] Request retry logic with exponential backoff
- [ ] Request cancellation support
- [ ] Request/response transformation hooks
- [ ] Automatic request batching
- [ ] GraphQL support




