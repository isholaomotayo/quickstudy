import { useApp } from "@/contexts/AppContext";
import {
  UserRole,
  hasRole,
  hasAnyRole,
  hasLMSAccess,
  hasResultsAccess,
  hasCourseApprovalAccess,
  canCreateUsers,
  canCreateCourses,
  canAssignCourseStaff,
  hasFinanceOverviewAccess,
  hasUserPaymentsAccess,
  ROLE_GROUPS,
} from "@/lib/roles";

/**
 * Custom hook for role-based permissions
 * Provides easy access to role checking functions in React components
 */
export function useRoles() {
  const { userData } = useApp();
  const userRole = userData?.role as UserRole | null;

  return {
    userRole,
    userData,

    // Basic role checks
    hasRole: (requiredRole: UserRole) => hasRole(userRole, requiredRole),
    hasAnyRole: (requiredRoles: UserRole[]) =>
      hasAnyRole(userRole, requiredRoles),

    // Administrative roles
    isSuperAdmin: () => userRole === "SUPERADMIN",
    isAdmin: () => hasAnyRole(userRole, ["SUPERADMIN", "ADMIN"]),

    // Academic staff roles
    isProgrammeCoordinator: () => userRole === "PROGRAMME_COORDINATOR",
    isHOD: () => userRole === "HOD",
    isProgrammeExamOfficer: () => userRole === "PROGRAMME_EXAM_OFFICER",
    isFacilitator: () => userRole === "FACILITATOR",
    isETutor: () => userRole === "ETUTOR",
    isStaff: () => userRole === "STAFF",
    isLecturer: () => userRole === "LECTURER",

    // Student and applicant roles
    isStudent: () => userRole === "STUDENT",
    isApplicant: () => userRole === "APPLICANT",
    isAffiliate: () => userRole === "AFFILIATE",

    // Role groups
    isAdministrator: () =>
      hasAnyRole(userRole, [...ROLE_GROUPS.ADMINISTRATORS]),
    isAcademicStaff: () =>
      hasAnyRole(userRole, [...ROLE_GROUPS.ACADEMIC_STAFF]),
    isAnyStaff: () => hasAnyRole(userRole, [...ROLE_GROUPS.ALL_STAFF]),

    // Permission-based checks
    hasLMSAccess: () => hasLMSAccess(userRole),
    hasResultsAccess: () => hasResultsAccess(userRole),
    hasCourseApprovalAccess: () => hasCourseApprovalAccess(userRole),
    canCreateUsers: () => canCreateUsers(userRole),
    canCreateCourses: () => canCreateCourses(userRole),
    canAssignCourseStaff: () => canAssignCourseStaff(userRole),

    // Specific business logic checks
    canManageProgramme: () =>
      hasAnyRole(userRole, ["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR"]),
    canViewAllResults: () => hasAnyRole(userRole, ["SUPERADMIN", "ADMIN"]),
    canViewProgrammeResults: () =>
      hasAnyRole(userRole, [
        "SUPERADMIN",
        "ADMIN",
        "PROGRAMME_COORDINATOR",
        "PROGRAMME_EXAM_OFFICER",
      ]),
    canApproveCourseRegistration: () =>
      hasAnyRole(userRole, [
        "SUPERADMIN",
        "ADMIN",
        "PROGRAMME_COORDINATOR",
        "HOD",
        "FACILITATOR",
        "ETUTOR",
      ]),

    // Finance access checks
    hasFinanceOverviewAccess: () => hasFinanceOverviewAccess(userRole),
    hasUserPaymentsAccess: () => hasUserPaymentsAccess(userRole),

    // Helper for checking if student access should be restricted
    shouldRestrictFromStudents: () =>
      hasAnyRole(userRole, [...ROLE_GROUPS.ALL_STAFF]),
  };
}

/**
 * Hook for checking if user has specific roles
 */
export function useHasRole(...roles: UserRole[]) {
  const { hasAnyRole } = useRoles();
  return hasAnyRole(roles);
}

/**
 * Hook for checking if user has LMS access
 */
export function useHasLMSAccess() {
  const { hasLMSAccess } = useRoles();
  return hasLMSAccess();
}

/**
 * Hook for checking if user has results access
 */
export function useHasResultsAccess() {
  const { hasResultsAccess } = useRoles();
  return hasResultsAccess();
}

/**
 * Hook for checking if user can approve courses
 */
export function useCanApproveCourses() {
  const { hasCourseApprovalAccess } = useRoles();
  return hasCourseApprovalAccess();
}
