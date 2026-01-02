# Next.js Anti-patterns, Security & Performance Audit

## 1. Component Architecture (Client vs. Server)

### Overuse of 'use client' in Page Components

**Severity:** Medium  
**Impact:** Unnecessary client-side JavaScript bundle increases initial load time and reduces SEO benefits. Pages that only read search params don't need to be client components.  
**Location:** `app/(dashboard)/lms/webinar-v2/page.tsx:1`

**Fix:**

```typescript
// Split into Server Component wrapper and Client Component for interactivity
import { Suspense } from "react";
import dynamic from "next/dynamic";
import MeetingProvider from "@/components/lms/MeetingProvider";

const MeetingProviderClient = dynamic(() => Promise.resolve(MeetingProvider), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading webinar...</p>
      </div>
    </div>
  ),
});

// Server Component - reads searchParams
export default async function WebinarPage({
  searchParams,
}: {
  searchParams: { roomName?: string; userInfo?: string; courseCode?: string; courseName?: string; provider?: string };
}) {
  const roomName = searchParams.roomName;
  const userInfo = searchParams.userInfo;
  const courseCode = searchParams.courseCode;
  const courseName = searchParams.courseName;
  const provider = searchParams.provider || "googlemeet";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Live Classroom
          </h1>
          <p className="text-muted-foreground">
            {courseName
              ? `${courseCode} - ${courseName}`
              : "Join your live classroom session"}
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[600px]">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">Loading webinar...</p>
                </div>
              </div>
            }
          >
            <MeetingProviderClient
              roomName={roomName}
              userInfo={userInfo}
              courseCode={courseCode}
              courseName={courseName}
              preferredProvider={provider}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

### Third-Party Script Loaded Without next/script

**Severity:** High  
**Impact:** TinyMCE script loaded via `document.createElement` bypasses Next.js script optimization, blocking main thread, and doesn't benefit from Next.js script loading strategies.  
**Location:** `components/ui/tinyEditor/TinyMCEEditor.tsx:51-64`

**Fix:**

```typescript
// Use next/script in parent component or layout
import Script from "next/script";

// In TinyMCEEditor component, check if loaded:
useEffect(() => {
  if ((window as any).tinymce) {
    setIsTinyMCELoaded(true);
  } else {
    // Wait for script to load via next/script
    const checkInterval = setInterval(() => {
      if ((window as any).tinymce) {
        setIsTinyMCELoaded(true);
        clearInterval(checkInterval);
      }
    }, 100);
    return () => clearInterval(checkInterval);
  }
}, []);

// In layout or parent component:
<Script
  src="/tinymce/tinymce.min.js"
  strategy="lazyOnload"
  onLoad={() => {
    // Script loaded
  }}
/>
```

---

## 2. Data Fetching & Caching

### Waterfall Fetching in Client Components

**Severity:** High  
**Impact:** Sequential `await` calls in `fetchResults` cause unnecessary delays. Three independent API calls run one after another instead of in parallel, increasing total load time by 2-3x.  
**Location:** `app/(dashboard)/results/results-client.tsx:86-162`

**Fix:**

```typescript
const fetchResults = async () => {
  try {
    setLoading(true);
    setError(null);

    if (!userData || !userData.student_id) {
      setError("Student information not available. Please log in again.");
      return;
    }

    // Parallelize all independent fetch calls
    const [courseResultsResponse, gpasResponse, learningResultsResponse] = await Promise.all([
      fetch(`/api/studentresult/${userData.student_id}`, {
        credentials: "include",
      }),
      fetch(`/api/studentgpa/studentid/${userData.student_id}`, {
        credentials: "include",
      }),
      fetch("/api/studenttest/new", {
        credentials: "include",
      }),
    ]);

    // Process responses
    const [courseData, gpasData, learningData] = await Promise.all([
      courseResultsResponse.ok ? courseResultsResponse.json() : null,
      gpasResponse.ok ? gpasResponse.json() : null,
      learningResultsResponse.ok ? learningResultsResponse.json() : null,
    ]);

    if (courseData) {
      setCourseResults(courseData || []);
    } else if (courseResultsResponse.status === 401) {
      setError("Authentication required. Please sign in again.");
      return;
    }

    if (gpasData) {
      setStudentGpas(gpasData || []);
    } else if (gpasResponse.status === 401) {
      setError("Authentication required. Please sign in again.");
      return;
    }

    if (learningData) {
      setLearningResults(mapLearningResults(learningData));
    } else if (learningResultsResponse.status === 401) {
      setError("Authentication required. Please sign in again.");
    }
  } catch (err) {
    setError("Failed to load results. Please try again.");
    console.error("Error fetching results:", err);
  } finally {
    setLoading(false);
  }
};
```

### Missing Dynamic Export for Real-time Routes

**Severity:** Medium  
**Impact:** Routes that use `headers()` or `cookies()` without `export const dynamic = 'force-dynamic'` may be statically generated, causing stale data or authentication issues.  
**Location:** Multiple API routes and pages using authentication

**Fix:**

```typescript
// Add to any route that uses headers/cookies for auth or real-time data
export const dynamic = 'force-dynamic';

// Example in API route:
// app/api/studentresult/route.ts
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Uses cookies for auth
  const authResult = await authenticateUser();
  // ...
}
```

---

## 3. Server Actions & Mutations

### Server Actions Missing Authentication Verification

**Severity:** Critical  
**Impact:** Server Actions that mutate data without re-verifying authentication inside the action body are vulnerable to CSRF attacks. Trusting UI state is unsafe.  
**Location:** `app/(simple)/ops/actions/user-actions.ts:270` and other server actions

**Fix:**

```typescript
import { authenticateUserWithPermissions } from "@/lib/api-auth";

export async function createUser(formData: CreateUserFormData) {
  try {
    // Re-verify authentication inside the action
    const authResult = await authenticateUserWithPermissions();
    if (!authResult.success) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Check permissions
    if (!authResult.user || !canAccess(authResult.user.role, ["SUPERADMIN", "ADMIN"])) {
      return {
        success: false,
        error: "Insufficient permissions",
      };
    }

    // Validate form data
    const validatedData = createUserSchema.parse(formData);
    // ... rest of the function
  } catch (error) {
    // ...
  }
}
```

### Server Actions Missing Revalidation

**Severity:** Medium  
**Impact:** Some Server Actions mutate data but don't call `revalidatePath` or `revalidateTag`, causing stale data to be served from cache.  
**Location:** `app/apply/action.ts:424` (registerUser function)

**Fix:**

```typescript
import { revalidatePath } from "next/cache";

export async function registerUser(
  formData: RegisterFormData
): Promise<RegisterResult> {
  try {
    // ... existing validation and user creation logic ...

    // After successful user creation
    revalidatePath("/apply");
    revalidatePath("/get-started");
    revalidatePath("/dashboard");

    return {
      success: true,
      user: newUser,
      student: newStudent,
    };
  } catch (error) {
    // ...
  }
}
```

### API Route Handlers Used Instead of Server Actions

**Severity:** Medium  
**Impact:** Using API Route Handlers for form submissions instead of Server Actions increases bundle size, loses type safety, and requires manual error handling.  
**Location:** `helpers/DBForm.js:116-166`, `app/get-started/page.tsx:201-245`

**Fix:**

```typescript
// Convert to Server Action
// app/actions/db-form.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticateUser } from "@/lib/api-auth";

const dbFormSchema = z.object({
  // Define schema based on table
});

export async function saveDbForm(
  tableName: string,
  data: any,
  id?: number
) {
  const authResult = await authenticateUser();
  if (!authResult.success) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const validatedData = dbFormSchema.parse(data);
    
    let result;
    if (id) {
      result = await prisma[tableName].update({
        where: { id },
        data: validatedData,
      });
    } else {
      result = await prisma[tableName].create({
        data: validatedData,
      });
    }

    revalidatePath(`/admin/${tableName}`);
    
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// In component:
import { saveDbForm } from "@/app/actions/db-form";

const handleSubmit = async (formData: FormData) => {
  const result = await saveDbForm(tableName, Object.fromEntries(formData), rowData?.id);
  if (result.success) {
    toast.success("Saved successfully");
  }
};
```

---

## 4. Navigation & UX

### Hard Refreshes Using window.location

**Severity:** Medium  
**Impact:** Using `window.location.href` or `window.location.reload()` causes full page reloads, losing React state and increasing load time. Next.js router provides better UX with client-side navigation.  
**Location:** Multiple files (41 instances found)

**Examples:**
- `app/(dashboard)/students/page.tsx:216`
- `app/(dashboard)/results/components/cgpa-error.tsx:24`
- `components/ImmersiveQuiz.js:302, 1241, 1258`
- `app/(dashboard)/profile/programs/page.tsx:127, 144, 294`

**Fix:**

```typescript
// Replace window.location.reload() with:
import { useRouter } from "next/navigation";

const router = useRouter();

// Instead of: window.location.reload()
router.refresh(); // Re-fetches data without full reload

// Or use revalidatePath in Server Actions:
import { revalidatePath } from "next/cache";
revalidatePath("/current-path");

// Replace window.location.href with:
// Instead of: window.location.href = "/new-path"
router.push("/new-path"); // Client-side navigation
```

### URL State Trapped in useState

**Severity:** Medium  
**Impact:** Search filters, pagination, and filters stored in `useState` make URLs non-shareable and break browser back/forward navigation. Users can't bookmark filtered views.  
**Location:** 
- `app/(simple)/ops/components/UserManagement.tsx:100-107`
- `app/(simple)/ops/components/PaymentsManagement.tsx:151-158`
- `app/(dashboard)/courses/page.tsx:44-49`
- `app/(simple)/ops/components/ApplicationManagement.tsx:77-81`

**Fix:**

```typescript
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function UserManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read from URL instead of useState
  const searchTerm = searchParams.get("search") || "";
  const roleFilter = searchParams.get("role") || "all";
  const statusFilter = searchParams.get("status") || "all";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Update URL when filters change
  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    updateFilters({ search: value, page: "1" });
  };

  const handleRoleFilterChange = (value: string) => {
    updateFilters({ role: value, page: "1" });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page: page.toString() });
  };

  // Use URL params in data fetching
  const { data } = useUsersData(
    institutionId,
    searchTerm || undefined,
    roleFilter === "all" ? undefined : roleFilter,
    statusFilter === "all" ? undefined : statusFilter,
    currentPage
  );
}
```

---

## 5. Security & Auth

### Middleware Gaps - API Routes Not Protected

**Severity:** Critical  
**Impact:** Middleware config excludes `/api/` routes, meaning API routes must implement their own authentication. Some routes may be missing auth checks, allowing unauthorized access.  
**Location:** `middleware.ts:152`

**Fix:**

```typescript
// Update middleware to protect sensitive API routes
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect sensitive API routes
  const protectedApiRoutes = [
    "/api/admin",
    "/api/student",
    "/api/staff",
    "/api/dashboard",
  ];

  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedApiRoute) {
    const userRole = getUserRoleFromCookies(request);
    if (!userRole) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
  }

  // ... existing route protection logic ...
}

// Also ensure all API routes verify auth:
// app/api/studentresult/route.ts
export async function GET(request: NextRequest) {
  const authResult = await authenticateUser();
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.statusCode || 401 }
    );
  }
  // ... rest of handler
}
```

### Potential Secret Leaks via NEXT_PUBLIC_

**Severity:** High  
**Impact:** Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. If private keys or secrets are accidentally prefixed, they become publicly accessible.  
**Location:** 
- `app/(dashboard)/payments/payment-client-wrapper.tsx:445`
- `app/api/dashboard/applications/[id]/admit/send-letter/route.ts:138`

**Fix:**

```typescript
// Verify these are safe to expose:
// NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY - ✅ Safe (public key)
// NEXT_PUBLIC_FRONTEND_URL - ✅ Safe (public URL)

// In server-side code, use non-prefixed variables:
// app/api/dashboard/applications/[id]/admit/send-letter/route.ts
const frontendUrl = process.env.FRONTEND_URL || ""; // ✅ Not NEXT_PUBLIC_

// If you need a fallback, use server-only:
import "server-only";

const getFrontendUrl = () => {
  // Server-only function
  return process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "";
};
```

### Unsanitized dangerouslySetInnerHTML Usage

**Severity:** Critical  
**Impact:** Using `dangerouslySetInnerHTML` without sanitization exposes the app to XSS attacks if user-generated content contains malicious scripts.  
**Location:** 20 instances found, including:
- `app/(dashboard)/course-viewer/components/LessonContent.tsx:125`
- `app/(dashboard)/notifications/notification-card.tsx:237`
- `components/ImmersiveQuiz.js:1465`
- `app/(dashboard)/immersive-test/components/AssignmentSubmission.tsx:195, 200`

**Fix:**

```typescript
import DOMPurify from "isomorphic-dompurify";

// Sanitize HTML before rendering
const sanitizedContent = DOMPurify.sanitize(content, {
  ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "h1", "h2", "h3", "ul", "ol", "li", "a"],
  ALLOWED_ATTR: ["href", "target"],
});

return (
  <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
);

// Or use a safer alternative:
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

const parseAndSanitize = (markdown: string) => {
  const html = marked.parse(markdown);
  return DOMPurify.sanitize(html);
};
```

---

## 6. Performance & Core Web Vitals

### Missing Image Optimization

**Severity:** Low  
**Impact:** No instances of `<img />` tags found (good!), but ensure all images use `next/image` for automatic optimization, lazy loading, and responsive images.

**Fix:**

```typescript
// Always use next/image instead of <img>
import Image from "next/image";

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

### Font Optimization Not Using next/font

**Severity:** Low  
**Impact:** Inline font-family styles in email templates are acceptable, but web fonts should use `next/font` for automatic optimization, self-hosting, and reduced layout shift.  
**Location:** `app/(simple)/ops/components/PaymentsManagement.tsx:377`

**Fix:**

```typescript
// If using custom fonts, use next/font
import { Inter, Roboto } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({ weight: ["400", "700"], subsets: ["latin"] });

// Apply in component
<div className={inter.className}>
  {/* Content */}
</div>

// Or in global CSS with CSS variables
```

### Missing Suspense Boundaries for Async Components

**Severity:** Medium  
**Impact:** Async Server Components without Suspense boundaries cause the entire page to block during data fetching, degrading user experience.  
**Location:** Check all async Server Components

**Fix:**

```typescript
import { Suspense } from "react";

// Wrap async components in Suspense
export default function Page() {
  return (
    <div>
      <Suspense fallback={<LoadingSkeleton />}>
        <AsyncDataComponent />
      </Suspense>
      <StaticContent />
    </div>
  );
}

// Or create loading.tsx files for route-level loading states
// app/(dashboard)/results/loading.tsx
export default function Loading() {
  return <ResultsSkeleton />;
}
```

---

## Summary

### Critical Issues (3)
1. Server Actions missing authentication verification
2. Unsanitized `dangerouslySetInnerHTML` usage (XSS risk)
3. Middleware gaps for API route protection

### High Issues (4)
1. Waterfall fetching in client components
2. Third-party scripts loaded without `next/script`
3. Potential secret leaks via `NEXT_PUBLIC_`
4. API Route Handlers used instead of Server Actions

### Medium Issues (6)
1. Overuse of `'use client'` in pages
2. Missing `revalidatePath` in Server Actions
3. Hard refreshes using `window.location`
4. URL state trapped in `useState`
5. Missing `dynamic = 'force-dynamic'` exports
6. Missing Suspense boundaries

### Low Issues (2)
1. Font optimization opportunities
2. Image optimization verification needed

---

## Recommended Priority Order

1. **Immediate (Security):**
   - Add authentication verification to all Server Actions
   - Sanitize all `dangerouslySetInnerHTML` usage
   - Review and protect API routes in middleware

2. **High Priority (Performance):**
   - Parallelize waterfall fetches
   - Convert API Route Handlers to Server Actions
   - Use `next/script` for third-party scripts

3. **Medium Priority (UX & Architecture):**
   - Move filter/pagination state to URL params
   - Replace `window.location` with Next.js router
   - Add `revalidatePath` to all mutations
   - Split client/server components appropriately

4. **Low Priority (Optimization):**
   - Add Suspense boundaries
   - Verify image optimization
   - Consider `next/font` for custom fonts

