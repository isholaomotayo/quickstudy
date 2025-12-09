/**
 * Centralized Permissions Configuration
 * 
 * This file defines all permissions, their required roles, and provides
 * a unified interface for checking permissions across components and APIs.
 */

import { UserRole } from "./roles";

// Define all possible permissions in the system
export type Permission = 
  // Dashboard & Overview
  | "dashboard.view"
  | "overview.view"
  
  // User Management
  | "users.view"
  | "users.create"
  | "users.edit" 
  | "users.delete"
  | "users.manage_roles"
  
  // Financial Management
  | "finance.overview"
  | "finance.payments.view"
  | "finance.payments.manage"
  | "finance.reports.view"
  | "finance.reconcile"
  
  // Course Management
  | "courses.view"
  | "courses.create"
  | "courses.edit"
  | "courses.delete"
  | "courses.approve"
  | "courses.assign_staff"
  
  // Academic Management
  | "academic.grades.view"
  | "academic.grades.edit"
  | "academic.results.view"
  | "academic.results.manage"
  | "academic.calendar.manage"
  | "academic.events.manage"
  
  // LMS Access
  | "lms.access"
  | "lms.content.create"
  | "lms.content.edit"
  
  // Announcements
  | "announcements.view"
  | "announcements.create"
  | "announcements.edit"
  | "announcements.delete"
  
  // Forum & Connect
  | "forum.view"
  | "forum.create_topic"
  | "forum.edit_topic"
  | "forum.delete_topic"
  | "forum.create_post"
  | "forum.edit_post"
  | "forum.delete_post"
  | "forum.moderate"
  
  // Course Enrollment
  | "courses.enroll"
  | "courses.unenroll"
  
  // System Settings
  | "system.settings.view"
  | "system.settings.manage"
  | "system.maintenance"
  
  // Reporting & Analytics
  | "reports.view"
  | "reports.generate"
  | "analytics.view"
  | "analytics.advanced"
  
  // Application Management
  | "applications.view"
  | "applications.process"
  
  // Department Management
  | "departments.manage"
  | "programmes.manage"

  // Manage Dashboard (Sub-admin roles)
  | "manage.view"
  | "manage.courses.view"
  | "manage.courses.edit"
  | "manage.courses.content"
  | "manage.results.view"
  | "manage.results.edit"
  | "manage.students.view"
  | "manage.staff.assign"
  | "manage.approvals.course";

// Permission Configuration - Maps permissions to required roles
export const PERMISSIONS_CONFIG: Record<Permission, {
  roles: UserRole[];
  description: string;
  category: string;
}> = {
  // Dashboard & Overview
  "dashboard.view": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "PROGRAMME_EXAM_OFFICER", "FACILITATOR", "ETUTOR", "STAFF", "LECTURER"],
    description: "Access to dashboard view",
    category: "Dashboard"
  },
  "overview.view": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "PROGRAMME_EXAM_OFFICER", "FACILITATOR", "ETUTOR", "STAFF", "LECTURER"],
    description: "Access to system overview",
    category: "Dashboard"
  },

  // User Management
  "users.view": {
    roles: ["SUPERADMIN", "ADMIN"],
    description: "View users list and details",
    category: "User Management"
  },
  "users.create": {
    roles: ["SUPERADMIN", "ADMIN"],
    description: "Create new users",
    category: "User Management"
  },
  "users.edit": {
    roles: ["SUPERADMIN", "ADMIN"],
    description: "Edit user information",
    category: "User Management"
  },
  "users.delete": {
    roles: ["SUPERADMIN"],
    description: "Delete users",
    category: "User Management"
  },
  "users.manage_roles": {
    roles: ["SUPERADMIN"],
    description: "Assign and manage user roles",
    category: "User Management"
  },

  // Financial Management
  "finance.overview": {
    roles: ["SUPERADMIN"],
    description: "Access to financial overview and analytics",
    category: "Finance"
  },
  "finance.payments.view": {
    roles: ["SUPERADMIN", "ADMIN"],
    description: "View payment records and transactions",
    category: "Finance"
  },
  "finance.payments.manage": {
    roles: ["SUPERADMIN", "ADMIN"],
    description: "Manage payment records and reconciliation",
    category: "Finance"
  },
  "finance.reports.view": {
    roles: ["SUPERADMIN", "ADMIN"],
    description: "View financial reports",
    category: "Finance"
  },
  "finance.reconcile": {
    roles: ["SUPERADMIN", "ADMIN"],
    description: "Reconcile payment records",
    category: "Finance"
  },

  // Course Management
  "courses.view": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "PROGRAMME_EXAM_OFFICER", "FACILITATOR", "ETUTOR", "LECTURER"],
    description: "View courses",
    category: "Academic"
  },
  "courses.create": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR"],
    description: "Create new courses",
    category: "Academic"
  },
  "courses.edit": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD"],
    description: "Edit course details",
    category: "Academic"
  },
  "courses.delete": {
    roles: ["SUPERADMIN", "ADMIN"],
    description: "Delete courses",
    category: "Academic"
  },
  "courses.approve": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "FACILITATOR", "ETUTOR"],
    description: "Approve course changes",
    category: "Academic"
  },
  "courses.assign_staff": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR"],
    description: "Assign staff to courses",
    category: "Academic"
  },

  // Academic Management
  "academic.grades.view": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "PROGRAMME_EXAM_OFFICER", "FACILITATOR", "ETUTOR"],
    description: "View student grades",
    category: "Academic"
  },
  "academic.grades.edit": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "PROGRAMME_EXAM_OFFICER", "FACILITATOR", "ETUTOR"],
    description: "Edit student grades",
    category: "Academic"
  },
  "academic.results.view": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "PROGRAMME_EXAM_OFFICER", "FACILITATOR", "ETUTOR"],
    description: "View academic results",
    category: "Academic"
  },
  "academic.results.manage": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "PROGRAMME_EXAM_OFFICER"],
    description: "Manage and publish academic results",
    category: "Academic"
  },
  "academic.calendar.manage": {
    roles: ["SUPERADMIN", "ADMIN", "HOD"],
    description: "Manage academic calendar",
    category: "Academic"
  },
  "academic.events.manage": {
    roles: ["SUPERADMIN", "ADMIN", "HOD", "PROGRAMME_COORDINATOR"],
    description: "Manage academic events",
    category: "Academic"
  },

  // LMS Access
  "lms.access": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "FACILITATOR", "ETUTOR"],
    description: "Access to Learning Management System",
    category: "LMS"
  },
  "lms.content.create": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "FACILITATOR", "ETUTOR"],
    description: "Create LMS content",
    category: "LMS"
  },
  "lms.content.edit": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "FACILITATOR", "ETUTOR"],
    description: "Edit LMS content",
    category: "LMS"
  },

  // Announcements
  "announcements.view": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "PROGRAMME_EXAM_OFFICER", "FACILITATOR", "ETUTOR", "STAFF", "LECTURER", "STUDENT"],
    description: "View announcements",
    category: "Announcements"
  },
  "announcements.create": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD"],
    description: "Create announcements",
    category: "Announcements"
  },
  "announcements.edit": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD"],
    description: "Edit announcements",
    category: "Announcements"
  },
  "announcements.delete": {
    roles: ["SUPERADMIN", "ADMIN"],
    description: "Delete announcements",
    category: "Announcements"
  },

  // Forum & Connect
  "forum.view": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "PROGRAMME_EXAM_OFFICER", "FACILITATOR", "ETUTOR", "STAFF", "LECTURER", "STUDENT"],
    description: "View forum topics and posts",
    category: "Forum"
  },
  "forum.create_topic": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "FACILITATOR", "ETUTOR", "LECTURER", "STUDENT"],
    description: "Create forum topics",
    category: "Forum"
  },
  "forum.edit_topic": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "FACILITATOR", "ETUTOR"],
    description: "Edit forum topics",
    category: "Forum"
  },
  "forum.delete_topic": {
    roles: ["SUPERADMIN", "ADMIN"],
    description: "Delete forum topics",
    category: "Forum"
  },
  "forum.create_post": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "FACILITATOR", "ETUTOR", "LECTURER", "STUDENT"],
    description: "Create forum posts/comments",
    category: "Forum"
  },
  "forum.edit_post": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "FACILITATOR", "ETUTOR"],
    description: "Edit forum posts/comments",
    category: "Forum"
  },
  "forum.delete_post": {
    roles: ["SUPERADMIN", "ADMIN"],
    description: "Delete forum posts/comments",
    category: "Forum"
  },
  "forum.moderate": {
    roles: ["SUPERADMIN", "ADMIN", "HOD"],
    description: "Moderate forum content",
    category: "Forum"
  },

  // Course Enrollment
  "courses.enroll": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "STAFF"],
    description: "Enroll students in courses",
    category: "Academic"
  },
  "courses.unenroll": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD"],
    description: "Unenroll students from courses",
    category: "Academic"
  },

  // System Settings
  "system.settings.view": {
    roles: ["SUPERADMIN", "ADMIN"],
    description: "View system settings",
    category: "System"
  },
  "system.settings.manage": {
    roles: ["SUPERADMIN"],
    description: "Manage system settings",
    category: "System"
  },
  "system.maintenance": {
    roles: ["SUPERADMIN"],
    description: "Perform system maintenance tasks",
    category: "System"
  },

  // Reporting & Analytics
  "reports.view": {
    roles: ["SUPERADMIN", "ADMIN", "HOD"],
    description: "View reports",
    category: "Reporting"
  },
  "reports.generate": {
    roles: ["SUPERADMIN", "ADMIN"],
    description: "Generate custom reports",
    category: "Reporting"
  },
  "analytics.view": {
    roles: ["SUPERADMIN", "ADMIN", "HOD"],
    description: "View analytics data",
    category: "Analytics"
  },
  "analytics.advanced": {
    roles: ["SUPERADMIN"],
    description: "Access advanced analytics features",
    category: "Analytics"
  },

  // Application Management
  "applications.view": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD"],
    description: "View student applications",
    category: "Applications"
  },
  "applications.process": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR"],
    description: "Process and approve applications",
    category: "Applications"
  },

  // Department Management
  "departments.manage": {
    roles: ["SUPERADMIN", "ADMIN"],
    description: "Manage departments",
    category: "Academic"
  },
  "programmes.manage": {
    roles: ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR"],
    description: "Manage programmes",
    category: "Academic"
  },

  // Manage Dashboard Permissions
  "manage.view": {
    roles: ["PROGRAMME_COORDINATOR", "PROGRAMME_EXAM_OFFICER", "HOD", "FACILITATOR", "ETUTOR"],
    description: "Access to management dashboard",
    category: "Manage Dashboard"
  },
  "manage.courses.view": {
    roles: ["PROGRAMME_COORDINATOR", "HOD", "FACILITATOR", "ETUTOR"],
    description: "View assigned courses in manage dashboard",
    category: "Manage Dashboard"
  },
  "manage.courses.edit": {
    roles: ["PROGRAMME_COORDINATOR", "HOD", "FACILITATOR", "ETUTOR"],
    description: "Edit assigned courses",
    category: "Manage Dashboard"
  },
  "manage.courses.content": {
    roles: ["PROGRAMME_COORDINATOR", "FACILITATOR", "ETUTOR"],
    description: "Manage course content (LMS)",
    category: "Manage Dashboard"
  },
  "manage.results.view": {
    roles: ["PROGRAMME_COORDINATOR", "PROGRAMME_EXAM_OFFICER", "HOD", "FACILITATOR", "ETUTOR"],
    description: "View results in manage dashboard",
    category: "Manage Dashboard"
  },
  "manage.results.edit": {
    roles: ["PROGRAMME_COORDINATOR", "PROGRAMME_EXAM_OFFICER", "HOD", "FACILITATOR", "ETUTOR"],
    description: "Edit and input results",
    category: "Manage Dashboard"
  },
  "manage.students.view": {
    roles: ["PROGRAMME_COORDINATOR", "PROGRAMME_EXAM_OFFICER", "HOD", "FACILITATOR", "ETUTOR"],
    description: "View students in scope",
    category: "Manage Dashboard"
  },
  "manage.staff.assign": {
    roles: ["PROGRAMME_COORDINATOR"],
    description: "Assign staff to courses",
    category: "Manage Dashboard"
  },
  "manage.approvals.course": {
    roles: ["PROGRAMME_COORDINATOR", "HOD", "FACILITATOR", "ETUTOR"],
    description: "Approve course registrations",
    category: "Manage Dashboard"
  },
};

// Route-specific permission mapping (ops routes only)
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  // Main ops dashboard - require staff level access
  "/ops": ["dashboard.view"],
  "/ops/overview": ["overview.view"],
  
  // User management routes
  "/ops/users": ["users.view"],
  "/ops/users/create": ["users.create"],
  "/ops/users/[id]/edit": ["users.edit"],
  
  // Financial routes - restricted to admin roles
  "/ops/financial": ["finance.overview"],
  "/ops/payments": ["finance.payments.view"],
  
  // Course routes
  "/ops/courses": ["courses.view"],
  "/ops/courses/create": ["courses.create"],
  "/ops/courses/[id]/edit": ["courses.edit"],
  
  // Academic routes
  "/ops/academic": ["academic.results.view"],
  "/ops/grades": ["academic.grades.view"],
  
  // System routes - admin only
  "/ops/settings": ["system.settings.view"],

  // Manage dashboard routes (sub-admin roles)
  "/manage": ["manage.view"],
  "/manage/overview": ["manage.view"],
  "/manage/courses": ["manage.courses.view"],
  "/manage/results": ["manage.results.view"],
  "/manage/students": ["manage.students.view"],
  "/manage/staff-assignment": ["manage.staff.assign"],
  "/manage/approvals": ["manage.approvals.course"],
  "/manage/programme": ["manage.view"],
};

// API endpoint permission mapping
export const API_PERMISSIONS: Record<string, Permission[]> = {
  // Dashboard APIs
  "GET /api/dashboard/overview": ["overview.view"],
  "GET /api/dashboard/stats": ["dashboard.view"],
  
  // User management APIs
  "GET /api/dashboard/users": ["users.view"],
  "POST /api/dashboard/users": ["users.create"],
  "PUT /api/dashboard/users": ["users.edit"],
  "DELETE /api/dashboard/users": ["users.delete"],
  
  // Financial APIs
  "GET /api/dashboard/financial": ["finance.overview"],
  "GET /api/dashboard/payments": ["finance.payments.view"],
  "POST /api/dashboard/payments/reconcile-user": ["finance.reconcile"],
  "POST /api/dashboard/payments/sync-pending": ["finance.payments.manage"],
  
  // Course APIs
  "GET /api/dashboard/courses": ["courses.view"],
  "POST /api/dashboard/courses": ["courses.create"],
  "PUT /api/dashboard/courses": ["courses.edit"],
  "DELETE /api/dashboard/courses": ["courses.delete"],
  
  // Academic APIs
  "GET /api/dashboard/grades": ["academic.grades.view"],
  "POST /api/dashboard/grades": ["academic.grades.edit"],
  "PUT /api/dashboard/grades": ["academic.grades.edit"],
  "DELETE /api/dashboard/grades": ["academic.grades.edit"],
  
  // Settings APIs
  "GET /api/dashboard/settings": ["system.settings.view"],
  "POST /api/dashboard/settings": ["system.settings.manage"],
  
  // Applications APIs
  "GET /api/dashboard/applications": ["applications.view"],

  // Manage Dashboard APIs
  "GET /api/manage/overview": ["manage.view"],
  "GET /api/manage/my-courses": ["manage.courses.view"],
  "GET /api/manage/my-students": ["manage.students.view"],
  "POST /api/manage/staff-assignment": ["manage.staff.assign"],
  "GET /api/manage/course-approvals": ["manage.approvals.course"],
  "POST /api/manage/course-approvals": ["manage.approvals.course"],
  "GET /api/manage/results": ["manage.results.view"],
  "POST /api/manage/results": ["manage.results.edit"],
  "PUT /api/manage/results": ["manage.results.edit"],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: UserRole | null | undefined, permission: Permission): boolean {
  if (!userRole) return false;
  
  const config = PERMISSIONS_CONFIG[permission];
  if (!config) {
    console.warn(`Unknown permission: ${permission}`);
    return false;
  }
  
  return config.roles.includes(userRole);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(userRole: UserRole | null | undefined, permissions: Permission[]): boolean {
  if (!userRole) return false;
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(userRole: UserRole | null | undefined, permissions: Permission[]): boolean {
  if (!userRole) return false;
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Get all permissions for a specific role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return Object.entries(PERMISSIONS_CONFIG)
    .filter(([_, config]) => config.roles.includes(role))
    .map(([permission]) => permission as Permission);
}

/**
 * Get permissions required for a route
 */
export function getRoutePermissions(route: string): Permission[] {
  return ROUTE_PERMISSIONS[route] || [];
}

/**
 * Get permissions required for an API endpoint
 */
export function getAPIPermissions(method: string, path: string): Permission[] {
  const key = `${method.toUpperCase()} ${path}`;
  return API_PERMISSIONS[key] || [];
}

/**
 * Check if user can access a route
 */
export function canAccessRoute(userRole: UserRole | null | undefined, route: string): boolean {
  const requiredPermissions = getRoutePermissions(route);
  if (requiredPermissions.length === 0) return true; // No specific permissions required
  
  return hasAnyPermission(userRole, requiredPermissions);
}

/**
 * Check if user can access an API endpoint
 */
export function canAccessAPI(userRole: UserRole | null | undefined, method: string, path: string): boolean {
  const requiredPermissions = getAPIPermissions(method, path);
  if (requiredPermissions.length === 0) return true; // No specific permissions required
  
  return hasAnyPermission(userRole, requiredPermissions);
}

/**
 * Get all permissions grouped by category
 */
export function getPermissionsByCategory(): Record<string, Array<{ permission: Permission; description: string; roles: UserRole[] }>> {
  const grouped: Record<string, Array<{ permission: Permission; description: string; roles: UserRole[] }>> = {};
  
  Object.entries(PERMISSIONS_CONFIG).forEach(([permission, config]) => {
    if (!grouped[config.category]) {
      grouped[config.category] = [];
    }
    
    grouped[config.category].push({
      permission: permission as Permission,
      description: config.description,
      roles: config.roles
    });
  });
  
  return grouped;
}

/**
 * Legacy compatibility functions (maps old permission strings to new system)
 */
export function checkPermission(userRole: UserRole, permission: string): boolean {
  const permissionMap: Record<string, Permission> = {
    "lms_access": "lms.access",
    "results_access": "academic.results.view",
    "course_approval": "courses.approve",
    "finance_overview": "finance.overview",
    "user_payments": "finance.payments.view",
    "user_management": "users.view",
    "course_creation": "courses.create",
    "staff_assignment": "courses.assign_staff",
  };
  
  const mappedPermission = permissionMap[permission];
  if (!mappedPermission) {
    console.warn(`Legacy permission not mapped: ${permission}`);
    return false;
  }
  
  return hasPermission(userRole, mappedPermission);
}