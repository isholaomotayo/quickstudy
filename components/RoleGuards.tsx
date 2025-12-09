import React from 'react';
import { useRoles } from '@/hooks/useRoles';
import { UserRole } from '@/lib/roles';

interface RoleGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface RequireRoleGuardProps extends RoleGuardProps {
  allowedRoles: UserRole[];
}

interface RejectRoleGuardProps extends RoleGuardProps {
  rejectedRoles: UserRole[];
}

/**
 * Guard component that renders children only if user has one of the allowed roles
 */
export function RequireRoleGuard({ allowedRoles, children, fallback = null }: RequireRoleGuardProps) {
  const { hasAnyRole } = useRoles();
  
  if (hasAnyRole(allowedRoles)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

/**
 * Guard component that renders children only if user does NOT have any of the rejected roles
 */
export function RejectRoleGuard({ rejectedRoles, children, fallback = null }: RejectRoleGuardProps) {
  const { hasAnyRole } = useRoles();
  
  if (!hasAnyRole(rejectedRoles)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

/**
 * Guard for admin-only content
 */
export function AdminOnly({ children, fallback = null }: RoleGuardProps) {
  const { isAdmin } = useRoles();
  
  return isAdmin() ? <>{children}</> : <>{fallback}</>;
}

/**
 * Guard for staff-only content (excludes students)
 */
export function StaffOnly({ children, fallback = null }: RoleGuardProps) {
  const { isAnyStaff } = useRoles();
  
  return isAnyStaff() ? <>{children}</> : <>{fallback}</>;
}

/**
 * Guard for student-only content
 */
export function StudentOnly({ children, fallback = null }: RoleGuardProps) {
  const { isStudent } = useRoles();
  
  return isStudent() ? <>{children}</> : <>{fallback}</>;
}

/**
 * Guard for content that should be hidden from students
 */
export function NotStudent({ children, fallback = null }: RoleGuardProps) {
  const { isStudent } = useRoles();
  
  return !isStudent() ? <>{children}</> : <>{fallback}</>;
}

/**
 * Guard for LMS access
 */
export function LMSAccessOnly({ children, fallback = null }: RoleGuardProps) {
  const { hasLMSAccess } = useRoles();
  
  return hasLMSAccess() ? <>{children}</> : <>{fallback}</>;
}

/**
 * Guard for results access
 */
export function ResultsAccessOnly({ children, fallback = null }: RoleGuardProps) {
  const { hasResultsAccess } = useRoles();
  
  return hasResultsAccess() ? <>{children}</> : <>{fallback}</>;
}

/**
 * Guard for course approval access
 */
export function CourseApprovalOnly({ children, fallback = null }: RoleGuardProps) {
  const { hasCourseApprovalAccess } = useRoles();
  
  return hasCourseApprovalAccess() ? <>{children}</> : <>{fallback}</>;
}

/**
 * Guard for programme coordinator features
 */
export function ProgrammeCoordinatorOnly({ children, fallback = null }: RoleGuardProps) {
  const { isProgrammeCoordinator } = useRoles();
  
  return isProgrammeCoordinator() ? <>{children}</> : <>{fallback}</>;
}

/**
 * Guard for programme exam officer features
 */
export function ProgrammeExamOfficerOnly({ children, fallback = null }: RoleGuardProps) {
  const { isProgrammeExamOfficer } = useRoles();
  
  return isProgrammeExamOfficer() ? <>{children}</> : <>{fallback}</>;
}

/**
 * Guard for facilitator features
 */
export function FacilitatorOnly({ children, fallback = null }: RoleGuardProps) {
  const { isFacilitator } = useRoles();
  
  return isFacilitator() ? <>{children}</> : <>{fallback}</>;
}

/**
 * Guard for etutor features
 */
export function ETutorOnly({ children, fallback = null }: RoleGuardProps) {
  const { isETutor } = useRoles();
  
  return isETutor() ? <>{children}</> : <>{fallback}</>;
}

/**
 * Guard for user management access
 */
export function UserManagementOnly({ children, fallback = null }: RoleGuardProps) {
  const { canCreateUsers } = useRoles();
  
  return canCreateUsers() ? <>{children}</> : <>{fallback}</>;
}

/**
 * Guard for course creation access
 */
export function CourseCreationOnly({ children, fallback = null }: RoleGuardProps) {
  const { canCreateCourses } = useRoles();
  
  return canCreateCourses() ? <>{children}</> : <>{fallback}</>;
}

/**
 * Access denied component
 */
export function AccessDenied({ message = "Access Denied" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{message}</h3>
        <p className="text-gray-600">You don't have permission to access this content.</p>
      </div>
    </div>
  );
}