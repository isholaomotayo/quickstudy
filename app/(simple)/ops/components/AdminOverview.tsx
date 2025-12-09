"use client";

import { useApp } from "@/contexts/AppContext";
import { useOverviewData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Users,
  BookOpen,
  DollarSign,
  FileText,
  TrendingUp,
  Activity,
  Calendar,
  GraduationCap,
  CreditCard,
  Building2,
  Plus,
  ArrowRight,
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

function statusLabel(status: string | number | null | undefined) {
  const s = String(status ?? "");
  if (s === "1") return "Completed";
  if (s === "0") return "Pending";
  return s || "Unknown";
}

export default function AdminOverview() {
  const { userData } = useApp();
  const { data: overviewData, isLoading } = useOverviewData(
    userData?.institution_id
  );

  // Helper functions to determine user roles
  const isAdmin = () =>
    userData?.role === "ADMIN" || userData?.role === "SUPERADMIN";
  const isHOD = () => userData?.role === "HOD";

  const isAdminUser = isAdmin();
  const isHODUser = isHOD();

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
            <Link href="/ops/users">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </Link>
            <Link href="/ops/courses">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </Link>
            {isAdminUser && (
              <Link href="/ops/fees">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Fee Management
                </Button>
              </Link>
            )}
            {isHODUser && (
              <Link href="/ops/academic-calendar">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Academic Calendar
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="default" className="text-xs">
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Services</span>
                <Badge variant="default" className="text-xs">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Service</span>
                <Badge variant="default" className="text-xs">
                  Running
                </Badge>
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
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overviewData?.recentActivity?.recentUsers
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
              {overviewData?.recentActivity?.recentPayments
                ?.slice(0, 2)
                .map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>Payment #{payment.id}</span>
                    <Badge
                      variant={payment.status === 1 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {payment.status === 1 ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                ))}
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
                <span className="text-sm">User Growth</span>
                <span className="text-sm font-medium text-green-600">
                  +{overviewData?.userStats?.newUsersThisMonth || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Course Completion</span>
                <span className="text-sm font-medium text-blue-600">
                  {overviewData?.courseStats?.activeCourses || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Revenue Growth</span>
                <span className="text-sm font-medium text-green-600">
                  +
                  {overviewData?.financialStats?.monthlyRevenue
                    ? (
                        (overviewData.financialStats.monthlyRevenue /
                          Math.max(
                            overviewData.financialStats.totalRevenue,
                            1
                          )) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* User Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">
                  {overviewData?.dashboardStats?.totalUsers?.toLocaleString() ||
                    "0"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">
                  {overviewData?.userStats?.activeUsers?.toLocaleString() ||
                    "0"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Users by Role</p>
              {overviewData?.userStats?.usersByRole
                ?.slice(0, 5)
                .map((role, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{role.role}</span>
                    <Badge variant="outline">{role.count}</Badge>
                  </div>
                ))}
            </div>
            <Link href="/ops/users">
              <Button variant="outline" size="sm" className="w-full">
                View All Users
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

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
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">
                  {overviewData?.dashboardStats?.totalCourses?.toLocaleString() ||
                    "0"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Courses by Department</p>
              {overviewData?.courseStats?.coursesByDepartment
                ?.slice(0, 5)
                .map((dept, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{dept.department}</span>
                    <Badge variant="outline">{dept.count}</Badge>
                  </div>
                ))}
            </div>
            <Link href="/ops/courses">
              <Button variant="outline" size="sm" className="w-full">
                View All Courses
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Financial Statistics */}
        {isAdminUser && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                    {formatCurrency(overviewData?.financialStats?.totalRevenue)}
                  </p>
                </div>
                <div className="min-w-0 text-right">
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                    {formatCurrency(
                      overviewData?.financialStats?.monthlyRevenue
                    )}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Payments by Status</p>
                {overviewData?.financialStats?.paymentsByStatus
                  ?.slice(0, 5)
                  .map((status, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="capitalize">
                        {statusLabel(status.status)}
                      </span>
                      <Badge variant="outline">{status.count}</Badge>
                    </div>
                  ))}
              </div>
              <Link href="/ops/financial">
                <Button variant="outline" size="sm" className="w-full">
                  View Financial Reports
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Academic Statistics */}
        {isHODUser && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold">
                    {overviewData?.academicStats?.totalStudents?.toLocaleString() ||
                      "0"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average GPA</p>
                  <p className="text-2xl font-bold">
                    {overviewData?.academicStats?.averageGPA?.toFixed(2) ||
                      "0.00"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Students by Programme</p>
                {overviewData?.academicStats?.studentsByProgramme
                  ?.slice(0, 5)
                  .map((prog, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{prog.programme}</span>
                      <Badge variant="outline">{prog.count}</Badge>
                    </div>
                  ))}
              </div>
              <Link href="/ops/academic">
                <Button variant="outline" size="sm" className="w-full">
                  View Academic Reports
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
