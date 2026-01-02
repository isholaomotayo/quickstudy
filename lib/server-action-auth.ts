/**
 * Utility for authenticating and authorizing Server Actions
 * Extracts common pattern to reduce duplication
 */

import { authenticateUserWithPermissions, type AuthenticatedUser } from "./api-auth";
import { UserRole } from "./roles";

export interface AuthCheckOptions {
  requiredRoles?: UserRole[];
  customCheck?: (user: AuthenticatedUser) => boolean;
  errorMessage?: string;
}

export interface AuthCheckResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

/**
 * Authenticate and optionally check permissions for Server Actions
 * 
 * @param options - Authentication and authorization options
 * @returns AuthCheckResult with user if successful
 */
export async function requireAuth(
  options: AuthCheckOptions = {}
): Promise<AuthCheckResult> {
  const { requiredRoles, customCheck, errorMessage } = options;

  // Authenticate user
  const authResult = await authenticateUserWithPermissions();
  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error || "Authentication required",
    };
  }

  const user = authResult.user!;

  // Check role-based permissions if specified
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(user.role)) {
      return {
        success: false,
        error: errorMessage || "Insufficient permissions",
      };
    }
  }

  // Check custom permission function if specified
  if (customCheck && !customCheck(user)) {
    return {
      success: false,
      error: errorMessage || "Insufficient permissions",
    };
  }

  return {
    success: true,
    user,
  };
}

