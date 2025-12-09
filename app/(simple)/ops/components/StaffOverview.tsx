"use client";

import { useApp } from "@/contexts/AppContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  BookOpen,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  GraduationCap,
  BarChart3,
} from "lucide-react";

export default function StaffOverview() {
  const { userData } = useApp();
  const { data: dashboardData, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">...</div>
              <p className="text-xs text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/ops/courses">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                View My Courses
              </Button>
            </Link>
            <Link href="/ops/grades">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                Grade Students
              </Button>
            </Link>
            <Link href="/ops/attendance">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                Take Attendance
              </Button>
            </Link>
            <Link href="/ops/schedule">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Schedule
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Course Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Assigned Courses</span>
                <Badge variant="default" className="text-xs">
                  {dashboardData?.staffStats?.assignedCourses || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Students</span>
                <Badge variant="outline" className="text-xs">
                  {dashboardData?.staffStats?.totalStudents || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Grades</span>
                <Badge variant="destructive" className="text-xs">
                  {dashboardData?.staffStats?.pendingGrades || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Course Completion</span>
                <span className="text-sm font-medium text-green-600">
                  {dashboardData?.staffStats?.courseCompletion?.toFixed(1) ||
                    "0"}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Student Engagement</span>
                <span className="text-sm font-medium text-blue-600">
                  {dashboardData?.staffStats?.totalStudents || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Grading Progress</span>
                <span className="text-sm font-medium text-orange-600">
                  {dashboardData?.staffStats?.pendingGrades
                    ? Math.round(
                        ((dashboardData.staffStats.totalStudents -
                          dashboardData.staffStats.pendingGrades) /
                          dashboardData.staffStats.totalStudents) *
                          100
                      )
                    : 100}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardData?.recentActivity?.recentUsers
                ?.slice(0, 3)
                .map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate">{user.username}</span>
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                ))}
              {dashboardData?.recentActivity?.recentPayments
                ?.slice(0, 2)
                .map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>Payment #{payment.id}</span>
                    <Badge
                      variant={
                        payment.status === "completed" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Course Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Assigned Courses
                </p>
                <p className="text-2xl font-bold">
                  {dashboardData?.staffStats?.assignedCourses?.toLocaleString() ||
                    "0"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">
                  {dashboardData?.staffStats?.totalStudents?.toLocaleString() ||
                    "0"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Course Status</p>
              <div className="flex items-center justify-between text-sm">
                <span>Completed</span>
                <Badge variant="default">
                  {dashboardData?.staffStats?.courseCompletion?.toFixed(1) ||
                    "0"}
                  %
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>In Progress</span>
                <Badge variant="secondary">
                  {100 - (dashboardData?.staffStats?.courseCompletion || 0)}%
                </Badge>
              </div>
            </div>
            <Link href="/ops/courses">
              <Button variant="outline" size="sm" className="w-full">
                View My Courses
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Student Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">
                  {dashboardData?.staffStats?.totalStudents?.toLocaleString() ||
                    "0"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Grades</p>
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardData?.staffStats?.pendingGrades?.toLocaleString() ||
                    "0"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Grading Progress</p>
              <div className="flex items-center justify-between text-sm">
                <span>Graded</span>
                <Badge variant="default">
                  {dashboardData?.staffStats?.totalStudents &&
                  dashboardData?.staffStats?.pendingGrades
                    ? dashboardData.staffStats.totalStudents -
                      dashboardData.staffStats.pendingGrades
                    : 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Pending</span>
                <Badge variant="destructive">
                  {dashboardData?.staffStats?.pendingGrades || 0}
                </Badge>
              </div>
            </div>
            <Link href="/ops/grades">
              <Button variant="outline" size="sm" className="w-full">
                Grade Students
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Performance Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Course Completion
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData?.staffStats?.courseCompletion?.toFixed(1) ||
                    "0"}
                  %
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Student Engagement
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData?.staffStats?.totalStudents || 0}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Key Metrics</p>
              <div className="flex items-center justify-between text-sm">
                <span>Active Courses</span>
                <Badge variant="default">
                  {dashboardData?.staffStats?.assignedCourses || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Grading Efficiency</span>
                <Badge variant="outline">
                  {dashboardData?.staffStats?.totalStudents &&
                  dashboardData?.staffStats?.pendingGrades
                    ? Math.round(
                        ((dashboardData.staffStats.totalStudents -
                          dashboardData.staffStats.pendingGrades) /
                          dashboardData.staffStats.totalStudents) *
                          100
                      )
                    : 100}
                  %
                </Badge>
              </div>
            </div>
            <Link href="/ops/reports">
              <Button variant="outline" size="sm" className="w-full">
                View Reports
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData?.staffStats?.pendingGrades > 0 && (
              <div className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800">
                      Pending Grades
                    </p>
                    <p className="text-sm text-orange-600">
                      You have {dashboardData.staffStats.pendingGrades} grades
                      to submit
                    </p>
                  </div>
                </div>
                <Link href="/ops/grades">
                  <Button size="sm" variant="outline">
                    Grade Now
                  </Button>
                </Link>
              </div>
            )}

            {dashboardData?.staffStats?.assignedCourses > 0 && (
              <div className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      Course Management
                    </p>
                    <p className="text-sm text-green-600">
                      You have {dashboardData.staffStats.assignedCourses} active
                      courses
                    </p>
                  </div>
                </div>
                <Link href="/ops/courses">
                  <Button size="sm" variant="outline">
                    View Courses
                  </Button>
                </Link>
              </div>
            )}

            <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Academic Calendar</p>
                  <p className="text-sm text-blue-600">
                    Check your teaching schedule and important dates
                  </p>
                </div>
              </div>
              <Link href="/ops/schedule">
                <Button size="sm" variant="outline">
                  View Schedule
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
