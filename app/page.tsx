"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/contexts/AppContext";

export default function RootPage() {
  const router = useRouter();
  const { userData, isLoading, refreshUserData } = useApp();
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(false);

  // Helper functions to determine user roles
  const isStudent = useCallback(
    () => userData?.role === "STUDENT",
    [userData?.role]
  );
  const isStaff = useCallback(
    () => userData?.role === "STAFF" || userData?.role === "LECTURER",
    [userData?.role]
  );
  const isAdmin = useCallback(
    () => userData?.role === "ADMIN" || userData?.role === "SUPERADMIN",
    [userData?.role]
  );
  const isApplicant = useCallback(
    () => userData?.role === "APPLICANT",
    [userData?.role]
  );
  const isAffiliate = useCallback(
    () => userData?.role === "AFFILIATE",
    [userData?.role]
  );
  const isHOD = useCallback(() => userData?.role === "HOD", [userData?.role]);

  // Set a timeout to redirect to signin if authentication takes too long
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!userData && !isLoading) {
        console.log("Authentication timeout - redirecting to signin");
        setAuthTimeout(true);
        router.replace("/signin");
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [userData, isLoading, router]);

  useEffect(() => {
    // If we're not loading and userData is null, try to refresh once
    if (!isLoading && !userData && !hasAttemptedRefresh && !authTimeout) {
      console.log("User data is null, attempting to refresh...");
      setHasAttemptedRefresh(true);
      refreshUserData();
    }
  }, [isLoading, userData, hasAttemptedRefresh, refreshUserData, authTimeout]);

  useEffect(() => {
    // Only redirect if we're not loading and have determined the auth state
    if (!isLoading && !authTimeout) {
      if (userData) {
        console.log("User is authenticated, role:", userData.role);
        console.log("User data from AppContext:", userData);

        // User is authenticated, redirect to appropriate dashboard
        if (isStudent()) {
          console.log("Redirecting student to /students");
          router.replace("/students");
        } else if (isStaff()) {
          console.log("Redirecting staff to /staff");
          router.replace("/staff");
        } else if (isAdmin()) {
          console.log("Redirecting admin to /ops");
          router.replace("/ops");
        } else if (isApplicant()) {
          console.log("Redirecting applicant to /applicant");
          router.replace("/apply/start");
        } else if (isAffiliate()) {
          console.log("Redirecting affiliate to /affiliate");
          router.replace("/affiliate");
        } else if (isHOD()) {
          console.log("Redirecting HOD to /admin");
          router.replace("/admin"); // HOD redirects to admin dashboard
        } else {
          // For other roles like DECLINED APPLICANT, DEFERRED, etc.
          console.log("Unknown role, redirecting to /signin");
          router.replace("/signin");
        }
      } else if (hasAttemptedRefresh) {
        // Only redirect to signin after we've attempted to refresh and still have no user data
        console.log(
          "No user data after refresh attempt, redirecting to signin"
        );
        router.replace("/signin");
      }
    }
  }, [
    userData,
    isLoading,
    hasAttemptedRefresh,
    authTimeout,
    router,
    isStudent,
    isStaff,
    isAdmin,
    isApplicant,
    isAffiliate,
    isHOD,
  ]);

  // Show a loading skeleton while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 mx-auto rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
          {hasAttemptedRefresh && !userData && (
            <p className="text-sm text-gray-500">Checking authentication...</p>
          )}
          {authTimeout && (
            <p className="text-sm text-red-500">
              Authentication timeout. Redirecting to login...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
