# Frontend Migration Guide

## Overview

This guide covers migrating frontend components from direct `fetch()` calls to the `api-wrapper` with feature flags.

## What's Been Done ✅

### Updated Components

- ✅ **Profile Page** (`app/(dashboard)/profile/page.tsx`)
  - GET `/api/profile` - Uses `api.get()`
  - PUT `/api/profile` - Uses `api.put()` for profile updates
  - PUT `/api/profile` - Uses `api.put()` for avatar updates
  - Removed manual error checking and JSON parsing
  - Cleaner error handling with api-wrapper

## Migration Steps

### 1. Import the API Wrapper

**Before:**

```typescript
// No import or using direct fetch
```

**After:**

```typescript
import { api } from "@/lib/api-wrapper";
```

### 2. Replace GET Requests

**Before:**

```typescript
const response = await fetch("/api/profile", {
  method: "GET",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
});

if (!response.ok) {
  throw new Error("Failed to fetch profile data");
}

const data = await response.json();
```

**After:**

```typescript
const response = await api.get("/api/profile");
const data = response.data.data; // Access nested data
```

### 3. Replace POST Requests

**Before:**

```typescript
const response = await fetch("/api/course", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(courseData),
});

if (!response.ok) {
  throw new Error("Failed to create course");
}

const result = await response.json();
```

**After:**

```typescript
const response = await api.post("/api/course", courseData);
const result = response.data;
```

### 4. Replace PUT Requests

**Before:**

```typescript
const response = await fetch(`/api/profile`, {
  method: "PUT",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.message || "Failed to update profile");
}

const updatedData = await response.json();
```

**After:**

```typescript
const response = await api.put("/api/profile", payload);
// response.data already contains the parsed data
toast.success(response.data.message || "Profile updated successfully");
```

### 5. Replace DELETE Requests

**Before:**

```typescript
const response = await fetch(`/api/course/${courseId}`, {
  method: "DELETE",
  credentials: "include",
});

if (!response.ok) {
  throw new Error("Failed to delete course");
}
```

**After:**

```typescript
await api.delete(`/api/course/${courseId}`);
```

### 6. Handle Query Parameters

**Before:**

```typescript
const response = await fetch(
  `/api/course?page=${page}&limit=${limit}&search=${searchTerm}`,
  { credentials: "include" }
);
```

**After:**

```typescript
const response = await api.get("/api/course", {
  params: {
    page,
    limit,
    search: searchTerm,
  },
});
```

## Components Needing Updates

### Priority 1: High Usage Components

1. **Course Management**

   - `app/(dashboard)/course-viewer/components/AdminToolbar.tsx`
   - `app/(dashboard)/course-viewer/components/TestSection.tsx`
   - Uses: `/api/courselesson`, `/api/coursetest`, `/api/coursequestion`

2. **Immersive Test**

   - `app/(dashboard)/immersive-test/components/AssignmentManager.tsx`
   - `app/(dashboard)/immersive-test/components/AssignmentSubmission.tsx`
   - Uses: `/api/coursetest`, `/api/coursequestion`, `/api/studenttest`

3. **Student Management**

   - `app/(dashboard)/students/page.jsx`
   - Uses: Dashboard data endpoints

4. **Program Management**
   - `app/(dashboard)/profile/programs/page.tsx`
   - Uses: `/api/student/context`

### Priority 2: Additional Components

Search for components using these patterns:

```bash
# Find direct fetch usage
grep -r "fetch(" app/(dashboard)

# Find API_URL usage
grep -r "API_URL" app/(dashboard)

# Find FetchWrapper imports
grep -r "FetchWrapper" app/(dashboard)
```

## Response Structure

### Old Fastify Response

```json
{
  "status": "success",
  "data": { ... }
}
```

### New Next.js Response (via api-wrapper)

```json
{
  "success": true,
  "data": { ... },
  "user": { ... }
}
```

### Accessing Data

```typescript
// api-wrapper returns: {data, status, statusText, headers}
const response = await api.get("/api/profile");

// Next.js API returns: {success, data, user}
const actualData = response.data.data;
const user = response.data.user;
```

## Error Handling

### Old Pattern

```typescript
try {
  const response = await fetch("/api/course");

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  const data = await response.json();
} catch (error) {
  console.error(error);
}
```

### New Pattern

```typescript
try {
  const response = await api.get("/api/course");
  const data = response.data;
} catch (error: any) {
  // error contains: {data, status, statusText, message}
  console.error(error.message);

  // Handle specific status codes
  if (error.status === 403) {
    toast.error("You don't have permission");
  } else {
    toast.error(error.message || "An error occurred");
  }
}
```

## Common Patterns

### Pattern 1: List with Pagination

```typescript
const fetchCourses = async (page: number, limit: number = 10) => {
  try {
    const response = await api.get("/api/course", {
      params: { page, limit },
    });
    setCourses(response.data.data);
    setTotalPages(response.data.pagination?.totalPages || 1);
  } catch (error: any) {
    toast.error(error.message || "Failed to fetch courses");
  }
};
```

### Pattern 2: Create with Form Data

```typescript
const handleCreateCourse = async (formData: CourseFormData) => {
  try {
    setLoading(true);
    const response = await api.post("/api/course", formData);
    toast.success("Course created successfully");
    router.push(`/dashboard/courses/${response.data.data.id}`);
  } catch (error: any) {
    toast.error(error.message || "Failed to create course");
  } finally {
    setLoading(false);
  }
};
```

### Pattern 3: Update with Optimistic UI

```typescript
const handleUpdateCourse = async (courseId: number, updates: any) => {
  // Optimistic update
  const previousCourses = [...courses];
  setCourses(
    courses.map((c) => (c.id === courseId ? { ...c, ...updates } : c))
  );

  try {
    await api.put(`/api/course/${courseId}`, updates);
    toast.success("Course updated");
  } catch (error: any) {
    // Rollback on error
    setCourses(previousCourses);
    toast.error(error.message || "Failed to update");
  }
};
```

### Pattern 4: Delete with Confirmation

```typescript
const handleDeleteCourse = async (courseId: number) => {
  if (!confirm("Are you sure you want to delete this course?")) {
    return;
  }

  try {
    await api.delete(`/api/course/${courseId}`);
    setCourses(courses.filter((c) => c.id !== courseId));
    toast.success("Course deleted");
  } catch (error: any) {
    toast.error(error.message || "Failed to delete");
  }
};
```

### Pattern 5: Search with Debounce

```typescript
import { useDebounce } from "@/hooks/useDebounce";

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      searchAnnouncements(debouncedSearch);
    }
  }, [debouncedSearch]);

  const searchAnnouncements = async (query: string) => {
    const response = await api.get("/api/announcements/search", {
      params: { q: query },
    });
    setResults(response.data.data);
  };
};
```

## Testing Feature Flags

### Local Development

Set environment variables in `.env.local`:

```bash
# Enable specific APIs
USE_NEXTJS_PROFILE=true
USE_NEXTJS_COURSES=true
USE_NEXTJS_ANNOUNCEMENTS=true

# Or enable all at once
ENABLE_ALL_NEXTJS_APIS=true

# Debug routing decisions
DEBUG_API_ROUTING=true
```

### Testing Strategy

1. Enable one feature flag at a time
2. Test all CRUD operations for that endpoint
3. Verify role-based permissions work
4. Check error handling
5. Move to next feature flag

### Debugging

When `DEBUG_API_ROUTING=true`, console shows:

```
[API] GET /api/profile -> nextjs
[API] POST /api/course -> nextjs
[API] GET /api/oldendpoint -> fastify
```

## Checklist for Each Component

- [ ] Import `api` from `@/lib/api-wrapper`
- [ ] Replace `fetch()` calls with `api.get/post/put/delete()`
- [ ] Remove manual `response.ok` checks
- [ ] Remove manual `response.json()` calls
- [ ] Update data access to `response.data.data`
- [ ] Remove `credentials: "include"` (automatic)
- [ ] Remove `Content-Type` header (automatic)
- [ ] Update error handling to use `error.message`
- [ ] Test with feature flags enabled
- [ ] Verify error cases still work

## Migration Priorities

### Week 1: Core Features

- [x] Profile management
- [ ] Course listing and details
- [ ] Course module/lesson viewing

### Week 2: Content Management

- [ ] Test/quiz management
- [ ] Assignment creation
- [ ] Question management

### Week 3: Student Features

- [ ] Course registration
- [ ] Test submission
- [ ] Results viewing

### Week 4: Additional Features

- [ ] Announcements
- [ ] Forum/discussions
- [ ] Search functionality

## Common Issues & Solutions

### Issue 1: Response Structure Mismatch

**Problem:** Accessing `response.data` returns undefined

**Solution:** Next.js APIs return `{success, data, user}`, so use:

```typescript
const actualData = response.data.data;
```

### Issue 2: Error Not Caught

**Problem:** Errors not showing in UI

**Solution:** api-wrapper throws on error, ensure try-catch:

```typescript
try {
  await api.post("/api/course", data);
} catch (error: any) {
  toast.error(error.message);
}
```

### Issue 3: Query Params Not Working

**Problem:** URL shows `/api/course?[object Object]`

**Solution:** Use params option:

```typescript
// Wrong
api.get(`/api/course?page=${page}`);

// Correct
api.get("/api/course", { params: { page } });
```

### Issue 4: Feature Flag Not Applied

**Problem:** Still using Fastify even with flag enabled

**Solution:**

1. Check `.env.local` has the flag
2. Restart dev server
3. Clear browser cache
4. Check endpoint matches pattern in api-wrapper

## Additional Resources

- **API Wrapper**: `/lib/api-wrapper.ts`
- **Feature Flags**: `/lib/feature-flags.ts`
- **Migration Examples**: `/docs/API_WRAPPER_MIGRATION_EXAMPLES.tsx`
- **API Progress**: `/docs/API_MIGRATION_PROGRESS.md`

## Next Steps

1. Update high-priority components (course management, tests)
2. Test each updated component thoroughly
3. Enable feature flags incrementally
4. Monitor for errors in production
5. Complete remaining components
6. Remove Fastify dependency (Phase 6)
