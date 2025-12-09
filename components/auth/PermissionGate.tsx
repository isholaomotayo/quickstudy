/**
 * Permission-based rendering components
 * 
 * These components allow you to conditionally render content based on user permissions
 */

"use client";

import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/lib/permissions-config";

interface PermissionGateProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface MultiPermissionGateProps {
  permissions: Permission[];
  mode?: "any" | "all"; // "any" means user needs at least one permission, "all" means user needs all permissions
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface RouteGateProps {
  route: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renders children only if user has the required permission
 */
export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Renders children only if user has the required permissions
 */
export function MultiPermissionGate({ 
  permissions, 
  mode = "any", 
  children, 
  fallback = null 
}: MultiPermissionGateProps) {
  const { hasAnyPermission, hasAllPermissions } = usePermissions();
  
  const hasAccess = mode === "all" 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Renders children only if user can access the route
 */
export function RouteGate({ route, children, fallback = null }: RouteGateProps) {
  const { canAccessRoute } = usePermissions();
  
  if (!canAccessRoute(route)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Convenience components for common permissions
 */

// User Management
export function UserManagementGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <PermissionGate permission="users.view" fallback={fallback}>{children}</PermissionGate>;
}

export function UserCreateGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <PermissionGate permission="users.create" fallback={fallback}>{children}</PermissionGate>;
}

// Financial Management
export function FinanceOverviewGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <PermissionGate permission="finance.overview" fallback={fallback}>{children}</PermissionGate>;
}

export function PaymentsGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <PermissionGate permission="finance.payments.view" fallback={fallback}>{children}</PermissionGate>;
}

// Course Management
export function CourseViewGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <PermissionGate permission="courses.view" fallback={fallback}>{children}</PermissionGate>;
}

export function CourseCreateGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <PermissionGate permission="courses.create" fallback={fallback}>{children}</PermissionGate>;
}

// Academic Management
export function GradesGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <PermissionGate permission="academic.grades.view" fallback={fallback}>{children}</PermissionGate>;
}

export function ResultsGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <PermissionGate permission="academic.results.view" fallback={fallback}>{children}</PermissionGate>;
}

// System Settings
export function SettingsGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <PermissionGate permission="system.settings.view" fallback={fallback}>{children}</PermissionGate>;
}

// Admin-only features
export function AdminOnlyGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <MultiPermissionGate 
    permissions={["users.create", "system.settings.manage"]} 
    mode="any" 
    fallback={fallback}
  >
    {children}
  </MultiPermissionGate>;
}

/**
 * Hook for conditional logic based on permissions
 */
export function useConditionalRender() {
  const permissions = usePermissions();
  
  return {
    // Render functions
    renderIf: (permission: Permission, component: React.ReactNode, fallback?: React.ReactNode) => {
      return permissions.hasPermission(permission) ? component : (fallback || null);
    },
    
    renderIfAny: (permissionList: Permission[], component: React.ReactNode, fallback?: React.ReactNode) => {
      return permissions.hasAnyPermission(permissionList) ? component : (fallback || null);
    },
    
    renderIfAll: (permissionList: Permission[], component: React.ReactNode, fallback?: React.ReactNode) => {
      return permissions.hasAllPermissions(permissionList) ? component : (fallback || null);
    },
    
    // Boolean checks for conditional logic
    showForPermission: (permission: Permission) => permissions.hasPermission(permission),
    showForAnyPermission: (permissionList: Permission[]) => permissions.hasAnyPermission(permissionList),
    showForAllPermissions: (permissionList: Permission[]) => permissions.hasAllPermissions(permissionList),
  };
}