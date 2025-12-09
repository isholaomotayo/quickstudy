import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole, canAccess, isRejectedRole } from "./lib/roles";

// Route protection configuration
interface RouteProtection {
  path: string;
  allowedRoles?: UserRole[];
  rejectedRoles?: UserRole[];
  redirectTo?: string;
}

// Define protected routes
const PROTECTED_ROUTES: RouteProtection[] = [
  // Admin routes
  {
    path: "/admin",
    allowedRoles: ["SUPERADMIN", "ADMIN"],
    redirectTo: "/signin?logout=1",
  },
  {
    path: "/admin/",
    allowedRoles: ["SUPERADMIN", "ADMIN"],
    redirectTo: "/signin?logout=1",
  },

  // Staff routes
  {
    path: "/staff",
    allowedRoles: ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "LECTURER"],
    redirectTo: "/signin?logout=1",
  },
  {
    path: "/staff/",
    allowedRoles: ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "LECTURER"],
    redirectTo: "/signin?logout=1",
  },

  // Student routes
  {
    path: "/students",
    allowedRoles: ["STUDENT"],
    redirectTo: "/signin?logout=1",
  },
  {
    path: "/students/",
    allowedRoles: ["STUDENT"],
    redirectTo: "/signin?logout=1",
  },

  // Assignment routes - reject students
  {
    path: "/assignments",
    rejectedRoles: ["STUDENT"],
    redirectTo: "/signin?logout=1",
  },
  {
    path: "/assignments/",
    rejectedRoles: ["STUDENT"],
    redirectTo: "/signin?logout=1",
  },

  // Applicant routes

  {
    path: "/apply/start",
    allowedRoles: ["APPLICANT"],
    redirectTo: "/signin?logout=1",
  },

  // Affiliate routes
  {
    path: "/affiliate",
    allowedRoles: ["AFFILIATE"],
    redirectTo: "/signin?logout=1",
  },
  {
    path: "/affiliate/",
    allowedRoles: ["AFFILIATE"],
    redirectTo: "/signin?logout=1",
  },

  // Ops dashboard - Admin only, redirect sub-admins to /manage
  {
    path: "/ops",
    allowedRoles: ["SUPERADMIN", "ADMIN", "SYSADMIN"],
    redirectTo: "/manage", // Redirect sub-admins to manage dashboard
  },

  // Manage dashboard - Sub-admin roles only, redirect admins to /ops
  {
    path: "/manage",
    allowedRoles: ["PROGRAMME_COORDINATOR", "PROGRAMME_EXAM_OFFICER", "HOD", "FACILITATOR", "ETUTOR"],
    redirectTo: "/ops", // Redirect admins to ops dashboard
  },
];

// Helper function to get user role from cookies
function getUserRoleFromCookies(request: NextRequest): UserRole | null {
  const role = request.cookies.get("role")?.value;
  return (role as UserRole) || null;
}

// Helper function to check if a path matches a protected route
function matchesProtectedRoute(
  pathname: string,
  protection: RouteProtection
): boolean {
  return pathname.startsWith(protection.path);
}

// Helper function to check access for a route
function checkRouteAccess(
  userRole: UserRole | null,
  protection: RouteProtection
): boolean {
  // If role is explicitly rejected, deny access
  if (
    protection.rejectedRoles &&
    isRejectedRole(userRole, protection.rejectedRoles)
  ) {
    return false;
  }

  // If allowed roles are specified, check if user has any of them
  if (protection.allowedRoles) {
    return canAccess(
      userRole,
      protection.allowedRoles,
      protection.rejectedRoles || []
    );
  }

  // If only rejected roles are specified and user is not rejected, allow access
  if (protection.rejectedRoles) {
    return !isRejectedRole(userRole, protection.rejectedRoles);
  }

  // If no restrictions specified, allow access
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  const publicRoutes = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/api/",
    "/_next/",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
  ];

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if the current path matches any protected route
  const matchedProtection = PROTECTED_ROUTES.find((protection) =>
    matchesProtectedRoute(pathname, protection)
  );

  if (matchedProtection) {
    const userRole = getUserRoleFromCookies(request);

    // Check if user has access to this route
    if (!checkRouteAccess(userRole, matchedProtection)) {
      // Redirect to specified redirect URL or default to signin
      const redirectUrl = matchedProtection.redirectTo || "/signin?logout=1";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
