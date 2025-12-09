import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import React from 'react';
import { UserRole, RoleOptions, DEFAULT_ROLE_OPTIONS, canAccess, hasAnyRole, hasAllRoles, isRejectedRole } from './roles';

// Helper function to get user role from cookies (server-side)
async function getUserRoleFromCookies(): Promise<UserRole | null> {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get('role')?.value;
    return role as UserRole || null;
  } catch (error) {
    console.error('Error getting user role from cookies:', error);
    return null;
  }
}

// Helper function to get user role from context (client-side)
function getUserRoleFromContext(): UserRole | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const getCookieValue = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null;
      }
      return null;
    };
    
    const role = getCookieValue('role');
    return role as UserRole || null;
  } catch (error) {
    console.error('Error getting user role from context:', error);
    return null;
  }
}

// Main RequireRole decorator - allows specific roles
export function RequireRole(allowedRoles: UserRole[], options: Partial<RoleOptions> = {}) {
  const opts = { ...DEFAULT_ROLE_OPTIONS, ...options };
  
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    if (descriptor) {
      // Method decorator
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]) {
        const userRole = await getUserRoleFromCookies();
        
        if (!canAccess(userRole, allowedRoles, opts.rejectedRoles)) {
          if (opts.redirectTo) {
            redirect(opts.redirectTo);
          }
          return opts.fallback;
        }
        
        return originalMethod.apply(this, args);
      };
    } else {
      // Class decorator
      const originalConstructor = target;
      const newConstructor: any = function (...args: any[]) {
        const userRole = getUserRoleFromContext();
        
        if (!canAccess(userRole, allowedRoles, opts.rejectedRoles)) {
          if (opts.redirectTo && typeof window !== 'undefined') {
            window.location.href = opts.redirectTo;
            return null;
          }
          return opts.fallback;
        }
        
        return new originalConstructor(...args);
      };
      
      newConstructor.prototype = originalConstructor.prototype;
      return newConstructor;
    }
  };
}

// RejectRole decorator - explicitly rejects specific roles
export function RejectRole(rejectedRoles: UserRole[], options: Partial<RoleOptions> = {}) {
  const opts = { ...DEFAULT_ROLE_OPTIONS, ...options };
  
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    if (descriptor) {
      // Method decorator
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]) {
        const userRole = await getUserRoleFromCookies();
        
        if (isRejectedRole(userRole, rejectedRoles)) {
          if (opts.redirectTo) {
            redirect(opts.redirectTo);
          }
          return opts.fallback;
        }
        
        return originalMethod.apply(this, args);
      };
    } else {
      // Class decorator
      const originalConstructor = target;
      const newConstructor: any = function (...args: any[]) {
        const userRole = getUserRoleFromContext();
        
        if (isRejectedRole(userRole, rejectedRoles)) {
          if (opts.redirectTo && typeof window !== 'undefined') {
            window.location.href = opts.redirectTo;
            return null;
          }
          return opts.fallback;
        }
        
        return new originalConstructor(...args);
      };
      
      newConstructor.prototype = originalConstructor.prototype;
      return newConstructor;
    }
  };
}

// RequireAnyRole decorator - allows any of the specified roles
export function RequireAnyRole(allowedRoles: UserRole[], options: Partial<RoleOptions> = {}) {
  const opts = { ...DEFAULT_ROLE_OPTIONS, ...options };
  
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    if (descriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]) {
        const userRole = await getUserRoleFromCookies();
        
        if (!hasAnyRole(userRole, allowedRoles)) {
          if (opts.redirectTo) {
            redirect(opts.redirectTo);
          }
          return opts.fallback;
        }
        
        return originalMethod.apply(this, args);
      };
    } else {
      const originalConstructor = target;
      const newConstructor: any = function (...args: any[]) {
        const userRole = getUserRoleFromContext();
        
        if (!hasAnyRole(userRole, allowedRoles)) {
          if (opts.redirectTo && typeof window !== 'undefined') {
            window.location.href = opts.redirectTo;
            return null;
          }
          return opts.fallback;
        }
        
        return new originalConstructor(...args);
      };
      
      newConstructor.prototype = originalConstructor.prototype;
      return newConstructor;
    }
  };
}

// RequireAllRoles decorator - requires all specified roles (for complex permissions)
export function RequireAllRoles(requiredRoles: UserRole[], options: Partial<RoleOptions> = {}) {
  const opts = { ...DEFAULT_ROLE_OPTIONS, ...options };
  
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    if (descriptor) {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]) {
        const userRole = await getUserRoleFromCookies();
        
        if (!hasAllRoles(userRole, requiredRoles)) {
          if (opts.redirectTo) {
            redirect(opts.redirectTo);
          }
          return opts.fallback;
        }
        
        return originalMethod.apply(this, args);
      };
    } else {
      const originalConstructor = target;
      const newConstructor: any = function (...args: any[]) {
        const userRole = getUserRoleFromContext();
        
        if (!hasAllRoles(userRole, requiredRoles)) {
          if (opts.redirectTo && typeof window !== 'undefined') {
            window.location.href = opts.redirectTo;
            return null;
          }
          return opts.fallback;
        }
        
        return new originalConstructor(...args);
      };
      
      newConstructor.prototype = originalConstructor.prototype;
      return newConstructor;
    }
  };
}

// Convenience decorators for common role patterns
export const RequireAdmin = () => RequireRole(['SUPERADMIN', 'SYSADMIN', 'ADMIN']);
export const RequireStaff = () => RequireRole(['SUPERADMIN', 'SYSADMIN', 'ADMIN', 'PROGRAMME_COORDINATOR', 'HOD', 'PROGRAMME_EXAM_OFFICER', 'FACILITATOR', 'ETUTOR', 'STAFF', 'LECTURER']);
export const RequireStudent = () => RequireRole(['STUDENT']);
export const RejectStudent = () => RejectRole(['STUDENT']);
export const RequireAuthenticated = () => RequireAnyRole(['SUPERADMIN', 'SYSADMIN', 'ADMIN', 'PROGRAMME_COORDINATOR', 'HOD', 'PROGRAMME_EXAM_OFFICER', 'FACILITATOR', 'ETUTOR', 'STAFF', 'LECTURER', 'STUDENT', 'APPLICANT', 'AFFILIATE']);

// New convenience decorators for specific permissions
export const RequireLMSAccess = () => RequireRole(['SUPERADMIN', 'SYSADMIN', 'ADMIN', 'PROGRAMME_COORDINATOR', 'HOD', 'FACILITATOR', 'ETUTOR']);
export const RequireResultsAccess = () => RequireRole(['SUPERADMIN', 'SYSADMIN', 'ADMIN', 'PROGRAMME_COORDINATOR', 'HOD', 'PROGRAMME_EXAM_OFFICER', 'FACILITATOR', 'ETUTOR']);
export const RequireCourseApproval = () => RequireRole(['SUPERADMIN', 'SYSADMIN', 'ADMIN', 'PROGRAMME_COORDINATOR', 'HOD', 'FACILITATOR', 'ETUTOR']);
export const RequireUserManagement = () => RequireRole(['SUPERADMIN', 'SYSADMIN']);
export const RequireCourseCreation = () => RequireRole(['SUPERADMIN', 'SYSADMIN', 'PROGRAMME_COORDINATOR']);

// Page-level decorator for Next.js pages
export function RequireRolePage(allowedRoles: UserRole[], options: Partial<RoleOptions> = {}) {
  return function (PageComponent: React.ComponentType<any>) {
    const WrappedComponent = async (props: any) => {
      const userRole = await getUserRoleFromCookies();
      const opts = { ...DEFAULT_ROLE_OPTIONS, ...options };
      
      if (!canAccess(userRole, allowedRoles, opts.rejectedRoles)) {
        if (opts.redirectTo) {
          redirect(opts.redirectTo);
        }
        return opts.fallback || React.createElement('div', null, 'Access Denied');
      }
      
      return React.createElement(PageComponent, props);
    };
    
    // Copy display name for debugging
    WrappedComponent.displayName = `RequireRolePage(${PageComponent.displayName || PageComponent.name})`;
    
    return WrappedComponent;
  };
}

// RejectRolePage decorator for Next.js pages
export function RejectRolePage(rejectedRoles: UserRole[], options: Partial<RoleOptions> = {}) {
  return function (PageComponent: React.ComponentType<any>) {
    const WrappedComponent = async (props: any) => {
      const userRole = await getUserRoleFromCookies();
      const opts = { ...DEFAULT_ROLE_OPTIONS, ...options };
      
      if (isRejectedRole(userRole, rejectedRoles)) {
        if (opts.redirectTo) {
          redirect(opts.redirectTo);
        }
        return opts.fallback || React.createElement('div', null, 'Access Denied');
      }
      
      return React.createElement(PageComponent, props);
    };
    
    // Copy display name for debugging
    WrappedComponent.displayName = `RejectRolePage(${PageComponent.displayName || PageComponent.name})`;
    
    return WrappedComponent;
  };
}
