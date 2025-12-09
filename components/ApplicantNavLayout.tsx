"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../contexts/AppContext";
import { LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import FutureStudentLanding from "./FutureStudentLanding";
import { Loader2 } from "lucide-react";

interface ApplicantNavLayoutProps {
  children: React.ReactNode;
  institutionName?: string;
  institutionLogo?: string;
}

export default function ApplicantNavLayout({
  children,
  institutionName = "iLearn",
  institutionLogo,
}: ApplicantNavLayoutProps) {
  const router = useRouter();
  const { userData, clearAuthCookies } = useApp();
  const [isFutureStudent, setIsFutureStudent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admittedSession, setAdmittedSession] = useState<{ id: number; name: string; start_date: string } | null>(null);

  useEffect(() => {
    const checkStudentStatus = async () => {
      console.log("🔍 Checking student status...", {
        userData,
        hasStudent: !!userData?.student,
        sessionAdmittedId: userData?.student?.session_admitted_id,
      });

      if (userData?.student?.session_admitted_id) {
        try {
          const [sessionRes, currentSessionRes] = await Promise.all([
            fetch(`/api/dashboard/sessions/${userData.student.session_admitted_id}`),
            fetch(`/api/dashboard/sessions/current`),
          ]);

          if (sessionRes.ok && currentSessionRes.ok) {
            const sessionData = await sessionRes.json();
            const currentSessionData = await currentSessionRes.json();

            console.log("📊 Session comparison:", {
              admittedSession: sessionData.session,
              currentSession: currentSessionData.session,
              isFuture: sessionData.session?.id > currentSessionData.session?.id,
            });

            if (
              sessionData.session &&
              currentSessionData.session &&
              sessionData.session.id > currentSessionData.session.id
            ) {
              setAdmittedSession(sessionData.session);
              setIsFutureStudent(true);
              console.log("✅ Student is admitted to a FUTURE session");
            } else {
              console.log("✅ Student is admitted to current or past session");
            }
          } else {
            console.error("❌ Failed to fetch session data", {
              sessionStatus: sessionRes.status,
              currentSessionStatus: currentSessionRes.status,
            });
          }
        } catch (error) {
          console.error("Error checking student session status:", error);
        }
      } else {
        console.log("ℹ️ No session_admitted_id found for student");
      }
      setIsLoading(false);
    };

    if (userData?.role === "STUDENT") {
      checkStudentStatus();
    } else {
      setIsLoading(false);
    }
  }, [userData]);

  const handleLogout = () => {
    clearAuthCookies();
    router.push("/signin?logout=1");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isFutureStudent && admittedSession) {
    return (
      <FutureStudentLanding
        studentName={userData?.first_name || "Student"}
        admittedSession={admittedSession}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Institution Name */}
            <div className="flex items-center space-x-3">
              {institutionLogo ? (
                <img
                  src={institutionLogo}
                  alt={`${institutionName} Logo`}
                  className="h-8 w-auto"
                />
              ) : (
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {institutionName.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-900">
                  {institutionName}
                </span>
                <span className="text-xs text-gray-500">Application Portal</span>
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              {/* User Info */}
              {userData && (
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>
                    {userData.first_name || userData.username || "Applicant"}
                  </span>
                </div>
              )}

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} {institutionName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}