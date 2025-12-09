"use client";

import { useApp } from "@/contexts/AppContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ClipboardCheck,
  Activity,
} from "lucide-react";
import useSWR from "swr";

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ManageOverview() {
  const { userData } = useApp();
  const { userRole } = usePermissions();

  // Fetch overview data from API
  const { data, error, isLoading } = useSWR(
    userData ? `/api/manage/overview` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  const overviewData = data?.data;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load overview data. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Role-specific stats rendering
  const isProgrammeCoordinator = userRole === "PROGRAMME_COORDINATOR";
  const isProgrammeExamOfficer = userRole === "PROGRAMME_EXAM_OFFICER";
  const isFacilitatorOrETutor = userRole === "FACILITATOR" || userRole === "ETUTOR";
  const isHOD = userRole === "HOD";

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Courses Card - Not shown for PROGRAMME_EXAM_OFFICER */}
        {!isProgrammeExamOfficer && (
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-900">
                {isProgrammeCoordinator || isHOD ? "Total Courses" : "My Courses"}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-blue-900">
                {overviewData?.coursesCount?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-blue-700">
                {isProgrammeCoordinator || isHOD
                  ? `${overviewData?.activeCourses || 0} active`
                  : `${overviewData?.assignedCourses || 0} assigned`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Students Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-green-900">
              {isProgrammeCoordinator || isProgrammeExamOfficer || isHOD
                ? "Total Students"
                : "My Students"}
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-green-900">
              {overviewData?.studentsCount?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-green-700">
              {isProgrammeCoordinator || isHOD
                ? `In ${overviewData?.programmeName || "programme"}`
                : `${overviewData?.activeStudents || 0} active`}
            </p>
          </CardContent>
        </Card>

        {/* Pending Approvals - Only for roles that can approve */}
        {(isProgrammeCoordinator || isFacilitatorOrETutor || isHOD) && (
          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-amber-900">
                Pending Approvals
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-amber-900">
                {overviewData?.pendingApprovals?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-amber-700">
                Course registrations
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results/Grades Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-purple-900">
              {isProgrammeExamOfficer ? "Pending Results" : "Results Entered"}
            </CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-purple-900">
              {isProgrammeExamOfficer
                ? overviewData?.pendingResults?.toLocaleString() || "0"
                : overviewData?.resultsEntered?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-purple-700">
              {isProgrammeExamOfficer
                ? "Awaiting approval"
                : `${overviewData?.totalResults || 0} total`}
            </p>
          </CardContent>
        </Card>

        {/* Staff Assigned - For PROGRAMME_COORDINATOR only */}
        {isProgrammeCoordinator && (
          <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-50 to-teal-100 border-cyan-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-cyan-900">
                Staff Assigned
              </CardTitle>
              <Users className="h-4 w-4 text-cyan-600" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-cyan-900">
                {overviewData?.staffCount?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-cyan-700">
                Facilitators & eTutors
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overviewData?.recentActivity && overviewData.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {overviewData.recentActivity.map((activity: any, index: number) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {activity.type === "approval" && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {activity.type === "result" && (
                      <FileText className="h-5 w-5 text-blue-600" />
                    )}
                    {activity.type === "assignment" && (
                      <Users className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">{activity.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-400">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - Role-specific */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {!isProgrammeExamOfficer && (
              <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium">View My Courses</span>
              </button>
            )}

            <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">View My Students</span>
            </button>

            {(isProgrammeCoordinator || isFacilitatorOrETutor || isHOD) && (
              <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-all">
                <CheckCircle className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-medium">Approve Registrations</span>
              </button>
            )}

            <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all">
              <FileText className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Enter Results</span>
            </button>

            {isProgrammeCoordinator && (
              <>
                <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-cyan-500 hover:bg-cyan-50 transition-all">
                  <Users className="h-5 w-5 text-cyan-600" />
                  <span className="text-sm font-medium">Assign Staff</span>
                </button>
                <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition-all">
                  <BookOpen className="h-5 w-5 text-teal-600" />
                  <span className="text-sm font-medium">Manage Programme Courses</span>
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
