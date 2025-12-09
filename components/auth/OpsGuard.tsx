/**
 * Ops Dashboard Guard Component
 * 
 * Protects ops dashboard routes and prevents rendering for unauthorized users
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft, Users, BookOpen, Settings } from "lucide-react";

interface OpsGuardProps {
  children: React.ReactNode;
  requiredRoute?: string;
  fallback?: React.ReactNode;
}

/**
 * Unauthorized access fallback component
 */
function UnauthorizedFallback({ userRole }: { userRole?: string }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-900">
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            You don't have permission to access the operations dashboard.
          </p>
          
          {userRole && (
            <p className="text-sm text-gray-500">
              Current role: <span className="font-medium">{userRole}</span>
            </p>
          )}
          
          <div className="border-t pt-4 text-sm text-gray-500">
            <p className="mb-2">Operations dashboard requires one of these roles:</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {["SUPERADMIN", "ADMIN", "PROGRAMME_COORDINATOR", "HOD", "FACILITATOR", "ETUTOR", "STAFF", "LECTURER"].map((role) => (
                <span key={role} className="px-2 py-1 bg-gray-100 rounded text-xs">
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <Button 
              onClick={() => router.back()} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            
            <Button 
              onClick={() => router.push("/dashboard")} 
              className="w-full"
            >
              Go to Main Dashboard
            </Button>
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
 * Main guard component for ops dashboard
 */
export function OpsGuard({ children, requiredRoute, fallback }: OpsGuardProps) {
  const { userData, isLoading: userDataLoading } = useApp();
  const { canAccessRoute, userRole } = usePermissions();

  // Show loading state while checking authentication
  if (userDataLoading || !userData) {
    return <LoadingFallback />;
  }

  // Check if user can access ops dashboard in general
  const hasOpsAccess = canAccessRoute("/ops");
  
  // If a specific route is specified, check that too
  const hasSpecificRouteAccess = requiredRoute ? canAccessRoute(requiredRoute) : true;

  // If user doesn't have access, show unauthorized fallback
  if (!hasOpsAccess || !hasSpecificRouteAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <UnauthorizedFallback userRole={userRole || undefined} />;
  }

  // User has access, render the protected content
  return <>{children}</>;
}

/**
 * Convenience guards for specific ops sections
 */

export function UserManagementGuard({ children }: { children: React.ReactNode }) {
  return (
    <OpsGuard requiredRoute="/ops/users">
      {children}
    </OpsGuard>
  );
}

export function FinancialGuard({ children }: { children: React.ReactNode }) {
  return (
    <OpsGuard requiredRoute="/ops/financial">
      {children}
    </OpsGuard>
  );
}

export function CourseManagementGuard({ children }: { children: React.ReactNode }) {
  return (
    <OpsGuard requiredRoute="/ops/courses">
      {children}
    </OpsGuard>
  );
}

export function AcademicGuard({ children }: { children: React.ReactNode }) {
  return (
    <OpsGuard requiredRoute="/ops/academic">
      {children}
    </OpsGuard>
  );
}

export function SettingsGuard({ children }: { children: React.ReactNode }) {
  return (
    <OpsGuard requiredRoute="/ops/settings">
      {children}
    </OpsGuard>
  );
}