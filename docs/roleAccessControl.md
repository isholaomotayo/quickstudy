# Role-Based Access Control System

This document describes the comprehensive role-based access control system implemented for the iLearn application.

## Overview

The system provides multiple ways to implement role-based access control:

1. **Decorators** - For protecting pages, components, and methods
2. **Guard Components** - For conditional rendering in React components
3. **Hooks** - For client-side role checking
4. **Middleware** - For server-side route protection

## Role Hierarchy

```
SUPERADMIN (7) > ADMIN (6) > HOD (5) > STAFF/LECTURER (4) > STUDENT (3) > APPLICANT (2) > AFFILIATE (1)
```

Higher roles can access lower role permissions due to the hierarchical system.

## Available Roles

- `SUPERADMIN` - Application level admin
- `ADMIN` - Institution level admin
- `HOD` - Head of Department
- `STAFF` - Academic staff
- `LECTURER` - Teaching staff
- `STUDENT` - Enrolled students
- `APPLICANT` - Prospective students
- `AFFILIATE` - Affiliate users

## 1. Decorators

### RequireRole Decorator

Allows specific roles to access functionality:

```typescript
import { RequireRole } from '@/lib/roleDecorators';

// Protect a page component
@RequireRole(['ADMIN', 'SUPERADMIN'])
export default function AdminPage() {
  return <div>Admin only content</div>;
}

// Protect a method
class AdminService {
  @RequireRole(['ADMIN', 'SUPERADMIN'])
  async deleteUser(userId: string) {
    // Only admins can delete users
  }
}
```

### RejectRole Decorator

Explicitly rejects specific roles:

```typescript
import { RejectRole } from '@/lib/roleDecorators';

// Reject students from accessing assignment management
@RejectRole(['STUDENT'])
export default function AssignmentPage() {
  return <div>Assignment management (no students allowed)</div>;
}

// Reject multiple roles
@RejectRole(['STUDENT', 'APPLICANT'])
export default function StaffOnlyPage() {
  return <div>Staff only content</div>;
}
```

### RequireAnyRole Decorator

Allows any of the specified roles:

```typescript
import { RequireAnyRole } from '@/lib/roleDecorators';

@RequireAnyRole(['ADMIN', 'HOD', 'STAFF'])
export default function AcademicPage() {
  return <div>Academic staff content</div>;
}
```

### RequireAllRoles Decorator

Requires all specified roles (for complex permissions):

```typescript
import { RequireAllRoles } from '@/lib/roleDecorators';

@RequireAllRoles(['ADMIN', 'STAFF'])
export default function AdminStaffPage() {
  return <div>Must be both admin and staff</div>;
}
```

### Convenience Decorators

```typescript
import {
  RequireAdmin,
  RequireStaff,
  RequireStudent,
  RejectStudent,
  RequireAuthenticated
} from '@/lib/roleDecorators';

@RequireAdmin()
export default function AdminOnlyPage() {
  return <div>Admin only</div>;
}

@RejectStudent()
export default function NonStudentPage() {
  return <div>Everyone except students</div>;
}
```

### Page-Level Decorators

For Next.js pages, use the page-level decorators:

```typescript
import { RejectRolePage } from "@/lib/roleDecorators";

function AssignmentsPage() {
  return <div>Assignment management</div>;
}

// Apply role protection
export default RejectRolePage(["STUDENT"], {
  redirectTo: "/signin?logout=1",
  fallback: <div>Access Denied</div>,
})(AssignmentsPage);
```

## 2. Guard Components

For conditional rendering in React components:

```typescript
import {
  RequireRoleGuard,
  RejectRoleGuard,
  AdminOnly,
  NotStudent,
} from "@/lib/roleGuards";

function MyComponent() {
  return (
    <div>
      {/* Only show to admins */}
      <RequireRoleGuard allowedRoles={["ADMIN", "SUPERADMIN"]}>
        <AdminPanel />
      </RequireRoleGuard>

      {/* Hide from students */}
      <RejectRoleGuard rejectedRoles={["STUDENT"]}>
        <StaffTools />
      </RejectRoleGuard>

      {/* Convenience components */}
      <AdminOnly>
        <AdminFeatures />
      </AdminOnly>

      <NotStudent>
        <AcademicTools />
      </NotStudent>
    </div>
  );
}
```

## 3. Hooks

For client-side role checking:

```typescript
import {
  useUserRole,
  useIsAdmin,
  useIsStaff,
  useIsStudent,
  useCanAccess,
} from "@/lib/roleGuards";

function MyComponent() {
  const userRole = useUserRole();
  const isAdmin = useIsAdmin();
  const isStaff = useIsStaff();
  const isStudent = useIsStudent();

  // Custom access check
  const canAccessAssignments = useCanAccess(
    ["ADMIN", "SUPERADMIN", "HOD", "STAFF"],
    ["STUDENT"]
  );

  if (isStudent) {
    return <div>Student view</div>;
  }

  if (canAccessAssignments) {
    return <AssignmentManager />;
  }

  return <div>Access denied</div>;
}
```

## 4. Middleware Protection

The middleware automatically protects routes based on configuration in `middleware.ts`:

```typescript
// Example middleware configuration
const PROTECTED_ROUTES = [
  {
    path: "/assignments",
    rejectedRoles: ["STUDENT"],
    redirectTo: "/signin?logout=1",
  },
  {
    path: "/admin",
    allowedRoles: ["SUPERADMIN", "ADMIN"],
    redirectTo: "/signin?logout=1",
  },
];
```

## 5. Advanced Usage Examples

### Combining Multiple Decorators

```typescript
// Require admin but reject specific admin
@RequireRole(['ADMIN', 'SUPERADMIN'])
@RejectRole(['SUPERADMIN']) // Only regular admins
export default function RegularAdminPage() {
  return <div>Regular admin only</div>;
}
```

### Custom Fallback Components

```typescript
@RejectRole(['STUDENT'], {
  fallback: <AccessDeniedMessage message="Students cannot access this feature" />
})
export default function StaffFeature() {
  return <div>Staff feature</div>;
}
```

### Role Groups

```typescript
import { ROLE_GROUPS } from '@/lib/roles';

@RequireRole(ROLE_GROUPS.ADMINISTRATORS)
export default function AdminPage() {
  return <div>Admin only</div>;
}

@RejectRole(ROLE_GROUPS.STUDENTS)
export default function NonStudentPage() {
  return <div>Non-student content</div>;
}
```

### Conditional Rendering with Hooks

```typescript
function Dashboard() {
  const isAdmin = useIsAdmin();
  const isStaff = useIsStaff();
  const isStudent = useIsStudent();

  return (
    <div>
      {isAdmin && <AdminDashboard />}
      {isStaff && !isAdmin && <StaffDashboard />}
      {isStudent && <StudentDashboard />}
    </div>
  );
}
```

## 6. Best Practices

1. **Use RejectRole for clarity**: When you want to exclude specific roles, use `@RejectRole` instead of listing all allowed roles
2. **Leverage role hierarchy**: Higher roles automatically have access to lower role permissions
3. **Combine with middleware**: Use both decorators and middleware for comprehensive protection
4. **Provide meaningful fallbacks**: Always provide helpful error messages or redirects
5. **Use role groups**: For common role combinations, use the predefined role groups

## 7. Error Handling

The system provides graceful error handling:

- **Unauthorized access**: Redirects to signin page or shows fallback component
- **Missing role data**: Treats as unauthenticated user
- **Invalid roles**: Logs error and denies access

## 8. Performance Considerations

- Decorators are evaluated at build time for pages
- Hooks and guards are evaluated at runtime
- Middleware runs on every request but is optimized
- Role checking is cached in the user context

This system provides a comprehensive, flexible, and maintainable approach to role-based access control throughout the application.
