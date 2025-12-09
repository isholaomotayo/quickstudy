"use client";

import { Suspense } from "react";
import { useApp } from "@/contexts/AppContext";
import { usePermissions } from "@/hooks/usePermissions";
import { ManageGuard } from "@/components/auth/ManageGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  Users,
  CheckSquare,
  UserPlus,
  GraduationCap,
  BarChart3,
  ClipboardList,
} from "lucide-react";

// Import manage dashboard components
import ManageOverview from "./components/ManageOverview";
import MyCoursesManagement from "./components/MyCoursesManagement";
import MyStudentsManagement from "./components/MyStudentsManagement";
import CourseResultsManagement from "./components/CourseResultsManagement";
import ProgrammeResultsManagement from "./components/ProgrammeResultsManagement";
import StaffAssignmentManagement from "./components/StaffAssignmentManagement";
import CourseApprovalManagement from "./components/CourseApprovalManagement";
import ProgrammeCoursesManagement from "./components/ProgrammeCoursesManagement";

function ManageDashboardContent() {
  const { userData, isLoading } = useApp();
  const { can, userRole } = usePermissions();

  // Helper functions to determine user roles
  const isProgrammeCoordinator = () => userRole === "PROGRAMME_COORDINATOR";
  const isProgrammeExamOfficer = () => userRole === "PROGRAMME_EXAM_OFFICER";
  const isFacilitator = () => userRole === "FACILITATOR";
  const isETutor = () => userRole === "ETUTOR";
  const isHOD = () => userRole === "HOD";

  const isCoordinator = isProgrammeCoordinator();
  const isExamOfficer = isProgrammeExamOfficer();
  const isFacilitatorRole = isFacilitator();
  const isETutorRole = isETutor();
  const isHODRole = isHOD();

  // Determine dashboard title based on role
  const getDashboardTitle = () => {
    if (isCoordinator) return "Programme Coordinator Dashboard";
    if (isExamOfficer) return "Programme Exam Officer Dashboard";
    if (isHODRole) return "HOD Management Dashboard";
    if (isFacilitatorRole) return "Facilitator Dashboard";
    if (isETutorRole) return "E-Tutor Dashboard";
    return "Management Dashboard";
  };

  const getDashboardDescription = () => {
    if (isCoordinator) return "Manage your programme, courses, and staff";
    if (isExamOfficer) return "Manage programme results and examinations";
    if (isHODRole) return "Manage department courses and results";
    if (isFacilitatorRole || isETutorRole) return "Manage your assigned courses and students";
    return "Manage your assigned responsibilities";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            No User Data
          </h2>
          <p className="text-gray-500">
            Please log in to access the management dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white shadow-sm">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight mb-1">
                {getDashboardTitle()}
              </h2>
              <p className="text-indigo-100 text-sm">
                {getDashboardDescription()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge
                variant="secondary"
                className="bg-white/10 text-white border-white/20 px-2 py-1 text-xs"
              >
                {userData.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg flex-wrap h-auto">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>

          {/* My Courses - For all roles except PROGRAMME_EXAM_OFFICER */}
          {can.viewManagedCourses() && (
            <TabsTrigger
              value="my-courses"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              My Courses
            </TabsTrigger>
          )}

          {/* Programme Courses - For PROGRAMME_COORDINATOR only */}
          {isCoordinator && can.createCourses() && (
            <TabsTrigger
              value="programme-courses"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Programme Courses
            </TabsTrigger>
          )}

          {/* My Students - For all roles */}
          {can.viewManagedStudents() && (
            <TabsTrigger
              value="my-students"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              My Students
            </TabsTrigger>
          )}

          {/* Course Approvals - For roles that can approve courses */}
          {can.approveManagedCourses() && (
            <TabsTrigger
              value="approvals"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Course Approvals
            </TabsTrigger>
          )}

          {/* Results Management - For all roles */}
          {can.viewManagedResults() && (
            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
          )}

          {/* Staff Assignment - For PROGRAMME_COORDINATOR only */}
          {can.assignStaffToCourses() && (
            <TabsTrigger
              value="staff-assignment"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Staff Assignment
            </TabsTrigger>
          )}
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<LoadingCard />}>
            <ManageOverview />
          </Suspense>
        </TabsContent>

        {can.viewManagedCourses() && (
          <TabsContent value="my-courses" className="space-y-4">
            <Suspense fallback={<LoadingCard />}>
              <MyCoursesManagement />
            </Suspense>
          </TabsContent>
        )}

        {isCoordinator && can.createCourses() && (
          <TabsContent value="programme-courses" className="space-y-4">
            <Suspense fallback={<LoadingCard />}>
              <ProgrammeCoursesManagement />
            </Suspense>
          </TabsContent>
        )}

        {can.viewManagedStudents() && (
          <TabsContent value="my-students" className="space-y-4">
            <Suspense fallback={<LoadingCard />}>
              <MyStudentsManagement />
            </Suspense>
          </TabsContent>
        )}

        {can.approveManagedCourses() && (
          <TabsContent value="approvals" className="space-y-4">
            <Suspense fallback={<LoadingCard />}>
              <CourseApprovalManagement />
            </Suspense>
          </TabsContent>
        )}

        {can.viewManagedResults() && (
          <TabsContent value="results" className="space-y-4">
            <Suspense fallback={<LoadingCard />}>
              {isCoordinator || isExamOfficer || isHODRole ? (
                <ProgrammeResultsManagement />
              ) : (
                <CourseResultsManagement />
              )}
            </Suspense>
          </TabsContent>
        )}

        {can.assignStaffToCourses() && (
          <TabsContent value="staff-assignment" className="space-y-4">
            <Suspense fallback={<LoadingCard />}>
              <StaffAssignmentManagement />
            </Suspense>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function LoadingCard() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ManagePage() {
  return (
    <ManageGuard>
      <ManageDashboardContent />
    </ManageGuard>
  );
}
