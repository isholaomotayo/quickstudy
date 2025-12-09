/**
 * React hooks for permission checking
 * 
 * Provides easy-to-use hooks for checking permissions in React components
 */

"use client";

import { useApp } from "@/contexts/AppContext";
import { 
  Permission, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  canAccessRoute,
  getPermissionsForRole
} from "@/lib/permissions-config";
import { UserRole } from "@/lib/roles";

/**
 * Main permissions hook
 */
export function usePermissions() {
  const { userData } = useApp();
  const userRole = userData?.role as UserRole | null | undefined;

  return {
    // Check single permission
    hasPermission: (permission: Permission) => hasPermission(userRole, permission),
    
    // Check multiple permissions (any)
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(userRole, permissions),
    
    // Check multiple permissions (all)
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(userRole, permissions),
    
    // Check route access
    canAccessRoute: (route: string) => canAccessRoute(userRole, route),
    
    // Get all permissions for current user
    getUserPermissions: () => userRole ? getPermissionsForRole(userRole) : [],
    
    // Current user role
    userRole,
    
    // Helper methods for common checks
    can: {
      // User Management
      viewUsers: () => hasPermission(userRole, "users.view"),
      createUsers: () => hasPermission(userRole, "users.create"),
      editUsers: () => hasPermission(userRole, "users.edit"),
      deleteUsers: () => hasPermission(userRole, "users.delete"),
      manageRoles: () => hasPermission(userRole, "users.manage_roles"),
      
      // Financial Management
      viewFinanceOverview: () => hasPermission(userRole, "finance.overview"),
      viewPayments: () => hasPermission(userRole, "finance.payments.view"),
      managePayments: () => hasPermission(userRole, "finance.payments.manage"),
      reconcilePayments: () => hasPermission(userRole, "finance.reconcile"),
      viewFinancialReports: () => hasPermission(userRole, "finance.reports.view"),
      
      // Course Management
      viewCourses: () => hasPermission(userRole, "courses.view"),
      createCourses: () => hasPermission(userRole, "courses.create"),
      editCourses: () => hasPermission(userRole, "courses.edit"),
      deleteCourses: () => hasPermission(userRole, "courses.delete"),
      approveCourses: () => hasPermission(userRole, "courses.approve"),
      assignStaff: () => hasPermission(userRole, "courses.assign_staff"),
      
      // Academic Management
      viewGrades: () => hasPermission(userRole, "academic.grades.view"),
      editGrades: () => hasPermission(userRole, "academic.grades.edit"),
      viewResults: () => hasPermission(userRole, "academic.results.view"),
      manageResults: () => hasPermission(userRole, "academic.results.manage"),
      manageCalendar: () => hasPermission(userRole, "academic.calendar.manage"),
      manageEvents: () => hasPermission(userRole, "academic.events.manage"),
      
      // LMS
      accessLMS: () => hasPermission(userRole, "lms.access"),
      createLMSContent: () => hasPermission(userRole, "lms.content.create"),
      editLMSContent: () => hasPermission(userRole, "lms.content.edit"),
      
      // System
      viewSettings: () => hasPermission(userRole, "system.settings.view"),
      manageSettings: () => hasPermission(userRole, "system.settings.manage"),
      performMaintenance: () => hasPermission(userRole, "system.maintenance"),
      
      // Reporting & Analytics
      viewReports: () => hasPermission(userRole, "reports.view"),
      generateReports: () => hasPermission(userRole, "reports.generate"),
      viewAnalytics: () => hasPermission(userRole, "analytics.view"),
      accessAdvancedAnalytics: () => hasPermission(userRole, "analytics.advanced"),
      
      // Applications
      viewApplications: () => hasPermission(userRole, "applications.view"),
      processApplications: () => hasPermission(userRole, "applications.process"),
      
      // Departments & Programmes
      manageDepartments: () => hasPermission(userRole, "departments.manage"),
      manageProgrammes: () => hasPermission(userRole, "programmes.manage"),

      // Manage Dashboard
      accessManageDashboard: () => hasPermission(userRole, "manage.view"),
      viewManagedCourses: () => hasPermission(userRole, "manage.courses.view"),
      editManagedCourses: () => hasPermission(userRole, "manage.courses.edit"),
      manageCourseContent: () => hasPermission(userRole, "manage.courses.content"),
      viewManagedResults: () => hasPermission(userRole, "manage.results.view"),
      editManagedResults: () => hasPermission(userRole, "manage.results.edit"),
      viewManagedStudents: () => hasPermission(userRole, "manage.students.view"),
      assignStaffToCourses: () => hasPermission(userRole, "manage.staff.assign"),
      approveManagedCourses: () => hasPermission(userRole, "manage.approvals.course"),
    }
  };
}

/**
 * Hook for checking specific permissions
 */
export function usePermission(permission: Permission) {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

/**
 * Hook for checking multiple permissions (any)
 */
export function useAnyPermission(permissions: Permission[]) {
  const { hasAnyPermission } = usePermissions();
  return hasAnyPermission(permissions);
}

/**
 * Hook for checking multiple permissions (all)
 */
export function useAllPermissions(permissions: Permission[]) {
  const { hasAllPermissions } = usePermissions();
  return hasAllPermissions(permissions);
}

/**
 * Hook for checking route access
 */
export function useRouteAccess(route: string) {
  const { canAccessRoute } = usePermissions();
  return canAccessRoute(route);
}

/**
 * Legacy compatibility hooks (using new permission system)
 */
export function useRoles() {
  const permissions = usePermissions();
  
  return {
    // Legacy methods using new permission system
    hasFinanceOverviewAccess: () => permissions.can.viewFinanceOverview(),
    hasUserPaymentsAccess: () => permissions.can.viewPayments(),
    hasLMSAccess: () => permissions.can.accessLMS(),
    hasResultsAccess: () => permissions.can.viewResults(),
    hasCourseApprovalAccess: () => permissions.can.approveCourses(),
    canCreateUsers: () => permissions.can.createUsers(),
    canCreateCourses: () => permissions.can.createCourses(),
    canAssignCourseStaff: () => permissions.can.assignStaff(),
    
    // Include new permission system methods
    ...permissions
  };
}