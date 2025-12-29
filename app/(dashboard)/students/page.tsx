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
  Globe, Mail,
  MessageCircle,
  Phone,
  TrendingUp,
  Users,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FutureStudentLanding from "@/components/FutureStudentLanding";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

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
          <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4 grid gap-6">
          <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4 grid gap-6">
          <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-sm">
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
        <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-sm p-6">
          <div className="text-center space-y-4">
            <p className="text-destructive font-medium">{error || "Failed to load dashboard"}</p>
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
    <div className="space-y-6">
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <Card className="xl:col-span-8 border border-border shadow-sm bg-card">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-primary">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Welcome back</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground">{studentName}</span>
                </div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Your Academic information
                </h1>
     
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/courses">
                  <Button size="sm" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Continue
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" size="sm" className="gap-2 border-border">
                    <Eye className="w-4 h-4" />
                    Profile
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Programme
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {dashboardData.student?.programme_name || "N/A"}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Admission session
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {dashboardData.admittedSession?.name || "Not assigned"}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {dashboardData.userData?.role || "Student"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4 border border-border shadow-sm bg-gradient-to-br from-primary/10 via-card to-card dark:from-primary/18 dark:via-card dark:to-card">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Profile</p>
                <p className="text-lg font-semibold mt-1 text-foreground">{studentName || "Student"}</p>
                <p className="text-sm text-muted-foreground">
                  {dashboardData.student?.programme_name || "Programme"}
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">{initials}</Badge>
            </div>
            <Separator className="bg-border/60" />
            <div className="flex items-center gap-3 text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Keep your details up to date.</span>
            </div>
            <Link href="/profile">
              <Button variant="secondary" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Manage profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="relative overflow-hidden border border-border shadow-sm bg-card">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.14),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.12),transparent_40%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.1),transparent_40%)]" />
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Cumulative GPA</span>
              </div>
              <Link href="/cgpa" className="text-xs text-primary hover:underline">
                View
              </Link>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">
                {dashboardData.studentGpa?.cumulative_gpa || "N/A"}
              </span>
              <Badge variant="outline" className="border-primary/30 text-primary">
                {dashboardData.studentGpa?.class_degree?.name || "Pending"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-border shadow-sm bg-card">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(52,211,153,0.12),transparent_40%),radial-gradient(circle_at_90%_0%,rgba(251,191,36,0.1),transparent_45%)] dark:bg-[radial-gradient(circle_at_15%_30%,rgba(52,211,153,0.1),transparent_40%),radial-gradient(circle_at_90%_0%,rgba(251,191,36,0.08),transparent_45%)]" />
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Course registration</span>
              </div>
              <Link href="/course-register" className="text-xs text-primary hover:underline">
                Review
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg border border-border/60 bg-muted/25 p-2.5">
                <p className="text-[11px] text-muted-foreground">Registered</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/70" />
                  <span className="text-sm font-semibold text-foreground">
                    {dashboardData.approvedRegistrationsSize + dashboardData.unApprovedRegistrationsSize}
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/25 p-2.5">
                <p className="text-[11px] text-muted-foreground">Approved</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {dashboardData.approvedRegistrationsSize}
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/25 p-2.5">
                <p className="text-[11px] text-muted-foreground">Pending</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-sm font-semibold text-foreground">
                    {dashboardData.unApprovedRegistrationsSize}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-border shadow-sm bg-card">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.12),transparent_40%),radial-gradient(circle_at_100%_10%,rgba(34,211,238,0.12),transparent_45%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.1),transparent_40%),radial-gradient(circle_at_100%_10%,rgba(34,211,238,0.1),transparent_45%)]" />
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Payments</span>
              </div>
              <Link href="/payments" className="text-xs text-primary hover:underline">
                View
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 rounded-lg bg-muted/25 p-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Tuition
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/25 p-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Registration
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/25 p-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Exams
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/25 p-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                Receipts
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm bg-card">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Schedule</span>
              </div>
              <Link href="/calendar" className="text-xs text-primary hover:underline">
                Open
              </Link>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              Current semester dates
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Bell className="w-4 h-4 text-primary" />
              Latest announcements
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden lg:col-span-2 border border-border shadow-sm bg-card">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(34,211,238,0.1),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_45%)] dark:bg-[radial-gradient(circle_at_15%_15%,rgba(34,211,238,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.08),transparent_45%)]" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BarChart3 className="w-4 h-4" />
                <CardTitle className="text-base">Course results</CardTitle>
              </div>
              <Link href="/results" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboardData.allStudentResult && dashboardData.allStudentResult.length > 0 ? (
              dashboardData.allStudentResult.slice(0, 2).map((studentresult) => (
                <div
                  key={studentresult.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/25 p-3"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {studentresult.student_course?.course?.code || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {studentresult.student_course?.course?.title || "Course title"}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {studentresult.score}
                      {studentresult.grade?.name || ""}
                    </Badge>
                    <p className="text-[11px] text-muted-foreground">
                      {studentresult.student_course?.course?.units || 0} units
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                No results available yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm bg-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <CardTitle className="text-base">Community & support</CardTitle>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link
                href="/connect"
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 hover:border-primary/40"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span>Join discussions</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <Link
                href="/oer"
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 hover:border-primary/40"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <span>OER library</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <a
                  href="https://wa.me/2348167667864"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center rounded-md border border-border px-2 py-2 hover:border-primary/40"
                >
                  <MessageCircle className="w-4 h-4 mb-1 text-primary" />
                  WhatsApp
                </a>
                <a
                  href="tel:+2348167667864"
                  className="flex flex-col items-center rounded-md border border-border px-2 py-2 hover:border-primary/40"
                >
                  <Phone className="w-4 h-4 mb-1 text-primary" />
                  Call
                </a>
                <a
                  href={`mailto:${
                    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@quickstudy.ng"
                  }`}
                  className="flex flex-col items-center rounded-md border border-border px-2 py-2 hover:border-primary/40"
                >
                  <Mail className="w-4 h-4 mb-1 text-primary" />
                  Email
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
