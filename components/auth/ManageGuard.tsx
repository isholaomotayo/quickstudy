/**
 * Manage Dashboard Guard Component
 *
 * Protects manage dashboard routes for sub-admin roles only
 * Prevents SUPERADMIN and ADMIN from accessing (they should use /ops)
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft, Settings } from "lucide-react";

interface ManageGuardProps {
  children: React.ReactNode;
  requiredRoute?: string;
  fallback?: React.ReactNode;
}

/**
 * Unauthorized access fallback component
 */
function UnauthorizedFallback({ userRole }: { userRole?: string }) {
  const router = useRouter();

  // If user is admin/superadmin, redirect them to /ops
  const isAdminRole = userRole === "SUPERADMIN" || userRole === "ADMIN" || userRole === "SYSADMIN";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-xl text-orange-900">
            {isAdminRole ? "Wrong Dashboard" : "Access Restricted"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {isAdminRole ? (
            <>
              <p className="text-gray-600">
                This dashboard is for sub-admin roles. Please use the Operations Dashboard instead.
              </p>
              <Button
                onClick={() => router.push("/ops")}
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Go to Operations Dashboard
              </Button>
            </>
          ) : (
            <>
              <p className="text-gray-600">
                You don't have permission to access the management dashboard.
              </p>

              {userRole && (
                <p className="text-sm text-gray-500">
                  Current role: <span className="font-medium">{userRole}</span>
                </p>
              )}

              <div className="border-t pt-4 text-sm text-gray-500">
                <p className="mb-2">Management dashboard requires one of these roles:</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {["PROGRAMME_COORDINATOR", "PROGRAMME_EXAM_OFFICER", "HOD", "FACILITATOR", "ETUTOR"].map((role) => (
                    <span key={role} className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="pt-4 space-y-2">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>

            {!isAdminRole && (
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                Go to Main Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Main guard component for manage dashboard
 */
export function ManageGuard({ children, requiredRoute, fallback }: ManageGuardProps) {
  const { userData, isLoading: userDataLoading } = useApp();
  const { canAccessRoute, userRole } = usePermissions();

  // Show loading state while checking authentication
  if (userDataLoading || !userData) {
    return <LoadingFallback />;
  }

  // Check if user can access manage dashboard in general
  const hasManageAccess = canAccessRoute("/manage");

  // Block ADMIN and SUPERADMIN from accessing /manage
  const isAdminRole = userRole === "SUPERADMIN" || userRole === "ADMIN" || userRole === "SYSADMIN";

  // If a specific route is specified, check that too
  const hasSpecificRouteAccess = requiredRoute ? canAccessRoute(requiredRoute) : true;

  // If user doesn't have access or is admin role, show unauthorized fallback
  if (!hasManageAccess || isAdminRole || !hasSpecificRouteAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <UnauthorizedFallback userRole={userRole || undefined} />;
  }

  // User has access, render the protected content
  return <>{children}</>;
}

/**
 * Convenience guards for specific manage sections
 */

export function StaffAssignmentGuard({ children }: { children: React.ReactNode }) {
  return (
    <ManageGuard requiredRoute="/manage/staff-assignment">
      {children}
    </ManageGuard>
  );
}

export function ProgrammeManagementGuard({ children }: { children: React.ReactNode }) {
  return (
    <ManageGuard requiredRoute="/manage/programme">
      {children}
    </ManageGuard>
  );
}

export function CourseContentGuard({ children }: { children: React.ReactNode }) {
  return (
    <ManageGuard requiredRoute="/manage/courses">
      {children}
    </ManageGuard>
  );
}

export function ResultsGuard({ children }: { children: React.ReactNode }) {
  return (
    <ManageGuard requiredRoute="/manage/results">
      {children}
    </ManageGuard>
  );
}
