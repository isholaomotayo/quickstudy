"use client";

import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  Eye,
  FileText,
  GraduationCap,
  Globe,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  TrendingUp,
  Users,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/components/ui/user-profile";
import FutureStudentLanding from "@/components/FutureStudentLanding";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  student: {
    id: string;
    programme_name: string | null;
  };
  studentGpa: {
    cumulative_gpa: number;
    class_degree?: {
      id: number;
      name: string;
    };
  } | null;
  allStudentResult: Array<{
    id: string;
    score: number;
    grade: {
      name: string;
    };
    student_course: {
      course: {
        code: string;
        title?: string;
        units: number;
      };
    };
  }>;
  approvedRegistrationsSize: number;
  unApprovedRegistrationsSize: number;
  userData: {
    id: string;
    email: string;
    role: string;
    institution_id: number;
    first_name: string;
    last_name: string;
    username: string;
  };
  isFutureStudent: boolean;
  admittedSession: {
    name: string;
    start_date: string;
  } | null;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/student/dashboard");

        // Extract data from api-wrapper response
        const apiResponse = response.data || response;
        const data = apiResponse.data || apiResponse;

        setDashboardData(data);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError("Failed to load dashboard data");

        // Redirect to signin if unauthorized
        if ((err as any)?.status === 401 || (err as any)?.status === 403) {
          router.push("/signin");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 grid gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4 grid gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4 grid gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg p-6">
          <div className="text-center space-y-4">
            <p className="text-red-600 font-medium">{error || "Failed to load dashboard"}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Check if student is admitted to a future session
  if (dashboardData.isFutureStudent && dashboardData.admittedSession) {
    const studentName = `${dashboardData.userData?.first_name || ""} ${
      dashboardData.userData?.last_name || ""
    }`.trim();

    return (
      <FutureStudentLanding
        studentName={studentName || "Student"}
        admittedSession={dashboardData.admittedSession}
      />
    );
  }

  // Get student's name and initials
  const studentName = `${dashboardData.userData?.first_name || ""} ${
    dashboardData.userData?.last_name || ""
  }`.trim();
  const initials = dashboardData.userData
    ? `${dashboardData.userData.first_name?.[0] || ""}${
        dashboardData.userData.last_name?.[0] || ""
      }`
    : "ST";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-4 grid gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-in slide-in-from-left duration-700">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">WELCOME</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <UserProfile
              customRole={dashboardData.student?.programme_name || "N/A"}
              variant="detailed"
              size="lg"
            />
            <Link href="/profile">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 bg-white/50 backdrop-blur-sm mt-4"
              >
                <Eye className="w-4 h-4" />
                View Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Course Registration Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-in slide-in-from-left duration-700 delay-100">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                COURSE REGISTRATION APPROVALS
              </span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Current Semester
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-medium">Approved</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">
                    {dashboardData.approvedRegistrationsSize}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-sm font-medium">Unapproved</span>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700">
                    {dashboardData.unApprovedRegistrationsSize}
                  </Badge>
                </div>
              </div>
            </div>
            <Link href="/course-register">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 bg-white/50 backdrop-blur-sm mt-4"
              >
                <Eye className="w-4 h-4" />
                Show more
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Connect & Collaborate Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-xl animate-in slide-in-from-left duration-700 delay-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs font-medium opacity-90">
                  CONNECT & COLLABORATE
                </span>
              </div>
              <h3 className="text-lg font-bold">
                Join discussions and ask questions
              </h3>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white/70" />
              </div>
            </div>
            <Link href="/connect">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0 mt-3 text-xs"
              >
                Get Started
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* OER Resources Card */}
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl animate-in slide-in-from-left duration-700 delay-300">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium opacity-90">
                  OPEN EDUCATIONAL RESOURCES
                </span>
              </div>
              <h3 className="text-lg font-bold">
                Free learning resources from top universities
              </h3>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white/70" />
              </div>
            </div>
            <Link href="/oer">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0 mt-3 text-xs"
              >
                Explore Resources
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Middle Column */}
      <div className="lg:col-span-4 grid gap-6">
        {/* Payments Card */}
        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 shadow-xl animate-in slide-in-from-top duration-700">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-medium opacity-90">PAYMENTS</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="space-y-1 text-sm opacity-90">
                <div className="flex items-center justify-between">
                  <span>Tuition Fees</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Registration Fee</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Exam Fee</span>
                </div>
              </div>
            </div>
            <Link href="/payments">
              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-white/20 hover:bg-white/30 text-white border-0 mt-4"
              >
                View Payments
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* GPA Card */}
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl animate-in slide-in-from-top duration-700 delay-100">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium opacity-90">
                CUMULATIVE GPA
              </span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="text-4xl font-bold">
                {dashboardData.studentGpa?.cumulative_gpa || "N/A"}
              </div>
              <p className="text-sm opacity-90">
                {dashboardData.studentGpa?.class_degree?.name || "N/A"}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <BarChart3 className="w-4 h-4" />
              <Link href="/cgpa">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs"
                >
                  View GPA
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Online Learning Card */}
        <Card className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 shadow-xl animate-in slide-in-from-bottom duration-700 delay-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs font-medium opacity-90">
                  ONLINE EDUCATION
                </span>
              </div>
              <h3 className="text-lg font-bold">
                Learning at your convenience
              </h3>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white/70" />
              </div>
            </div>
            <Link href="/courses">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs mt-3"
              >
                Get Started
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Course Results Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-in slide-in-from-bottom duration-700 delay-300">
          <CardHeader>
            <CardTitle className="text-emerald-600 text-lg">
              Course Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.allStudentResult &&
              dashboardData.allStudentResult.length > 0 ? (
                dashboardData.allStudentResult
                  .slice(0, 1)
                  .map((studentresult) => (
                    <div
                      key={studentresult.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg"
                    >
                      <div>
                        <p className="font-bold text-gray-900">
                          {studentresult.student_course?.course?.code || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {studentresult.student_course?.course?.title ||
                            "Course Title"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">
                          {studentresult.student_course?.course?.units || 0}
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                          {studentresult.score}
                          {studentresult.grade?.name || ""}
                        </Badge>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg">
                  <p className="text-gray-600">No results available</p>
                </div>
              )}
            </div>
            <Link href="/results">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-white/50 backdrop-blur-sm mt-4"
              >
                <Eye className="w-4 h-4" />
                View more results
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-4 grid gap-6">
        {/* Help & Support Card */}
        <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white border-0 shadow-xl animate-in slide-in-from-right duration-700">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-medium opacity-90">
                HELP & SUPPORT
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Need assistance?</h3>
              <p className="text-sm opacity-80">
                Our support team is here to help you with any questions or
                issues.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href="https://wa.me/2348167667864"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-6 h-6 mb-1" />
                  <span className="text-xs">WhatsApp</span>
                </a>
                <a
                  href="tel:+2348167667864"
                  className="flex flex-col items-center p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <Phone className="w-6 h-6 mb-1" />
                  <span className="text-xs">Call</span>
                </a>
                <a
                  href={`mailto:${
                    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
                    "support@hyperlearn.ng"
                  }`}
                  className="flex flex-col items-center p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <Mail className="w-6 h-6 mb-1" />
                  <span className="text-xs">Email</span>
                </a>
              </div>
            </div>
            <Link href="/help">
              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-white/20 hover:bg-white/30 text-white border-0 mt-4"
              >
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Announcements Card */}
        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl animate-in slide-in-from-right duration-700 delay-100">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="text-xs font-medium opacity-90">
                  ANNOUNCEMENTS
                </span>
              </div>
              <h3 className="text-lg font-bold">Everything you need to know</h3>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white/70" />
              </div>
            </div>
            <Link href="/notifications">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0 mt-3 text-xs"
              >
                Read More
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Academic Calendar Card */}
        <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-0 shadow-xl animate-in slide-in-from-right duration-700 delay-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium opacity-90">
                  ACADEMIC CALENDAR
                </span>
              </div>
              <h3 className="text-lg font-bold">
                School calendar for the current semester
              </h3>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white/70" />
              </div>
            </div>
            <Link href="/calendar">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0 mt-3 text-xs"
              >
                View Calendar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
