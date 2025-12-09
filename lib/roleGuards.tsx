import React from "react";
import { useApp } from "@/contexts/AppContext";
import {
  UserRole,
  canAccess,
  hasAnyRole,
  hasAllRoles,
  isRejectedRole,
  ROLE_GROUPS,
} from "./roles";

// Hook for getting current user role
export function useUserRole(): UserRole | null {
  const { userData } = useApp();
  return (userData?.role as UserRole) || null;
}

// Hook for checking if user has a specific role
export function useHasRole(requiredRole: UserRole): boolean {
  const userRole = useUserRole();
  return userRole === requiredRole;
}

// Hook for checking if user has any of the specified roles
export function useHasAnyRole(requiredRoles: UserRole[]): boolean {
  const userRole = useUserRole();
  return hasAnyRole(userRole, requiredRoles);
}

// Hook for checking if user has all specified roles
export function useHasAllRoles(requiredRoles: UserRole[]): boolean {
  const userRole = useUserRole();
  return hasAllRoles(userRole, requiredRoles);
}

// Hook for checking if user is rejected
export function useIsRejectedRole(rejectedRoles: UserRole[]): boolean {
  const userRole = useUserRole();
  return isRejectedRole(userRole, rejectedRoles);
}

// Hook for checking access with both allowed and rejected roles
export function useCanAccess(
  allowedRoles: UserRole[],
  rejectedRoles: UserRole[] = []
): boolean {
  const userRole = useUserRole();
  return canAccess(userRole, allowedRoles, rejectedRoles);
}

// Convenience hooks for common role checks
export function useIsAdmin(): boolean {
  return useHasAnyRole([...ROLE_GROUPS.ADMINISTRATORS]);
}

export function useIsStaff(): boolean {
  return useHasAnyRole([...ROLE_GROUPS.ALL_STAFF]);
}

export function useIsStudent(): boolean {
  return useHasRole("STUDENT");
}

export function useIsApplicant(): boolean {
  return useHasRole("APPLICANT");
}

export function useIsAffiliate(): boolean {
  return useHasRole("AFFILIATE");
}

// Role-based conditional rendering components
interface RoleGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// RequireRole component
export function RequireRoleGuard({
  children,
  fallback = null,
  allowedRoles,
  rejectedRoles = [],
}: RoleGuardProps & {
  allowedRoles: UserRole[];
  rejectedRoles?: UserRole[];
}) {
  const canAccessComponent = useCanAccess(allowedRoles, rejectedRoles);

  if (!canAccessComponent) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// RejectRole component
export function RejectRoleGuard({
  children,
  fallback = null,
  rejectedRoles,
}: RoleGuardProps & {
  rejectedRoles: UserRole[];
}) {
  const isRejected = useIsRejectedRole(rejectedRoles);

  if (isRejected) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// RequireAnyRole component
export function RequireAnyRoleGuard({
  children,
  fallback = null,
  allowedRoles,
}: RoleGuardProps & {
  allowedRoles: UserRole[];
}) {
  const hasAny = useHasAnyRole(allowedRoles);

  if (!hasAny) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// RequireAllRoles component
export function RequireAllRolesGuard({
  children,
  fallback = null,
  requiredRoles,
}: RoleGuardProps & {
  requiredRoles: UserRole[];
}) {
  const hasAll = useHasAllRoles(requiredRoles);

  if (!hasAll) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Convenience guard components
export function AdminOnly({ children, fallback }: RoleGuardProps) {
  return (
    <RequireRoleGuard
      allowedRoles={[...ROLE_GROUPS.ADMINISTRATORS]}
      fallback={fallback}
    >
      {children}
    </RequireRoleGuard>
  );
}

export function StaffOnly({ children, fallback }: RoleGuardProps) {
  return (
    <RequireRoleGuard
      allowedRoles={[...ROLE_GROUPS.ALL_STAFF]}
      fallback={fallback}
    >
      {children}
    </RequireRoleGuard>
  );
}

export function StudentOnly({ children, fallback }: RoleGuardProps) {
  return (
    <RequireRoleGuard
      allowedRoles={[...ROLE_GROUPS.STUDENTS]}
      fallback={fallback}
    >
      {children}
    </RequireRoleGuard>
  );
}

export function NotStudent({ children, fallback }: RoleGuardProps) {
  return (
    <RejectRoleGuard
      rejectedRoles={[...ROLE_GROUPS.STUDENTS]}
      fallback={fallback}
    >
      {children}
    </RejectRoleGuard>
  );
}

export function AuthenticatedOnly({ children, fallback }: RoleGuardProps) {
  return (
    <RequireRoleGuard
      allowedRoles={[...ROLE_GROUPS.ALL_USERS]}
      fallback={fallback}
    >
      {children}
    </RequireRoleGuard>
  );
}

// Utility function for conditional rendering based on role
export function renderIfRole(
  userRole: UserRole | null,
  allowedRoles: UserRole[],
  component: React.ReactNode,
  fallback: React.ReactNode = null
): React.ReactNode {
  return hasAnyRole(userRole, allowedRoles) ? component : fallback;
}

// Utility function for conditional rendering with rejected roles
export function renderIfNotRejected(
  userRole: UserRole | null,
  rejectedRoles: UserRole[],
  component: React.ReactNode,
  fallback: React.ReactNode = null
): React.ReactNode {
  return isRejectedRole(userRole, rejectedRoles) ? fallback : component;
}
