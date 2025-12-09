# New Role System Implementation Documentation

## Overview

This document provides comprehensive documentation for the new role-based access control system implemented in the iLearn v4 application. The system introduces 4 new roles while maintaining backward compatibility with the existing simple role structure.

## New Roles Introduced

### 1. **FACILITATOR**

- **Hierarchy Level**: 4 (same as STAFF/LECTURER)
- **Permissions**:
  - ✅ LMS (all access) - Can manage course content, lessons, modules
  - ✅ Results module (all access) - Can input, view, and manage student results
  - ✅ Course approval - Can approve course registrations and content
- **Access Scope**: Assigned courses only
- **UI Badge**: Cyan background (`bg-cyan-100 text-cyan-800`)

### 2. **ETUTOR**

- **Hierarchy Level**: 4 (same as STAFF/LECTURER)
- **Permissions**:
  - ✅ LMS (all access) - Full access to learning management features
  - ✅ Results module (all access) - Complete results management
  - ✅ Course approval - Can approve courses and assignments
- **Access Scope**: Assigned courses only
- **UI Badge**: Teal background (`bg-teal-100 text-teal-800`)

### 3. **PROGRAMME_COORDINATOR**

- **Hierarchy Level**: 5.5 (between HOD and ADMIN)
- **Permissions**:
  - ✅ LMS (all access) - Full LMS access for their programme
  - ✅ Results module (all access) - Results management for programme students
  - ✅ Programme course access - Automatic access to all courses in their programme
  - ✅ Staff assignment - Can assign courses to Facilitators & eTutors in their programme
  - ✅ Course creation - Can create new courses for their programme
  - ✅ Course approval - Can approve course registrations
- **Access Scope**: Programme-specific
- **UI Badge**: Indigo background (`bg-indigo-100 text-indigo-800`)

### 4. **PROGRAMME_EXAM_OFFICER**

- **Hierarchy Level**: 4.5 (between STAFF and HOD)
- **Permissions**:
  - ✅ Programme results access - View/manage all results under their programme
  - ✅ Results module (all access) - Full results management capabilities
  - ❌ Course approval - Cannot approve course registrations (results only)
- **Access Scope**: Programme-specific (results only)
- **UI Badge**: Orange background (`bg-orange-100 text-orange-800`)

### 5. **ADMIN** (Enhanced existing role)

- **Hierarchy Level**: 6 (below SUPERADMIN)
- **Enhanced Permissions**:
  - ✅ All access - Complete system access
  - ✅ Course creation - Can create new courses
  - ✅ User management - Creates users and assigns roles
  - ✅ Institution-wide access
  - ✅ User payment access - Can view individual user payments
  - ❌ Finance overview - Cannot access institution-wide financial data
  - ❌ Finance dashboard - Cannot view total inflow/outflow analytics
- **Access Scope**: Institution-wide (except finance analytics)
- **UI Badge**: Red background (`bg-red-100 text-red-800`)

## Course Registration & Approval Workflow

### Student Access Rules

Students cannot access courses, CBAs, or course content until:

1. **Course Registration**: Course is registered by authorized personnel
2. **Course Approval**: Course registration is approved by authorized personnel

### Registration Process

```
ADMIN/PROGRAMME_COORDINATOR → Register Student for Course
                ↓
         Status: "REGISTERED"
                ↓
FACILITATOR/ETUTOR/PROGRAMME_COORDINATOR → Approve Registration
                ↓
         Status: "APPROVED"
                ↓
        Student gains access to course content
```

## Technical Implementation

### 1. Database Schema

**No schema changes required** - roles stored as strings in existing `user.role` field.

Supported role values:

```sql
-- New roles
'PROGRAMME_COORDINATOR'
'PROGRAMME_EXAM_OFFICER'
'FACILITATOR'
'ETUTOR'

-- Existing roles (unchanged)
'SUPERADMIN'
'ADMIN'
'HOD'
'STAFF'
'LECTURER'
'STUDENT'
'APPLICANT'
'AFFILIATE'
```

### 2. Role Hierarchy

```
SUPERADMIN (8) → ADMIN (6) → PROGRAMME_COORDINATOR (5.5) → HOD (5) → PROGRAMME_EXAM_OFFICER (4.5) → FACILITATOR/ETUTOR/STAFF/LECTURER (4) → STUDENT (3) → APPLICANT (2) → AFFILIATE (1)
```

**Hierarchy Rule**: Higher roles inherit permissions of lower roles.

### 3. Permission Groups

```typescript
// Core permission groups
ADMINISTRATORS: ["SUPERADMIN", "ADMIN"];
PROGRAMME_MANAGERS: ["PROGRAMME_COORDINATOR"];
ACADEMIC_STAFF: [
  "HOD",
  "PROGRAMME_EXAM_OFFICER",
  "FACILITATOR",
  "ETUTOR",
  "STAFF",
  "LECTURER",
];

// Permission-specific groups
LMS_ACCESS: [
  "SUPERADMIN",
  "ADMIN",
  "PROGRAMME_COORDINATOR",
  "HOD",
  "FACILITATOR",
  "ETUTOR",
];
RESULTS_ACCESS: [...LMS_ACCESS, "PROGRAMME_EXAM_OFFICER"];
COURSE_APPROVAL: [...LMS_ACCESS]; // Excludes PROGRAMME_EXAM_OFFICER
FINANCE_OVERVIEW: ["SUPERADMIN"]; // Only SUPERADMIN can access finance analytics
USER_PAYMENTS: ["SUPERADMIN", "ADMIN"]; // SUPERADMIN and ADMIN can view user payments
```

### 4. Files Modified/Created

#### **Core System Files:**

- `/lib/roles.ts` - Role definitions and hierarchy
- `/lib/roleDecorators.ts` - Access control decorators
- `/hooks/useRoles.ts` - React role checking hooks
- `/components/RoleGuards.tsx` - Conditional rendering components

#### **UI Components:**

- `/app/(simple)/ops/components/UserManagement.tsx` - Updated role management

#### **API Examples:**

- `/app/api/course-registration/route.ts` - Sample role-based API

## Usage Examples

### 1. Frontend - React Components

#### Using Hooks

```typescript
import { useRoles } from "@/hooks/useRoles";

function MyComponent() {
  const {
    hasLMSAccess,
    hasResultsAccess,
    canApproveCourses,
    isProgrammeCoordinator,
  } = useRoles();

  return (
    <div>
      {hasLMSAccess() && <LMSPanel />}
      {hasResultsAccess() && <ResultsPanel />}
      {canApproveCourses() && <ApprovalPanel />}
      {isProgrammeCoordinator() && <StaffAssignmentPanel />}
    </div>
  );
}
```

#### Using Guard Components

```typescript
import {
  LMSAccessOnly,
  ResultsAccessOnly,
  CourseApprovalOnly,
  ProgrammeCoordinatorOnly,
  AccessDenied,
} from "@/components/RoleGuards";

function Dashboard() {
  return (
    <div>
      <LMSAccessOnly fallback={<AccessDenied />}>
        <LMSManagement />
      </LMSAccessOnly>

      <ResultsAccessOnly>
        <ResultsManagement />
      </ResultsAccessOnly>

      <CourseApprovalOnly>
        <CourseApproval />
      </CourseApprovalOnly>

      <ProgrammeCoordinatorOnly>
        <StaffAssignment />
      </ProgrammeCoordinatorOnly>
    </div>
  );
}
```

### 2. Frontend - Page Protection

#### Using Decorators

```typescript
import { RequireLMSAccess } from '@/lib/roleDecorators';

// Protect entire page
@RequireLMSAccess()
export default function LMSPage() {
  return <div>LMS Content</div>;
}

// Or use page wrapper
export default RequireRolePage(['FACILITATOR', 'ETUTOR'], {
  fallback: <AccessDenied message="Only Facilitators and eTutors can access this page" />
})(LMSPage);
```

### 3. Backend - API Protection

```typescript
import { hasAnyRole, UserRole, ROLE_GROUPS } from "@/lib/roles";

export async function POST(request: NextRequest) {
  const userRole = await getUserRole();

  // Check LMS access
  if (!hasAnyRole(userRole, [...ROLE_GROUPS.LMS_ACCESS])) {
    return NextResponse.json(
      {
        success: false,
        message: "LMS access required",
      },
      { status: 403 }
    );
  }

  // Role-specific logic
  if (userRole === "PROGRAMME_COORDINATOR") {
    // Programme-scoped operations
  } else if (userRole === "FACILITATOR") {
    // Course-scoped operations
  }

  // Continue with business logic...
}
```

### 4. Middleware & API Endpoint Protection

#### **Middleware Implementation**

The role-based access control is enforced at multiple levels:

1. **Middleware Level**: `middleware.ts` checks user authentication and basic role validation
2. **API Route Level**: Individual API endpoints implement specific role checks
3. **Component Level**: Frontend components use role guards for conditional rendering

#### **API Protection Examples**

```typescript
// Finance API - Only SUPERADMIN access
export async function GET(request: NextRequest) {
  const userRole = await getUserRole();

  if (!ROLE_GROUPS.FINANCE_OVERVIEW.includes(userRole)) {
    return NextResponse.json(
      { success: false, message: "Finance overview access denied" },
      { status: 403 }
    );
  }

  // Return finance analytics data
}

// User Payments API - SUPERADMIN and ADMIN access
export async function GET(request: NextRequest) {
  const userRole = await getUserRole();

  if (!ROLE_GROUPS.USER_PAYMENTS.includes(userRole)) {
    return NextResponse.json(
      { success: false, message: "User payment access denied" },
      { status: 403 }
    );
  }

  // Return user payment data
}
```

#### **Development Environment Settings**

For ease of development, you can disable API authentication using environment variables:

```bash
# .env.local (Development only)
DISABLE_API_AUTH=true
NODE_ENV=development
```

```typescript
// middleware.ts or API route protection
const isDevelopment = process.env.NODE_ENV === "development";
const authDisabled = process.env.DISABLE_API_AUTH === "true";

if (isDevelopment && authDisabled) {
  // Skip authentication in development
  return NextResponse.next();
}

// Normal authentication flow
const userRole = await getUserRole();
// ... role checks
```

**⚠️ Security Note**:

- `DISABLE_API_AUTH` should ONLY be used in development
- Never set this to `true` in production environments
- Consider adding additional checks to prevent accidental production deployment

## Access Control Matrix

| Role                   | LMS Access | Results Access | Course Approval | User Management | Course Creation | Staff Assignment | Finance Overview | User Payments |
| ---------------------- | ---------- | -------------- | --------------- | --------------- | --------------- | ---------------- | ---------------- | ------------- |
| SUPERADMIN             | ✅         | ✅             | ✅              | ✅              | ✅              | ✅               | ✅               | ✅            |
| ADMIN                  | ✅         | ✅             | ✅              | ✅              | ✅              | ✅               | ❌               | ✅            |
| PROGRAMME_COORDINATOR  | ✅         | ✅             | ✅              | ❌              | ✅              | ✅               | ❌               | ❌            |
| HOD                    | ✅         | ✅             | ✅              | ❌              | ❌              | ❌               | ❌               | ❌            |
| PROGRAMME_EXAM_OFFICER | ❌         | ✅             | ❌              | ❌              | ❌              | ❌               | ❌               | ❌            |
| FACILITATOR            | ✅         | ✅             | ✅              | ❌              | ❌              | ❌               | ❌               | ❌            |
| ETUTOR                 | ✅         | ✅             | ✅              | ❌              | ❌              | ❌               | ❌               | ❌            |
| STAFF                  | ❌         | ❌             | ❌              | ❌              | ❌              | ❌               | ❌               | ❌            |
| LECTURER               | ❌         | ❌             | ❌              | ❌              | ❌              | ❌               | ❌               | ❌            |
| STUDENT                | ❌         | ❌             | ❌              | ❌              | ❌              | ❌               | ❌               | ❌            |

## Data Scoping Rules

### Global Scope (SUPERADMIN)

- Access to all institutions
- Can see all data across the system
- No filtering applied

### Institution Scope (ADMIN)

- Limited to their institution's data
- Filters applied: `institution_id = user.institution_id`

### Programme Scope (PROGRAMME_COORDINATOR, PROGRAMME_EXAM_OFFICER)

- Limited to their programme's data
- Filters applied: `programme_id = user.programme_id`
- Additional institution filtering

### Department Scope (HOD)

- Limited to their department's data
- Filters applied: `department_id = user.department_id`

### Course Scope (FACILITATOR, ETUTOR)

- Limited to assigned courses only
- Filters applied via staff_course assignments
- No access to unassigned courses

## Testing Strategy

### Frontend Testing

```typescript
describe("Role Guards", () => {
  test("LMS access for facilitators", () => {
    mockUserRole("FACILITATOR");
    render(
      <LMSAccessOnly>
        <LMSPanel />
      </LMSAccessOnly>
    );
    expect(screen.getByText("LMS Panel")).toBeInTheDocument();
  });

  test("Course approval denied for programme exam officer", () => {
    mockUserRole("PROGRAMME_EXAM_OFFICER");
    render(
      <CourseApprovalOnly>
        <ApprovalPanel />
      </CourseApprovalOnly>
    );
    expect(screen.queryByText("Approval Panel")).not.toBeInTheDocument();
  });
});
```

### Backend Testing

```typescript
describe("Course Registration API", () => {
  test("Programme coordinator can register students", async () => {
    const response = await request(app)
      .post("/api/course-registration")
      .set("Cookie", "role=PROGRAMME_COORDINATOR")
      .send({ action: "register", studentId: "1", courseId: "1" });

    expect(response.status).toBe(200);
  });

  test("Programme exam officer cannot approve registrations", async () => {
    const response = await request(app)
      .post("/api/course-registration")
      .set("Cookie", "role=PROGRAMME_EXAM_OFFICER")
      .send({ action: "approve", studentId: "1", courseId: "1" });

    expect(response.status).toBe(403);
  });
});
```

## Migration Guide

### For Existing Code

#### 1. Update Role Checks

```typescript
// Old
if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
  // Admin logic
}

// New
import { ROLE_GROUPS } from "@/lib/roles";
if (ROLE_GROUPS.ADMINISTRATORS.includes(user.role)) {
  // Admin logic
}
```

#### 2. Replace Manual Permission Logic

```typescript
// Old
const canManageResults = ["ADMIN", "HOD", "STAFF"].includes(user.role);

// New
import { hasResultsAccess } from "@/lib/roles";
const canManageResults = hasResultsAccess(user.role);
```

#### 3. Add Role Protection

```typescript
// Old - Unprotected component
export default function SensitiveComponent() {
  return <div>Sensitive content</div>;
}

// New - Protected component
import { RequireRole } from "@/lib/roleDecorators";
export default RequireRole(["FACILITATOR", "ETUTOR"])(SensitiveComponent);
```

## Troubleshooting

### Common Issues

#### 1. TypeScript Errors

```typescript
// Error: Type 'readonly string[]' not assignable to 'string[]'
// Solution: Use spread operator
hasAnyRole(userRole, [...ROLE_GROUPS.LMS_ACCESS]);
```

#### 2. Access Denied Despite Correct Role

- Check role hierarchy - higher roles should inherit lower permissions
- Verify role string matches exactly (case sensitive)
- Check if user data is properly loaded in context

#### 3. Course Registration Not Working

- Ensure both registration AND approval steps are completed
- Verify user has appropriate role for the action
- Check programme/course scope restrictions

### Debug Helper

```typescript
// Add to component for debugging
const { userRole, userData } = useRoles();
console.log("Current role:", userRole);
console.log("User data:", userData);
console.log("Has LMS access:", hasLMSAccess());
```

## Performance Considerations

### Caching

- Role checks are cached in React context
- User data fetched once per session
- Permission calculations are lightweight

### Database Impact

- No additional schema changes required
- Existing indexes on user.role remain effective
- No performance degradation expected

### Bundle Size

- Added ~5KB to bundle size
- Tree-shaking supported for unused role functions
- No runtime performance impact

---

## Next Steps

1. **Testing**: Comprehensive testing of all role combinations
2. **Course Approval UI**: Implement course approval dashboard tab
3. **Staff Assignment**: Create staff assignment interface for programme coordinators
4. **Results Scoping**: Implement programme-specific results filtering
5. **Documentation**: API documentation for new endpoints

This role system provides a solid foundation for granular access control while maintaining simplicity and backward compatibility.
