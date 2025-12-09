import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UserRole, hasAnyRole, ROLE_GROUPS } from "./roles";
import { Permission, hasPermission, canAccessAPI } from "./permissions-config";
import crypto from "crypto";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  institution_id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  programme_id?: number;
  department_id?: number;
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  statusCode?: number;
}

/**
 * Secret for signing/verifying data (using your JWTSECRET from .env)
 */
const AUTH_SECRET = process.env.JWTSECRET || "fallback-secret-key";

/**
 * Create HMAC signature for data integrity
 */
function createSignature(data: string): string {
  return crypto.createHmac("sha256", AUTH_SECRET).update(data).digest("hex");
}

/**
 * Verify data integrity using HMAC signature
 */
function verifySignature(data: string, signature: string): boolean {
  const expectedSignature = createSignature(data);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Helper functions for setting secure cookies (for login systems)
 */
export function createSecureCookieData(userData: AuthenticatedUser) {
  const userDataString = JSON.stringify({
    id: userData.id,
    institution_id: userData.institution_id,
    email: userData.email,
    username: userData.username,
    first_name: userData.first_name,
    last_name: userData.last_name,
    programme_id: userData.programme_id,
  });

  const roleString = userData.role;

  return {
    userData: userDataString,
    userSignature: createSignature(userDataString),
    role: roleString,
    roleSignature: createSignature(roleString),
  };
}

/**
 * Get user data from signed cookies (SECURED)
 */
export async function getUserFromSecureCookies(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const userData = cookieStore.get("userData")?.value;
    const userSignature = cookieStore.get("userSignature")?.value;
    const role = cookieStore.get("role")?.value;
    const roleSignature = cookieStore.get("roleSignature")?.value;

    if (!userData || !role || !userSignature || !roleSignature) {
      return null;
    }

    // Verify signatures to ensure data hasn't been tampered with
    if (
      !verifySignature(userData, userSignature) ||
      !verifySignature(role, roleSignature)
    ) {
      console.warn(
        "Cookie signature verification failed - possible tampering detected"
      );
      return null;
    }

    const parsedUserData = JSON.parse(userData);
    return {
      ...parsedUserData,
      role: role as UserRole,
    };
  } catch (error) {
    console.error("Error getting user from secure cookies:", error);
    return null;
  }
}

/**
 * Get user data from cookies (LEGACY - for backward compatibility)
 * This will try secure cookies first, then fall back to unsigned cookies
 */
export async function getUserFromCookies(): Promise<AuthenticatedUser | null> {
  try {
    // First try to get from secure cookies
    const secureUser = await getUserFromSecureCookies();
    if (secureUser) {
      return secureUser;
    }

    // Fallback to legacy unsigned cookies
    const cookieStore = await cookies();
    const userData = cookieStore.get("userData")?.value;
    const role = cookieStore.get("role")?.value;

    if (!userData || !role) {
      return null;
    }

    const parsedUserData = JSON.parse(userData);
    return {
      ...parsedUserData,
      role: role as UserRole,
    };
  } catch (error) {
    console.error("Error getting user from cookies:", error);
    return null;
  }
}

/**
 * Get user data with signature validation (SECURE without DB)
 */
export async function getUserWithValidation(): Promise<AuthenticatedUser | null> {
  try {
    // Use the secure cookie method that validates signatures
    return await getUserFromCookies();
  } catch (error) {
    console.error("Error validating user:", error);
    return null;
  }
}

/**
 * Check if development mode authentication bypass is enabled
 */
export function isDevelopmentAuthBypassEnabled(): boolean {
  const isDevelopment = process.env.NODE_ENV === "development";
  const authDisabled = process.env.DISABLE_API_AUTH === "true";
  return isDevelopment && authDisabled;
}

/**
 * Authenticate user for API routes (new permission-based system)
 */
export async function authenticateUserWithPermissions(
  requiredPermissions?: Permission[]
): Promise<AuthResult> {
  // Check if development bypass is enabled
  if (isDevelopmentAuthBypassEnabled()) {
    console.warn("⚠️ API authentication bypassed in development mode");
    return {
      success: true,
      user: {
        id: "dev-user",
        role: "SUPERADMIN",
        institution_id: 1,
        email: "dev@example.com",
        username: "dev",
        first_name: "Development",
        last_name: "User",
      },
    };
  }

  // Get user with signature validation (secure without DB)
  const user = await getUserWithValidation();

  if (!user) {
    return {
      success: false,
      error: "Authentication required",
      statusCode: 401,
    };
  }

  // Check permission requirements using centralized system
  if (requiredPermissions) {
    for (const permission of requiredPermissions) {
      if (!hasPermission(user.role, permission)) {
        return {
          success: false,
          error: `Missing permission: ${permission}`,
          statusCode: 403,
        };
      }
    }
  }

  return {
    success: true,
    user,
  };
}

/**
 * Authenticate user for API routes (legacy system - maintained for backward compatibility)
 */
export async function authenticateUser(
  requiredRoles?: UserRole[],
  requiredPermissions?: string[]
): Promise<AuthResult> {
  // Check if development bypass is enabled
  if (isDevelopmentAuthBypassEnabled()) {
    console.warn("⚠️ API authentication bypassed in development mode");
    return {
      success: true,
      user: {
        id: "dev-user",
        role: "SUPERADMIN",
        institution_id: 1,
        email: "dev@example.com",
        username: "dev",
        first_name: "Development",
        last_name: "User",
      },
    };
  }

  // Get user with validation
  const user = await getUserWithValidation();

  if (!user) {
    return {
      success: false,
      error: "Authentication required",
      statusCode: 401,
    };
  }

  // Check role requirements
  if (requiredRoles && !hasAnyRole(user.role, requiredRoles)) {
    return {
      success: false,
      error: "Insufficient permissions",
      statusCode: 403,
    };
  }

  // Check permission requirements
  if (requiredPermissions) {
    for (const permission of requiredPermissions) {
      if (!checkPermission(user.role, permission)) {
        return {
          success: false,
          error: `Missing permission: ${permission}`,
          statusCode: 403,
        };
      }
    }
  }

  return {
    success: true,
    user,
  };
}

/**
 * Check specific permissions using centralized permission system
 */
export function checkPermission(
  userRole: UserRole,
  permission: string
): boolean {
  // Import the centralized permission checker
  const { checkPermission: centralizedCheck } = require("./permissions-config");
  return centralizedCheck(userRole, permission);
}

/**
 * Create authentication error response
 */
export function createAuthErrorResponse(
  error: string,
  statusCode: number = 401
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      message: error,
    },
    { status: statusCode }
  );
}

/**
 * Convert BigInt values to strings for JSON serialization
 * Also converts Date objects to ISO strings
 */
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  // Handle Date objects - convert to ISO string
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle Prisma Decimal objects - they have toNumber() method
  if (obj && typeof obj === "object" && typeof obj.toNumber === "function") {
    return obj.toNumber();
  }

  // Handle Prisma Decimal objects - alternative check for {s, e, d} structure
  if (
    obj &&
    typeof obj === "object" &&
    "s" in obj &&
    "e" in obj &&
    "d" in obj &&
    !Array.isArray(obj)
  ) {
    // This is a Prisma Decimal - convert to number or string
    return Number(obj.toString?.() || obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }

  if (typeof obj === "object") {
    const serialized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        serialized[key] = serializeBigInt(obj[key]);
      }
    }
    return serialized;
  }

  return obj;
}

/**
 * Create a JSON response with BigInt serialization (returns data directly without wrapper)
 * Use this for endpoints that should return data directly to match Fastify behavior
 */
export function createJsonResponse(data: any): NextResponse {
  const serializedData = serializeBigInt(data);
  return NextResponse.json(serializedData);
}

/**
 * Create success response with user data
 */
export function createSuccessResponse(
  data: any,
  user?: AuthenticatedUser
): NextResponse {
  // Serialize BigInt values before creating response
  const serializedData = serializeBigInt(data);

  return NextResponse.json({
    success: true,
    data: serializedData,
    user: user
      ? {
          id: user.id,
          role: user.role,
          institution_id: user.institution_id,
        }
      : undefined,
  });
}

/**
 * Auto-detect API route permissions and authenticate (recommended approach)
 */
export async function protectApiRouteAuto(
  request: NextRequest
): Promise<{ user: AuthenticatedUser }> {
  // Check if development bypass is enabled
  if (isDevelopmentAuthBypassEnabled()) {
    console.warn("⚠️ API authentication bypassed in development mode");
    return {
      user: {
        id: "dev-user",
        role: "SUPERADMIN",
        institution_id: 1,
        email: "dev@example.com",
        username: "dev",
        first_name: "Development",
        last_name: "User",
      },
    };
  }

  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname;

  // Get user with signature validation (secure without DB)
  const user = await getUserWithValidation();
  if (!user) {
    throw createAuthErrorResponse("Authentication required", 401);
  }

  // Check permissions using centralized system
  if (!canAccessAPI(user.role, method, path)) {
    throw createAuthErrorResponse("Insufficient permissions", 403);
  }

  return { user };
}

/**
 * Middleware helper for API route protection (new permission-based system)
 */
export async function protectApiRouteWithPermissions(
  _request: NextRequest,
  requiredPermissions?: Permission[]
): Promise<{ user: AuthenticatedUser }> {
  const authResult = await authenticateUserWithPermissions(requiredPermissions);

  if (!authResult.success) {
    throw createAuthErrorResponse(authResult.error!, authResult.statusCode!);
  }

  return { user: authResult.user! };
}

/**
 * Middleware helper for API route protection (legacy system)
 */
export async function protectApiRoute(
  _request: NextRequest,
  requiredRoles?: UserRole[],
  requiredPermissions?: string[]
): Promise<{ user: AuthenticatedUser; response?: NextResponse }> {
  const authResult = await authenticateUser(requiredRoles, requiredPermissions);

  if (!authResult.success) {
    throw createAuthErrorResponse(authResult.error!, authResult.statusCode!);
  }

  return { user: authResult.user! };
}

/**
 * Check if user has access to specific institution data
 */
export function hasInstitutionAccess(
  user: AuthenticatedUser,
  institutionId: number
): boolean {
  // SUPERADMIN can access all institutions
  if (user.role === "SUPERADMIN") {
    return true;
  }

  // Other roles can only access their own institution
  return user.institution_id === institutionId;
}

/**
 * Check if user has access to specific programme data
 */
export function hasProgrammeAccess(
  user: AuthenticatedUser,
  programmeId: number
): boolean {
  // SUPERADMIN and ADMIN can access all programmes
  if (hasAnyRole(user.role, [...ROLE_GROUPS.ADMINISTRATORS])) {
    return true;
  }

  // Programme coordinators can only access their own programme
  if (user.role === "PROGRAMME_COORDINATOR") {
    return user.programme_id === programmeId;
  }

  // Other roles have no programme access
  return false;
}
