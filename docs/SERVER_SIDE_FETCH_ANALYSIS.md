# Server-Side Fetch Analysis

## Current State

### Server-Side Fetch Calls Found

**Total: 14 fetch calls across 9 API route files**

1. `app/api/application/progress/route.ts` - 4 fetch calls

   - GET `/api/student/userid/${userId}`
   - PUT `/api/student/${studentId}`
   - POST `/api/student`
   - PUT `/api/user/${userId}`

2. `app/api/application/load/route.ts` - 2 fetch calls

   - GET `/api/student/userid/${userId}`
   - GET `/api/user/${userId}`

3. `app/api/studentcourses/route.ts` - 1 fetch call

   - GET `/api/studentcourse?${queryString}`

4. `app/api/courses/[courseId]/semesters/route.ts` - 1 fetch call

   - GET `/api/studentcourse/course/${courseId}/semesters`

5. `app/api/studentresult/route.ts` - 1 fetch call

   - POST `/api/studentresult`

6. `app/api/studentgpa/batch/route.ts` - 1 fetch call

   - POST `/api/studentgpa/batch`

7. `app/api/grades/config/route.ts` - 1 fetch call

   - GET `/api/grade`

8. `app/api/dashboard/grades/[id]/route.ts` - 2 fetch calls

   - DELETE `/api/studentresult/${id}`
   - PUT `/api/studentresult/${id}`

9. `app/api/courses/[courseId]/template/route.ts` - 1 fetch call
   - GET `/api/studentresult/template/${courseId}`

### Server Actions with Fetch

**Total: 1 server action with fetch**

1. `app/apply/action.ts` - 1 fetch call
   - POST to external email service (Brevo API) - This is external, not internal

## Current Implementation

### Pattern Used

All server-side fetch calls currently use:

```typescript
import { getServerApiUrl } from "@/lib/server-api-url";

const response = await fetch(getServerApiUrl(request, `/api/endpoint`), {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Cookie: request.headers.get("cookie") || "",
  },
});
```

### Issues

1. **No logging** - These requests are not logged or monitored
2. **No performance tracking** - Can't identify slow server-side requests
3. **No deduplication** - Duplicate requests can occur
4. **Inconsistent pattern** - Each route implements fetch differently
5. **Manual error handling** - Each route handles errors separately

## Solution: Use Standardized API Client

### Updated API Client

The `api-client.ts` has been updated to:

- ✅ Detect server-side context
- ✅ Automatically construct absolute URLs when needed
- ✅ Work seamlessly in both client and server contexts
- ✅ Provide logging and monitoring for server-side requests

### Migration Pattern

**Before:**

```typescript
// app/api/studentcourses/route.ts
export async function GET(request: NextRequest) {
  const response = await fetch(
    getServerApiUrl(request, `/api/studentcourse?${queryString}`),
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieString,
      },
    }
  );
  // ... manual error handling
}
```

**After:**

```typescript
// app/api/studentcourses/route.ts
import { getServerApiClient } from "@/lib/api-client-server";

export async function GET(request: NextRequest) {
  const api = getServerApiClient(request);

  try {
    const studentCourses = await api.get(`/api/studentcourse?${queryString}`);
    return NextResponse.json(studentCourses);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch student courses" },
      { status: error.status || 500 }
    );
  }
}
```

## Benefits of Migration

1. **Unified Logging** - All server-side requests logged and monitored
2. **Performance Tracking** - Identify slow server-side requests
3. **Request Deduplication** - Prevent duplicate server-side calls
4. **Consistent Error Handling** - Standardized error responses
5. **Cost Reduction** - Fewer unnecessary database queries
6. **Better Debugging** - Centralized logging makes issues easier to track

## Migration Priority

### High Priority (Most Used)

1. `app/api/application/progress/route.ts` - 4 calls, user-facing
2. `app/api/application/load/route.ts` - 2 calls, user-facing
3. `app/api/studentcourses/route.ts` - Frequently called

### Medium Priority

4. `app/api/studentresult/route.ts` - Bulk operations
5. `app/api/studentgpa/batch/route.ts` - Batch operations
6. `app/api/dashboard/grades/[id]/route.ts` - Admin operations

### Low Priority

7. `app/api/grades/config/route.ts` - Configuration endpoint
8. `app/api/courses/[courseId]/semesters/route.ts` - Less frequent
9. `app/api/courses/[courseId]/template/route.ts` - Less frequent

## Next Steps

1. Migrate server-side fetch calls to use `getServerApiClient()`
2. Monitor server-side request metrics
3. Identify and optimize slow server-side requests
4. Set up alerts for server-side errors
