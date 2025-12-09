# Complete Role-Based Access Control System Overview

This document provides a comprehensive overview of the role-based access control (RBAC) system implemented across both frontend and backend of the iLearn application.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  Decorators    │  Guards    │  Hooks    │  Middleware      │
│  @RequireRole  │  <AdminOnly>│  useIsAdmin│  Route Protection│
│  @RejectRole   │  <NotStudent>│  useCanAccess│                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Fastify)                        │
├─────────────────────────────────────────────────────────────┤
│  checkAccess() │  Data Filtering │  JWT Validation │        │
│  Role Validation│  Institution Scope│  Cookie Management│    │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Key Features

### ✅ **Comprehensive Protection**

- **Frontend**: UI/UX protection with decorators, guards, and hooks
- **Backend**: API endpoint protection with role validation and data filtering
- **Middleware**: Route-level protection for Next.js pages

### ✅ **Flexible Patterns**

- **RequireRole**: Allow specific roles
- **RejectRole**: Explicitly reject specific roles (as requested)
- **Role Hierarchy**: Higher roles inherit lower role permissions
- **Data Scoping**: Automatic filtering based on user role and institution

### ✅ **Type Safety**

- Full TypeScript support
- Consistent role definitions across frontend and backend
- Compile-time error checking

## 🔐 Role Hierarchy

```
SUPERADMIN (7) > ADMIN (6) > HOD (5) > STAFF/LECTURER (4) > STUDENT (3) > APPLICANT (2) > AFFILIATE (1)
```

**Principle**: Higher roles can access lower role permissions automatically.

## 📱 Frontend Protection

### 1. Decorators

```typescript
// Page-level protection
@RejectRole(['STUDENT'])
export default function AssignmentPage() {
  return <div>Assignment management</div>;
}

// Method-level protection
class AdminService {
  @RequireRole(['ADMIN', 'SUPERADMIN'])
  async deleteUser(userId: string) {
    // Only admins can delete users
  }
}
```

### 2. Guard Components

```typescript
// Conditional rendering
<RejectRoleGuard rejectedRoles={['STUDENT']}>
  <AssignmentManager />
</RejectRoleGuard>

<AdminOnly fallback={<AccessDenied />}>
  <AdminPanel />
</AdminOnly>
```

### 3. Hooks

```typescript
function MyComponent() {
  const isAdmin = useIsAdmin();
  const canAccessAssignments = useCanAccess(
    ["ADMIN", "SUPERADMIN", "HOD", "STAFF"],
    ["STUDENT"]
  );

  if (isStudent) return <StudentView />;
  if (canAccessAssignments) return <AssignmentManager />;
}
```

### 4. Middleware

```typescript
// Automatic route protection
const PROTECTED_ROUTES = [
  {
    path: "/assignments",
    rejectedRoles: ["STUDENT"],
    redirectTo: "/signin?logout=1",
  },
];
```

## 🔧 Backend Protection

### 1. Core Function

```javascript
const { validatedUser, filterKey, filterValue } = checkAccess(
  req,
  reply,
  allowedRoles
);
```

### 2. Role-Based Data Filtering

```javascript
exports.getStaff = async (req, reply) => {
  const { validatedUser } = checkAccess(req, reply, [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
  ]);

  let query = Staff.forge();

  // Automatic data scoping
  if (validatedUser.role === "HOD") {
    query.where("department_id", validatedUser.staff.department_id);
  } else if (validatedUser.role === "ADMIN") {
    query.where("institution_id", validatedUser.institution_id);
  }

  return await query.fetchAll();
};
```

### 3. Resource Ownership Validation

```javascript
exports.getProfile = async (req, reply) => {
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  const userId = req.params.id || validatedUser.id;

  // Ensure users can only access their own data
  const isHigherAccess =
    ["ADMIN", "SUPERADMIN", "HOD"].indexOf(validatedUser.role) > -1;
  if (userId != validatedUser.id && !isHigherAccess) {
    throw boom.forbidden("Access denied");
  }
};
```

## 🔄 Integration Examples

### Example 1: Assignment Management (RejectRole Pattern)

**Frontend Protection:**

```typescript
// app/(dashboard)/assignments/page.tsx
export default RejectRolePage(["STUDENT"], {
  redirectTo: "/signin?logout=1",
  fallback: (
    <AccessDenied message="Students cannot access assignment management" />
  ),
})(AssignmentsPage);
```

**Backend Protection:**

```javascript
// backend/controllers/assignmentController.js
exports.getAssignmentSubmissions = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  // Students are implicitly rejected by not being in allowedRoles
  // Additional explicit check if needed:
  if (validatedUser.role === "STUDENT") {
    throw boom.forbidden("Students cannot access assignment submissions");
  }

  // Continue with assignment logic...
};
```

### Example 2: Admin Dashboard

**Frontend Protection:**

```typescript
// Admin dashboard component
<RequireRoleGuard allowedRoles={["SUPERADMIN", "ADMIN"]}>
  <AdminDashboard />
</RequireRoleGuard>
```

**Backend Protection:**

```javascript
// Admin API endpoints
exports.getSystemStats = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  // Only admins can access system statistics
  const stats = await getSystemStatistics(validatedUser.institution_id);
  return stats;
};
```

### Example 3: Student-Specific Features

**Frontend Protection:**

```typescript
// Student-only features
<RequireRoleGuard allowedRoles={["STUDENT"]}>
  <StudentDashboard />
</RequireRoleGuard>
```

**Backend Protection:**

```javascript
// Student API endpoints
exports.getMyCourses = async (req, reply) => {
  const allowedRoles = ["STUDENT"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  // Students can only see their own courses
  const courses = await StudentCourse.where({
    student_id: validatedUser.student.id,
  }).fetchAll({
    withRelated: ["course"],
  });

  return courses;
};
```

## 🛡️ Security Layers

### Layer 1: Frontend UI Protection

- **Purpose**: Prevent unauthorized UI access
- **Tools**: Decorators, guards, hooks, middleware
- **Benefits**: Better UX, immediate feedback

### Layer 2: Backend API Protection

- **Purpose**: Secure data access and operations
- **Tools**: `checkAccess()`, role validation, data filtering
- **Benefits**: Data security, business logic enforcement

### Layer 3: Data Scoping

- **Purpose**: Ensure users only see their authorized data
- **Tools**: Institution-based filtering, role-based queries
- **Benefits**: Multi-tenant security, data isolation

## 📊 Comparison: RequireRole vs RejectRole

| Aspect          | RequireRole                             | RejectRole                      |
| --------------- | --------------------------------------- | ------------------------------- |
| **Use Case**    | Allow specific roles                    | Exclude specific roles          |
| **Maintenance** | Update when adding new roles            | No updates needed for new roles |
| **Clarity**     | Explicit about who can access           | Clear about who cannot access   |
| **Example**     | `@RequireRole(['ADMIN', 'SUPERADMIN'])` | `@RejectRole(['STUDENT'])`      |
| **Best For**    | Restricted access                       | Open access with exceptions     |

## 🎯 Best Practices

### 1. **Use RejectRole for Clarity**

```typescript
// ✅ Better - Clear intent
@RejectRole(['STUDENT'])
export default function StaffFeature() {
  return <div>Staff only</div>;
}

// ❌ Less clear - Need to list all allowed roles
@RequireRole(['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'LECTURER'])
export default function StaffFeature() {
  return <div>Staff only</div>;
}
```

### 2. **Consistent Role Definitions**

```typescript
// ✅ Use role groups for consistency
import { ROLE_GROUPS } from '@/lib/roles';

@RequireRole(ROLE_GROUPS.ADMINISTRATORS)
export default function AdminPage() {
  return <div>Admin only</div>;
}
```

### 3. **Always Protect Backend**

```javascript
// ✅ Always use checkAccess
exports.getData = async (req, reply) => {
  const { validatedUser } = checkAccess(req, reply, allowedRoles);
  // Continue with logic...
};

// ❌ Never skip backend protection
exports.getData = async (req, reply) => {
  // No protection - security risk!
  return await Model.fetchAll();
};
```

### 4. **Apply Data Filtering**

```javascript
// ✅ Filter data by role
if (validatedUser.role === "ADMIN") {
  query.where("institution_id", validatedUser.institution_id);
}

// ❌ Return all data
return await Model.fetchAll(); // Could expose other institutions' data
```

## 🧪 Testing Strategy

### Frontend Testing

```typescript
// Test role guards
describe("Role Guards", () => {
  it("should show admin content for admin users", () => {
    render(
      <AdminOnly>
        <AdminPanel />
      </AdminOnly>
    );
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it("should hide content from students", () => {
    render(
      <NotStudent>
        <StaffTools />
      </NotStudent>
    );
    expect(screen.queryByText("Staff Tools")).not.toBeInTheDocument();
  });
});
```

### Backend Testing

```javascript
// Test API protection
describe("API Protection", () => {
  it("should reject unauthorized users", async () => {
    const response = await request(app)
      .get("/api/admin/users")
      .set("Cookie", "role=STUDENT");

    expect(response.status).toBe(401);
  });

  it("should allow authorized users", async () => {
    const response = await request(app)
      .get("/api/admin/users")
      .set("Cookie", "role=ADMIN");

    expect(response.status).toBe(200);
  });
});
```

## 📈 Performance Considerations

### Frontend

- **Decorators**: Evaluated at build time for pages
- **Hooks**: Evaluated at runtime, cached in context
- **Guards**: Conditional rendering, no unnecessary re-renders
- **Middleware**: Runs on every request but optimized

### Backend

- **JWT Validation**: Fast token verification
- **Role Checking**: Simple array lookup
- **Data Filtering**: Database-level optimization
- **Caching**: User context cached in request

## 🔄 Migration Guide

### From Old System to New System

1. **Replace manual role checks**:

```typescript
// Old
if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
  return <AdminPanel />;
}

// New
<RequireRoleGuard allowedRoles={["ADMIN", "SUPERADMIN"]}>
  <AdminPanel />
</RequireRoleGuard>;
```

2. **Replace backend role arrays**:

```javascript
// Old
const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "LECTURER"];

// New
const allowedRoles = ROLE_GROUPS.ALL_STAFF;
```

3. **Add RejectRole patterns**:

```typescript
// Old
@RequireRole(['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'LECTURER'])

// New
@RejectRole(['STUDENT', 'APPLICANT'])
```

This comprehensive RBAC system provides robust, maintainable, and secure access control across the entire application stack.
