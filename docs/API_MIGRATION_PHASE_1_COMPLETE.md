# API Migration Progress - Phase 1 Complete

## Overview

Successfully implemented Phase 1 of the Fastify to Next.js API migration with feature flag infrastructure.

## Completed Infrastructure

### 1. Feature Flag System (`/lib/feature-flags.ts`)

- Per-route feature flags for granular control
- Environment variable configuration
- Development helper to enable all flags at once
- TypeScript-typed flag interface

### 2. API Wrapper (`/lib/api-wrapper.ts`)

- Minimal routing layer (not tied to axios/SWR/react-query)
- Automatic routing based on feature flags
- Maintains cookie-based auth pattern
- RESTful method shortcuts (get, post, put, patch, delete)
- Debug mode for development
- TypeScript-typed responses

## Completed API Endpoints (Phase 1)

### Profile API (`/app/api/profile`)

- ✅ GET `/api/profile` - Get authenticated user's profile
- ✅ PUT `/api/profile` - Update user profile
- Uses proper Prisma relations for staff/student data
- Includes institution details

### Course API (`/app/api/course`)

- ✅ GET `/api/course` - List courses (role-based filtering)
- ✅ POST `/api/course` - Create new course
- ✅ GET `/api/course/[id]` - Get course details
- ✅ PUT `/api/course/[id]` - Update course
- ✅ DELETE `/api/course/[id]` - Delete course
- Role-based access (students see enrolled, lecturers see taught courses)
- Includes modules, lessons, and staff assignments

### Course Module API (`/app/api/coursemodule`)

- ✅ GET `/api/coursemodule` - List modules (filtered by course)
- ✅ POST `/api/coursemodule` - Create module
- ✅ GET `/api/coursemodule/[id]` - Get module details
- ✅ PUT `/api/coursemodule/[id]` - Update module
- ✅ DELETE `/api/coursemodule/[id]` - Delete module
- Prevents deletion if lessons exist

### Course Lesson API (`/app/api/courselesson`)

- ✅ GET `/api/courselesson` - List lessons (filtered by module)
- ✅ POST `/api/courselesson` - Create lesson
- ✅ GET `/api/courselesson/[id]` - Get lesson details
- ✅ PUT `/api/courselesson/[id]` - Update lesson
- ✅ DELETE `/api/courselesson/[id]` - Delete lesson

## Key Patterns Implemented

### Authentication

- Uses existing `/lib/api-auth.ts` patterns
- `authenticateUser()` for session validation
- `hasPermission()` for role-based access
- `createSuccessResponse()` / `createAuthErrorResponse()` for consistent responses

### Database Access

- Prisma client from `/lib/db.ts`
- Raw Prisma objects returned (no transformation layer)
- camelCase fields from Prisma schema
- Proper relation loading with `include`

### Response Format

```typescript
{
  success: true,
  data: { ...prismaObject },
  user: { id, role, institution_id }
}
```

### Error Handling

```typescript
{
  success: false,
  error: "Error message",
  message: "Detailed error"
}
```

## How to Enable Phase 1 APIs

### 1. Add to `.env` or `.env.local`:

```bash
USE_NEXTJS_PROFILE=true
USE_NEXTJS_COURSES=true
USE_NEXTJS_COURSE_MODULES=true
USE_NEXTJS_COURSE_LESSONS=true
```

### 2. Test with API wrapper:

```typescript
import { api } from "@/lib/api-wrapper";

// This will automatically route to Next.js or Fastify based on flags
const response = await api.get("/api/profile");
const courses = await api.get("/api/course", { params: { pgsize: 50 } });
```

### 3. Verify routing (development):

```bash
DEBUG_API_ROUTING=true
```

This logs each request and which backend it routes to.

## Next Steps

### Phase 2: Announcements (Ready to implement)

- `/api/announcements` - CRUD operations
- `/api/announcements/search` - Search functionality
- `/api/announcements/[id]/read` - Read tracking
- `/api/announcements/mark-all-read` - Bulk operations

### Phase 3: Forum & Connect (Ready to implement)

- `/api/forum/topics` - School-wide forums
- `/api/forum/course` - Course-specific forums
- `/api/discussion` - Time-bound discussions
- `/api/forum/posts` - Nested comments/replies

### Phase 4: Assessments (Ready to implement)

- `/api/studentcourse` - Course registration
- `/api/coursetest` - Test management
- `/api/coursequestion` - Question CRUD
- `/api/studenttest` - Submissions & grading

### Phase 5: Frontend Updates

- Update components in `app/(dashboard)` and `app/(simple)`
- Replace `FetchWrapper.js` calls with `api-wrapper.ts`
- Handle Prisma response formats
- Add proper error boundaries and loading states

### Phase 6: Deprecation

- Enable all feature flags
- Remove Fastify dependencies
- Delete legacy backend routes
- Update all remaining API calls

## Testing Checklist

- [ ] Test profile GET/PUT with different roles
- [ ] Test course CRUD with ADMIN/LECTURER roles
- [ ] Test course module/lesson operations
- [ ] Verify role-based filtering works correctly
- [ ] Test error responses (401, 403, 404, 500)
- [ ] Verify feature flags route correctly
- [ ] Test with mixed flag configuration (some true, some false)

## Notes

- All endpoints use existing authentication from `/lib/api-auth.ts`
- Prisma schema field names used directly (no transformation)
- Relations properly loaded with `include`
- Frontend will need updates to handle Prisma response structure
- Feature flags allow gradual, safe rollout
- API wrapper keeps frontend flexible for future changes (SWR, react-query, etc.)
