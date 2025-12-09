// Role hierarchy and utilities for access control
export type UserRole =
  | "SUPERADMIN"
  | "SYSADMIN"
  | "ADMIN"
  | "PROGRAMME_COORDINATOR"
  | "HOD"
  | "PROGRAMME_EXAM_OFFICER"
  | "FACILITATOR"
  | "ETUTOR"
  | "STAFF"
  | "LECTURER"
  | "STUDENT"
  | "APPLICANT"
  | "AFFILIATE";

// Role hierarchy - higher roles can access lower role permissions
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPERADMIN: 8,
  SYSADMIN: 8,
  ADMIN: 6,
  PROGRAMME_COORDINATOR: 5.5,
  HOD: 5,
  PROGRAMME_EXAM_OFFICER: 4.5,
  FACILITATOR: 4,
  ETUTOR: 4,
  STAFF: 4,
  LECTURER: 4,
  STUDENT: 3,
  APPLICANT: 2,
  AFFILIATE: 1,
};

// Role groups for easier management
export const ROLE_GROUPS = {
  ADMINISTRATORS: ["SUPERADMIN", "SYSADMIN", "ADMIN"] as const,
  PROGRAMME_MANAGERS: ["PROGRAMME_COORDINATOR"] as const,
  ACADEMIC_STAFF: [
    "HOD",
    "PROGRAMME_EXAM_OFFICER",
    "FACILITATOR",
    "ETUTOR",
    "STAFF",
    "LECTURER",
  ] as const,
  LMS_ACCESS: [
    "SUPERADMIN",
    "SYSADMIN",
    "ADMIN",
    "PROGRAMME_COORDINATOR",
    "HOD",
    "FACILITATOR",
    "ETUTOR",
  ] as const,
  RESULTS_ACCESS: [
    "SUPERADMIN",
    "SYSADMIN",
    "ADMIN",
    "PROGRAMME_COORDINATOR",
    "HOD",
    "PROGRAMME_EXAM_OFFICER",
    "FACILITATOR",
    "ETUTOR",
  ] as const,
  COURSE_APPROVAL: [
    "SUPERADMIN",
    "SYSADMIN",
    "ADMIN",
    "PROGRAMME_COORDINATOR",
    "HOD",
    "FACILITATOR",
    "ETUTOR",
  ] as const,
  FINANCE_OVERVIEW: ["SUPERADMIN", "SYSADMIN"] as const,
  USER_PAYMENTS: ["SUPERADMIN", "SYSADMIN", "ADMIN"] as const,
  STUDENTS: ["STUDENT"] as const,
  APPLICANTS: ["APPLICANT"] as const,
  AFFILIATES: ["AFFILIATE"] as const,
  ALL_STAFF: [
    "SUPERADMIN",
    "SYSADMIN",
    "ADMIN",
    "PROGRAMME_COORDINATOR",
    "HOD",
    "PROGRAMME_EXAM_OFFICER",
    "FACILITATOR",
    "ETUTOR",
    "STAFF",
    "LECTURER",
  ] as const,
  ALL_USERS: [
    "SUPERADMIN",
    "SYSADMIN",
    "ADMIN",
    "PROGRAMME_COORDINATOR",
    "HOD",
    "PROGRAMME_EXAM_OFFICER",
    "FACILITATOR",
    "ETUTOR",
    "STAFF",
    "LECTURER",
    "STUDENT",
    "APPLICANT",
    "AFFILIATE",
  ] as const,
} as const;

// Utility functions
export function hasRole(
  userRole: UserRole | null | undefined,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function hasAnyRole(
  userRole: UserRole | null | undefined,
  requiredRoles: UserRole[]
): boolean {
  if (!userRole) return false;
  return requiredRoles.some((role) => hasRole(userRole, role));
}

export function hasAllRoles(
  userRole: UserRole | null | undefined,
  requiredRoles: UserRole[]
): boolean {
  if (!userRole) return false;
  return requiredRoles.every((role) => hasRole(userRole, role));
}

export function isRejectedRole(
  userRole: UserRole | null | undefined,
  rejectedRoles: UserRole[]
): boolean {
  if (!userRole) return false;
  return rejectedRoles.includes(userRole);
}

export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role];
}

export function canAccess(
  userRole: UserRole | null | undefined,
  allowedRoles: UserRole[],
  rejectedRoles: UserRole[] = []
): boolean {
  if (!userRole) return false;

  // First check if role is explicitly rejected
  if (isRejectedRole(userRole, rejectedRoles)) {
    return false;
  }

  // Then check if role is allowed
  return hasAnyRole(userRole, allowedRoles);
}

// Type for role decorator options
export interface RoleOptions {
  allowedRoles?: UserRole[];
  rejectedRoles?: UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
  requireAll?: boolean; // For RequireAllRoles
}

// Default options
export const DEFAULT_ROLE_OPTIONS: RoleOptions = {
  redirectTo: "/signin?logout=1",
  fallback: null,
  requireAll: false,
};

// Specific permission checkers for new roles
export function hasLMSAccess(userRole: UserRole | null | undefined): boolean {
  return hasAnyRole(userRole, [...ROLE_GROUPS.LMS_ACCESS]);
}

export function hasResultsAccess(
  userRole: UserRole | null | undefined
): boolean {
  return hasAnyRole(userRole, [...ROLE_GROUPS.RESULTS_ACCESS]);
}

export function hasCourseApprovalAccess(
  userRole: UserRole | null | undefined
): boolean {
  return hasAnyRole(userRole, [...ROLE_GROUPS.COURSE_APPROVAL]);
}

export function canCreateUsers(userRole: UserRole | null | undefined): boolean {
  return hasAnyRole(userRole, ["SUPERADMIN", "SYSADMIN", "ADMIN"]);
}

export function canCreateCourses(
  userRole: UserRole | null | undefined
): boolean {
  return hasAnyRole(userRole, [
    "SUPERADMIN",
    "SYSADMIN",
    "ADMIN",
    "PROGRAMME_COORDINATOR",
  ]);
}

export function canAssignCourseStaff(
  userRole: UserRole | null | undefined
): boolean {
  return hasAnyRole(userRole, [
    "SUPERADMIN",
    "SYSADMIN",
    "ADMIN",
    "PROGRAMME_COORDINATOR",
  ]);
}

export function hasFinanceOverviewAccess(
  userRole: UserRole | null | undefined
): boolean {
  // SUPERADMIN and SYSADMIN have access to all permissions including finance overview
  if (userRole === "SUPERADMIN" || userRole === "SYSADMIN") {
    return true;
  }
  return hasAnyRole(userRole, [...ROLE_GROUPS.FINANCE_OVERVIEW]);
}

export function hasUserPaymentsAccess(
  userRole: UserRole | null | undefined
): boolean {
  // SUPERADMIN and SYSADMIN have access to all permissions including user payments
  if (userRole === "SUPERADMIN" || userRole === "SYSADMIN") {
    return true;
  }
  return hasAnyRole(userRole, [...ROLE_GROUPS.USER_PAYMENTS]);
}

// Role descriptions for UI
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SUPERADMIN: "Full system access across all institutions",
  SYSADMIN: "System administrator with global access and user management",
  ADMIN: "Institution-wide administrative access with user payment access",
  PROGRAMME_COORDINATOR: "Manages programme courses and assigns staff",
  HOD: "Department head with departmental oversight",
  PROGRAMME_EXAM_OFFICER: "Manages all results under their programme",
  FACILITATOR: "LMS and results access with course approval rights",
  ETUTOR: "LMS and results access with course approval rights",
  STAFF: "General staff member",
  LECTURER: "Teaching staff with course access",
  STUDENT: "Enrolled student with course access",
  APPLICANT: "Prospective student",
  AFFILIATE: "External user with limited access",
};
