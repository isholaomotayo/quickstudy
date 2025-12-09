"use client";

import { Suspense } from "react";
import { useApp } from "@/contexts/AppContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useOverviewData } from "@/hooks/useDashboardData";
import { OpsGuard } from "@/components/auth/OpsGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  DollarSign,
  FileText,
  TrendingUp,
  Activity,
  Settings,
  BarChart3,
  Calendar,
  GraduationCap,
  CreditCard,
  Building2,
  Clock,
} from "lucide-react";

function formatCurrency(amount?: number | null) {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

// Import dashboard components
import AdminOverview from "./components/AdminOverview";
import StaffOverview from "./components/StaffOverview";
import UserManagement from "./components/UserManagement";
import CourseManagement from "./components/CourseManagement";
import ApplicationManagement from "./components/ApplicationManagement";

import DepartmentManagement from "./components/DepartmentManagement";
import PaymentsManagement from "./components/PaymentsManagement";
import ResultsManagement from "./components/ResultsManagement";
import AcademicManagement from "./components/AcademicManagement";
import ReportsAnalytics from "./components/ReportsAnalytics";
import SettingsConfiguration from "./components/SettingsConfiguration";
import CourseApprovalManagement from "./components/CourseApprovalManagement";

function AdminDashboardContent() {
  const { userData, isLoading } = useApp();
  const { can } = usePermissions();
  const {
    data: dashboardData,
    isLoading: dataLoading,
    error: dataError,
  } = useOverviewData(userData?.institution_id);

  // Helper functions to determine user roles
  const isAdmin = () =>
    userData?.role === "ADMIN" || userData?.role === "SUPERADMIN";
  const isStaff = () =>
    userData?.role === "STAFF" || userData?.role === "LECTURER";
  const isHOD = () => userData?.role === "HOD";
  const isStudent = () => userData?.role === "STUDENT";

  const isAdminUser = isAdmin();
  const isStaffUser = isStaff();
  const isHODUser = isHOD();
  const isStudentUser = isStudent();

  if (isLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{dataError}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
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
            Please log in to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Student: show minimal student dashboard, no admin/staff tabs
  if (isStudentUser) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight mb-1">
                  Student Dashboard
                </h2>
                <p className="text-blue-100 text-sm">
                  Welcome to your academic portal
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-900">
                My Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-blue-900">
                {dashboardData?.studentStats?.myCourses?.toLocaleString?.() ||
                  "0"}
              </div>
              <p className="text-xs text-blue-700">Registered</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-amber-900">
                Pending Results
              </CardTitle>
              <FileText className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-amber-900">
                {dashboardData?.studentStats?.pendingResults?.toLocaleString?.() ||
                  "0"}
              </div>
              <p className="text-xs text-amber-700">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-green-900">
                Completed
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-green-900">
                {dashboardData?.studentStats?.completedCourses?.toLocaleString?.() ||
                  "0"}
              </div>
              <p className="text-xs text-green-700">Course completion</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 p-4 text-white shadow-sm">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight mb-1">
                {isAdminUser
                  ? "Admin Dashboard"
                  : isHODUser
                  ? "HOD Dashboard"
                  : "Staff Dashboard"}
              </h2>
              <p className="text-slate-300 text-sm">
                Welcome to your institution management portal
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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-blue-900">
              {isAdminUser || isHODUser ? "Total Users" : "My Students"}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-blue-900">
              {isAdminUser || isHODUser
                ? dashboardData?.dashboardStats?.totalUsers?.toLocaleString() ||
                  "0"
                : dashboardData?.staffStats?.totalStudents?.toLocaleString() ||
                  "0"}
            </div>
            <p className="text-xs text-blue-700">
              {isAdminUser || isHODUser
                ? `+${
                    dashboardData?.userStats?.newUsersThisMonth || 0
                  } this month`
                : `+${dashboardData?.staffStats?.totalStudents || 0} enrolled`}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-green-900">
              {isAdminUser || isHODUser ? " Courses" : "My Courses"}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-green-900">
              {isAdminUser || isHODUser
                ? dashboardData?.dashboardStats?.totalCourses?.toLocaleString() ||
                  "0"
                : dashboardData?.staffStats?.assignedCourses?.toLocaleString() ||
                  "0"}
            </div>
            <p className="text-xs text-green-700">
              {isAdminUser || isHODUser
                ? `${
                    dashboardData?.courseStats?.activeCourses || 0
                  } active courses`
                : `${dashboardData?.staffStats?.assignedCourses || 0} assigned`}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-amber-900">
              {isAdminUser ? "Revenue" : "Pending Grades"}
            </CardTitle>
            {isAdminUser ? (
              <DollarSign className="h-4 w-4 text-amber-600" />
            ) : (
              <FileText className="h-4 w-4 text-amber-600" />
            )}
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-amber-900">
              {isAdminUser ? (
                formatCurrency(dashboardData?.financialStats?.totalRevenue)
              ) : (
                <>
                  {dashboardData?.staffStats?.pendingGrades?.toLocaleString() ||
                    "0"}
                </>
              )}
            </div>
            <p className="text-xs text-amber-700">
              {isAdminUser ? (
                <>
                  +
                  {formatCurrency(
                    dashboardData?.financialStats?.monthlyRevenue
                  )}{" "}
                  this month
                </>
              ) : (
                "Need attention"
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-purple-900">
              {isAdminUser || isHODUser
                ? "Total Applications"
                : "Course Completion"}
            </CardTitle>
            {isAdminUser || isHODUser ? (
              <Activity className="h-4 w-4 text-purple-600" />
            ) : (
              <TrendingUp className="h-4 w-4 text-purple-600" />
            )}
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-purple-900">
              {isAdminUser || isHODUser
                ? dashboardData?.dashboardStats?.totalApplications?.toLocaleString() ||
                  "0"
                : `${
                    dashboardData?.staffStats?.courseCompletion?.toFixed(1) ||
                    "0"
                  }%`}
            </div>
            <p className="text-xs text-purple-700">
              {isAdminUser || isHODUser
                ? "Total applications"
                : "Completion rate"}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-100 border-red-200 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-red-900">
              {isAdminUser || isHODUser ? "Pending Approvals" : "My Progress"}
            </CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-red-900">
              {isAdminUser || isHODUser
                ? dashboardData?.dashboardStats?.pendingCourseApprovals?.toLocaleString() ||
                  "0"
                : `${
                    dashboardData?.staffStats?.courseCompletion?.toFixed(1) ||
                    "0"
                  }%`}
            </div>
            <p className="text-xs text-red-700">
              {isAdminUser || isHODUser
                ? "Course approvals needed"
                : "Completion rate"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          {(isAdminUser || isHODUser) && (
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
            >
              Users
            </TabsTrigger>
          )}
          {(isAdminUser || isHODUser) && (
            <TabsTrigger
              value="courses"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white"
            >
              Courses
            </TabsTrigger>
          )}
          {(isAdminUser || isHODUser) && (
            <TabsTrigger
              value="applications"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
            >
              Applications
            </TabsTrigger>
          )}
          {can.approveCourses() && (
            <TabsTrigger
              value="course-approvals"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              Course Approvals
            </TabsTrigger>
          )}

          {(isAdminUser || isHODUser) && (
            <TabsTrigger
              value="departments"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              Departments
            </TabsTrigger>
          )}
          {isAdminUser && (
            <TabsTrigger
              value="payments"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
            >
              Payments
            </TabsTrigger>
          )}
          {(isAdminUser || isHODUser) && (
            <TabsTrigger
              value="academic"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              Academic
            </TabsTrigger>
          )}
          {(isAdminUser || isHODUser || isStaffUser) && (
            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
            >
              Results
            </TabsTrigger>
          )}
          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            Reports
          </TabsTrigger>
          {isAdminUser && (
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {isAdminUser || isHODUser ? <AdminOverview /> : <StaffOverview />}
        </TabsContent>

        {(isAdminUser || isHODUser) && (
          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>
        )}

        {(isAdminUser || isHODUser) && (
          <TabsContent value="courses" className="space-y-4">
            <CourseManagement />
          </TabsContent>
        )}

        {(isAdminUser || isHODUser) && (
          <TabsContent value="applications" className="space-y-4">
            <ApplicationManagement />
          </TabsContent>
        )}

        {can.approveCourses() && (
          <TabsContent value="course-approvals" className="space-y-4">
            <CourseApprovalManagement />
          </TabsContent>
        )}

        {(isAdminUser || isHODUser) && (
          <TabsContent value="departments" className="space-y-4">
            <DepartmentManagement />
          </TabsContent>
        )}

        {isAdminUser && (
          <TabsContent value="payments" className="space-y-4">
            <PaymentsManagement />
          </TabsContent>
        )}

        {(isAdminUser || isHODUser) && (
          <TabsContent value="academic" className="space-y-4">
            <AcademicManagement />
          </TabsContent>
        )}

        {(isAdminUser || isHODUser || isStaffUser) && (
          <TabsContent value="results" className="space-y-4">
            <ResultsManagement />
          </TabsContent>
        )}

        <TabsContent value="reports" className="space-y-4">
          <ReportsAnalytics />
        </TabsContent>

        {isAdminUser && (
          <TabsContent value="settings" className="space-y-4">
            <SettingsConfiguration />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <OpsGuard>
      <AdminDashboardContent />
    </OpsGuard>
  );
}
