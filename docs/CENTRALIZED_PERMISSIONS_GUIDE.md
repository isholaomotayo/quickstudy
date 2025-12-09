# Centralized Permissions System

This guide explains the new centralized role and permissions management system that makes it easy to manage access control across your entire application.

## Overview

The old system had permissions scattered throughout the codebase, making it difficult to maintain. The new system centralizes all permissions in configuration files, making it easy to:

- Add new permissions
- Modify existing permissions  
- See all permissions in one place
- Ensure consistency across components and APIs

## File Structure

```
lib/
  permissions-config.ts    # Central permissions configuration
  api-auth.ts             # Updated API authentication helpers
  roles.ts               # Original roles (still used for compatibility)
  
hooks/
  usePermissions.ts       # React hooks for permission checking

components/auth/
  PermissionGate.tsx      # Permission-based rendering components  
  OpsGuard.tsx           # Page-level protection for ops dashboard
```

## Core Concepts

### 1. Permissions vs Roles

- **Roles**: Who the user is (e.g., ADMIN, STUDENT)
- **Permissions**: What actions they can perform (e.g., "users.view", "finance.overview")

### 2. Permission Naming Convention

Permissions use a dot-notation system:
```
{category}.{action}
```

Examples:
- `users.view` - View users
- `users.create` - Create new users
- `finance.overview` - Access financial overview
- `courses.edit` - Edit courses

## Usage Examples

### 1. In React Components

#### Using Hooks
```tsx
import { usePermissions } from "@/hooks/usePermissions";

function MyComponent() {
  const { can } = usePermissions();

  return (
    <div>
      {can.viewUsers() && <UserList />}
      {can.createUsers() && <CreateUserButton />}
    </div>
  );
}
```

#### Using Permission Gates
```tsx
import { PermissionGate, UserManagementGate } from "@/components/auth/PermissionGate";

function Dashboard() {
  return (
    <div>
      <PermissionGate permission="users.view">
        <UserManagement />
      </PermissionGate>
      
      <UserManagementGate>
        <UserStats />
      </UserManagementGate>
    </div>
  );
}
```

#### Page-Level Protection
```tsx
import { OpsGuard } from "@/components/auth/OpsGuard";

export default function OpsPage() {
  return (
    <OpsGuard>
      <OpsContent />
    </OpsGuard>
  );
}
```

### 2. In API Routes

#### New Centralized System
```tsx
import { protectApiRouteWithPermissions } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    // This automatically checks permissions and throws errors if unauthorized
    const { user } = await protectApiRouteWithPermissions(request, [
      "finance.payments.view"
    ]);
    
    // Your API logic here
    const data = await fetchPayments(user.institution_id);
    return createSuccessResponse(data, user);
  } catch (error) {
    // Error handling
  }
}
```

#### Auto-Detection (Recommended)
```tsx
import { protectApiRouteAuto } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    // This automatically detects required permissions based on the route
    const { user } = await protectApiRouteAuto(request);
    
    // Your API logic here
    const data = await fetchData(user.institution_id);
    return createSuccessResponse(data, user);
  } catch (error) {
    // Error handling
  }
}
```

## Configuration

### Adding New Permissions

1. **Add to permissions-config.ts**:
```tsx
export const PERMISSIONS_CONFIG: Record<Permission, {
  roles: UserRole[];
  description: string;
  category: string;
}> = {
  // ... existing permissions
  
  "notifications.send": {
    roles: ["SUPERADMIN", "ADMIN"],
    description: "Send notifications to users",
    category: "Communication"
  }
};
```

2. **Add to route mappings** (if needed):
```tsx
export const API_PERMISSIONS: Record<string, Permission[]> = {
  // ... existing mappings
  "POST /api/notifications/send": ["notifications.send"],
};
```

3. **Add convenience method** to usePermissions hook:
```tsx
// In hooks/usePermissions.ts
can: {
  // ... existing methods
  sendNotifications: () => hasPermission(userRole, "notifications.send"),
}
```

### Modifying Existing Permissions

Simply update the roles array in `PERMISSIONS_CONFIG`:

```tsx
"finance.overview": {
  roles: ["SUPERADMIN", "ADMIN", "FINANCE_MANAGER"], // Added FINANCE_MANAGER
  description: "Access to financial overview and analytics",
  category: "Finance"
},
```

## Permission Categories

All permissions are organized into categories:

- **Dashboard**: Basic dashboard access
- **User Management**: User CRUD operations
- **Finance**: Financial data and payment management
- **Academic**: Courses, grades, results
- **LMS**: Learning management system
- **System**: System settings and maintenance
- **Reporting**: Reports and analytics
- **Applications**: Student applications
- **Analytics**: Data analytics and insights

## Migration from Old System

### Components
**Before:**
```tsx
import { useRoles } from "@/hooks/useRoles";

function MyComponent() {
  const { hasFinanceOverviewAccess } = useRoles();
  
  return (
    <div>
      {hasFinanceOverviewAccess() && <FinanceOverview />}
    </div>
  );
}
```

**After:**
```tsx
import { usePermissions } from "@/hooks/usePermissions";
import { FinanceOverviewGate } from "@/components/auth/PermissionGate";

function MyComponent() {
  return (
    <div>
      <FinanceOverviewGate>
        <FinanceOverview />
      </FinanceOverviewGate>
    </div>
  );
}

// Or with hooks:
function MyComponent() {
  const { can } = usePermissions();
  
  return (
    <div>
      {can.viewFinanceOverview() && <FinanceOverview />}
    </div>
  );
}
```

### API Routes
**Before:**
```tsx
const authResult = await authenticateUser(request, undefined, ["user_payments"]);
if (!authResult.success) {
  return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
}
const user = authResult.user!;
```

**After:**
```tsx
const { user } = await protectApiRouteWithPermissions(request, ["finance.payments.view"]);
```

## Best Practices

1. **Use Permission Gates for UI**: They provide cleaner JSX and better reusability
2. **Use the `can` methods for logic**: They're more readable than checking permissions directly
3. **Protect pages with Guards**: Use `OpsGuard` and similar components for entire page protection
4. **Use Auto-Detection for APIs**: `protectApiRouteAuto()` reduces boilerplate and ensures consistency
5. **Group related permissions**: Use consistent naming like `users.view`, `users.create`, `users.edit`

## Ops Dashboard Protection

The ops dashboard is now fully protected:

- **Page Level**: `OpsGuard` prevents unauthorized users from accessing ops pages
- **Component Level**: Permission gates control individual features
- **API Level**: All ops APIs require appropriate permissions

### Access Requirements

To access the ops dashboard, users need the `dashboard.view` permission, which is granted to:
- SUPERADMIN
- ADMIN  
- PROGRAMME_COORDINATOR
- HOD
- PROGRAMME_EXAM_OFFICER
- FACILITATOR
- ETUTOR
- STAFF
- LECTURER

Individual sections have additional requirements:
- **Financial sections**: Require SUPERADMIN or ADMIN roles
- **User management**: Require ADMIN+ permissions
- **Course management**: Require PROGRAMME_COORDINATOR+ permissions

## Troubleshooting

### Common Issues

1. **"Unknown permission" warnings**: Check that the permission exists in `PERMISSIONS_CONFIG`
2. **Users can't access expected features**: Verify their role is included in the permission's roles array
3. **API returns 403 errors**: Ensure the API route has proper permission mappings

### Debugging Permissions

Use the browser console to check user permissions:

```javascript
// In browser console
const userData = JSON.parse(localStorage.getItem('userData') || '{}');
console.log('User role:', userData.role);

// Check specific permission
import { hasPermission } from '@/lib/permissions-config';
console.log('Can view users:', hasPermission(userData.role, 'users.view'));
```

## Legacy Compatibility

The old `useRoles()` hook is still available and has been updated to use the new permission system internally. This ensures existing code continues to work while you migrate to the new system.

However, **new code should use the new system** for better maintainability.

## Summary

The centralized permissions system provides:

✅ **Single source of truth** for all permissions
✅ **Easy maintenance** - change permissions in one place
✅ **Type safety** with TypeScript
✅ **Better UX** with proper error handling and loading states  
✅ **Consistent behavior** across components and APIs
✅ **Granular control** over feature access
✅ **Developer friendly** with clear naming and documentation

This system scales well as your application grows and makes permission management much more maintainable.