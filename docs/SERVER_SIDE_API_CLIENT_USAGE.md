# Server-Side API Client Usage

## Current State

### Server-Side Fetch Calls: **14 calls across 9 files**

The API client **now supports server-side usage**, but currently **NONE of the server-side fetch calls are using it**. They're all using direct `fetch()` calls with `getServerApiUrl()` helper.

## How to Use API Client Server-Side

### Option 1: Using getServerApiClient (Recommended)

```typescript
// app/api/studentcourses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerApiClient } from '@/lib/api-client-server';

export async function GET(request: NextRequest) {
  try {
    // Get server-side API client
    const api = getServerApiClient(request);
    
    // Use it like normal - automatically handles server-side URL construction
    const studentCourses = await api.get('/api/studentcourse?query=params');
    
    return NextResponse.json(studentCourses);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch student courses' },
      { status: error.status || 500 }
    );
  }
}
```

### Option 2: Direct API Client with serverRequest Option

```typescript
// app/api/studentcourses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  try {
    // Pass serverRequest in options
    const studentCourses = await api.get('/api/studentcourse', {
      serverRequest: request,
    });
    
    return NextResponse.json(studentCourses);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch student courses' },
      { status: error.status || 500 }
    );
  }
}
```

## Migration Example

### Before (Current Implementation)

```typescript
// app/api/studentcourses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerApiUrl } from '@/lib/server-api-url';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    // Manual fetch with getServerApiUrl
    const response = await fetch(getServerApiUrl(request, `/api/studentcourse?${queryString}`), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        ...(cookieString && { Cookie: cookieString }),
      },
    });

    if (!response.ok) {
      console.error(`Backend API error: ${response.status}`);
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch student courses', details: errorText, status: response.status },
        { status: response.status }
      );
    }

    const studentCourses = await response.json();
    return NextResponse.json(studentCourses);
  } catch (error) {
    console.error('Error in student courses API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student courses' },
      { status: 500 }
    );
  }
}
```

### After (Using API Client)

```typescript
// app/api/studentcourses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerApiClient } from '@/lib/api-client-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    // Get server-side API client
    const api = getServerApiClient(request);
    
    // Simple, clean API call with automatic logging and monitoring
    const studentCourses = await api.get(`/api/studentcourse?${queryString}`);
    
    return NextResponse.json(studentCourses);
  } catch (error: any) {
    // Error is automatically logged by API client
    return NextResponse.json(
      { error: 'Failed to fetch student courses', details: error.message },
      { status: error.status || 500 }
    );
  }
}
```

## Benefits of Migration

### 1. Automatic Logging
- All server-side requests are logged
- Duration tracked automatically
- Errors logged with context

### 2. Performance Monitoring
- Slow requests automatically identified
- Metrics available via `/api/admin/metrics`
- Helps identify database bottlenecks

### 3. Request Deduplication
- Prevents duplicate requests within 100ms
- Reduces database load
- Lowers compute costs

### 4. Consistent Error Handling
- Standardized error responses
- Better error messages
- Automatic error logging

### 5. Less Code
- No manual URL construction
- No manual cookie handling
- No manual error parsing

## Files That Need Migration

1. ✅ `app/api/application/progress/route.ts` - 4 fetch calls
2. ✅ `app/api/application/load/route.ts` - 2 fetch calls
3. ✅ `app/api/studentcourses/route.ts` - 1 fetch call
4. ✅ `app/api/courses/[courseId]/semesters/route.ts` - 1 fetch call
5. ✅ `app/api/studentresult/route.ts` - 1 fetch call
6. ✅ `app/api/studentgpa/batch/route.ts` - 1 fetch call
7. ✅ `app/api/grades/config/route.ts` - 1 fetch call
8. ✅ `app/api/dashboard/grades/[id]/route.ts` - 2 fetch calls
9. ✅ `app/api/courses/[courseId]/template/route.ts` - 1 fetch call

**Total: 14 fetch calls to migrate**

## Server Actions

Server actions (files with `"use server"`) typically don't make internal API calls - they call database functions directly. However, if they do need to make API calls, they can use the same pattern:

```typescript
// app/apply/action.ts
"use server";

import { api } from "@/lib/api-client";
import { headers } from "next/headers";

export async function someAction() {
  // For server actions, you need to construct the request manually
  // or use a different approach since there's no NextRequest
  // In most cases, server actions should call database functions directly
  // instead of making HTTP requests
}
```

## Summary

- **Current**: 14 server-side fetch calls using direct `fetch()` with `getServerApiUrl()`
- **API Client**: Now fully supports server-side usage
- **Migration**: All 14 calls should be migrated to use `getServerApiClient()`
- **Benefits**: Logging, monitoring, deduplication, and cost reduction

