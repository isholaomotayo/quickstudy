"use client";

import {
  BookOpen,
  Bell,
  TrendingUp,
  CreditCard,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  Library,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

interface InstitutionData {
  id: number;
  support_mail?: string | null;
  email?: string | null;
  phone?: string | null;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [institutionData, setInstitutionData] =
    useState<InstitutionData | null>(null);
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

        // Fetch institution data if we have institution_id
        if (data.userData?.institution_id) {
          try {
            const institutionResponse = await api.post(
              "/api/institution/params",
              {
                id: data.userData.institution_id,
              }
            );
            const institutionApiResponse =
              institutionResponse.data || institutionResponse;
            const institution =
              institutionApiResponse.data || institutionApiResponse;
            setInstitutionData(institution);
          } catch (instErr) {
            console.error("Error fetching institution data:", instErr);
            // Don't fail the whole dashboard if institution fetch fails
          }
        }
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
      <div className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
          <Card className="md:col-span-8 glass-card">
            <CardContent className="p-8">
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card className="md:col-span-4 glass-card">
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
            <p className="text-destructive font-medium">
              {error || "Failed to load dashboard"}
            </p>
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

  // Calculate GPA percentage for circular progress
  const gpaValue = dashboardData.studentGpa?.cumulative_gpa || 0;
  const gpaPercentage =
    gpaValue > 0 ? Math.min((gpaValue / 5.0) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 58; // radius = 58
  const strokeDashoffset = circumference * (1 - gpaPercentage / 100);

  // Calculate registration progress
  const totalRegistrations =
    dashboardData.approvedRegistrationsSize +
    dashboardData.unApprovedRegistrationsSize;
  const registrationProgress =
    totalRegistrations > 0
      ? (dashboardData.approvedRegistrationsSize / totalRegistrations) * 100
      : 0;

  return (
    <div className="min-h-screen space-y-4 animate-in fade-in duration-1000">
      {/* Main Bento Grid */}
      <main className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[minmax(160px,auto)]">
        {/* Welcome Hero - Large Section */}
        <Card className="md:col-span-8 glass-card overflow-hidden group">
          <CardContent className="p-5 flex flex-col justify-between h-full relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10 group-hover:bg-primary/20 transition-colors duration-500" />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <Badge className="bg-primary/10 text-primary border-none hover:bg-primary/20">
                  Welcome back
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                  {studentName || "Student"}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight max-w-lg">
                Your Academic journey is looking{" "}
                <span className="text-primary italic">stellar.</span>
              </h2>
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="bg-white/5 dark:bg-white/5 border border-white/10 rounded-xl p-3 min-w-[120px]">
                  <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-widest font-bold">
                    Programme
                  </p>
                  <p className="font-semibold text-sm">
                    {dashboardData.student?.programme_name || "N/A"}
                  </p>
                </div>
                <div className="bg-white/5 dark:bg-white/5 border border-white/10 rounded-xl p-3 min-w-[120px]">
                  <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-widest font-bold">
                    Admission
                  </p>
                  <p className="font-semibold text-sm">
                    {dashboardData.admittedSession?.name || "Not assigned"}
                  </p>
                </div>
                <div className="bg-white/5 dark:bg-white/5 border border-white/10 rounded-xl p-3 min-w-[120px]">
                  <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-widest font-bold">
                    Status
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    <p className="font-semibold text-sm">Active Student</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Link href="/courses">
                <Button className="rounded-full px-6 h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/30 text-sm">
                  Continue Learning <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="rounded-full px-6 h-10 border-border/50 hover:bg-muted/50 bg-transparent text-sm"
                >
                  View Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* GPA - Dynamic Card */}
        <Card className="md:col-span-4 glass-card relative group overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Cumulative GPA
            </CardTitle>
            <Link href="/results">
              <TrendingUp className="h-4 w-4 text-primary" />
            </Link>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col justify-center items-center h-[calc(100%-50px)]">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/20"
                />
                {gpaValue > 0 ? (
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-primary drop-shadow-lg"
                  />
                ) : null}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">
                  {gpaValue > 0 ? gpaValue.toFixed(2) : "N/A"}
                </span>
                <Badge
                  variant="secondary"
                  className="bg-muted/50 text-[9px] mt-0.5"
                >
                  {dashboardData.studentGpa?.class_degree?.name || "PENDING"}
                </Badge>
              </div>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-2 max-w-[160px]">
              {gpaValue > 0
                ? "Your academic performance summary."
                : "Final calculations will be available after the semester review."}
            </p>
          </CardContent>
        </Card>

        {/* Course Registration - Stats Card */}
        <Card className="md:col-span-4 glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Course Registration
            </CardTitle>
            <Link href="/course-register">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/30 rounded-lg p-2.5 text-center border border-border/50">
                <p className="text-lg font-bold">{totalRegistrations}</p>
                <p className="text-[9px] text-muted-foreground font-bold">
                  REG
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-2.5 text-center border border-primary/20">
                <p className="text-lg font-bold text-primary">
                  {dashboardData.approvedRegistrationsSize}
                </p>
                <p className="text-[9px] text-primary font-bold uppercase">
                  Appr
                </p>
              </div>
              <div className="bg-amber-500/10 dark:bg-amber-500/20 rounded-lg p-2.5 text-center border border-amber-500/20">
                <p className="text-lg font-bold text-amber-500 dark:text-amber-400">
                  {dashboardData.unApprovedRegistrationsSize}
                </p>
                <p className="text-[9px] text-amber-500 dark:text-amber-400 font-bold uppercase">
                  Pend
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Overall Progress</span>
                <span className="text-primary">
                  {Math.round(registrationProgress)}%
                </span>
              </div>
              <Progress
                value={registrationProgress}
                className="h-1.5 bg-muted/30"
              />
            </div>
            <Link href="/course-register">
              <Button
                variant="link"
                className="text-primary p-0 h-auto text-xs font-bold group"
              >
                Review Status{" "}
                <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Payments Overview */}
        <Card className="md:col-span-4 glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Financial Summary
            </CardTitle>
            <Link href="/payments">
              <CreditCard className="h-4 w-4 text-primary" />
            </Link>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { label: "Tuition", status: "Paid", color: "bg-primary" },
              {
                label: "Registration",
                status: "Pending",
                color: "bg-amber-500",
              },
              { label: "Exams", status: "Due", color: "bg-destructive" },
              { label: "Receipts", status: "Available", color: "bg-blue-500" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-2.5 bg-white/5 dark:bg-white/5 rounded-lg border border-white/5 flex flex-col justify-between"
              >
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
                  {item.label}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                  <span className="text-[11px] font-semibold">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Schedule/Timeline Card */}
        <Card className="md:col-span-4 glass-card border-primary/20 bg-primary/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Schedule
            </CardTitle>
            <Link href="/calendar">
              <Calendar className="h-4 w-4 text-primary" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-2">
            <div className="flex gap-3 group cursor-pointer">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="w-[1px] h-full bg-primary/20 my-1.5" />
              </div>
              <div className="pb-2">
                <p className="text-xs font-bold">Upcoming Semester Dates</p>
                <p className="text-[11px] text-muted-foreground">
                  Check the latest academic calendar.
                </p>
              </div>
            </div>
            <div className="flex gap-3 group cursor-pointer">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-white/5 dark:bg-white/5 flex items-center justify-center border border-white/10 text-muted-foreground">
                  <Bell className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold">Latest Announcements</p>
                <p className="text-[11px] text-muted-foreground">
                  Stay updated with campus news.
                </p>
              </div>
            </div>
            <Link href="/calendar">
              <Button
                size="sm"
                className="w-full rounded-full border-border/50 mt-1.5 bg-transparent text-xs h-8"
                variant="outline"
              >
                Open Schedule
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Bottom Wide Section - Course Results & Community */}
        <Card className="md:col-span-8 glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">
                Academic Performance
              </CardTitle>
              <CardDescription className="text-xs">
                Visual summary of your course results
              </CardDescription>
            </div>
            <Link href="/results">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary hover:bg-primary/10 font-bold text-xs h-7"
              >
                View all results
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="h-36 flex items-center justify-center border-2 border-dashed border-border/50 rounded-2xl m-4">
            {dashboardData.allStudentResult &&
            dashboardData.allStudentResult.length > 0 ? (
              <div className="w-full space-y-2">
                {dashboardData.allStudentResult
                  .slice(0, 3)
                  .map((studentresult) => (
                    <div
                      key={studentresult.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-2.5"
                    >
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {studentresult.student_course?.course?.code || "N/A"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {studentresult.student_course?.course?.title ||
                            "Course title"}
                        </p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <Badge
                          variant="outline"
                          className="border-primary/30 text-primary text-xs"
                        >
                          {studentresult.score}{" "}
                          {studentresult.grade?.name || ""}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground">
                          {studentresult.student_course?.course?.units || 0}{" "}
                          units
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center space-y-1.5">
                <Library className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground text-xs">
                  No results available yet for the current session.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card className="md:col-span-4 bg-gradient-to-br from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70 shadow-2xl shadow-primary/20 border-primary/30 overflow-hidden">
          <CardContent className="p-4 h-full flex flex-col justify-between text-primary-foreground">
            <div className="space-y-2.5">
              <div className="w-10 h-10 bg-primary-foreground/20 dark:bg-primary-foreground/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-primary-foreground/20">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-foreground">
                  Need Help?
                </h3>
                <p className="text-primary-foreground/90 dark:text-primary-foreground/80 text-xs">
                  Our community and support teams are available 24/7.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mt-4">
              {institutionData?.phone && (
                <a
                  href={`https://wa.me/${institutionData.phone.replace(
                    /\D/g,
                    ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-foreground/20 dark:bg-primary-foreground/15 hover:bg-primary-foreground/30 dark:hover:bg-primary-foreground/25 p-2 rounded-lg flex flex-col items-center gap-0.5 transition-colors border border-primary-foreground/30"
                >
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary-foreground">
                    WhatsApp
                  </span>
                </a>
              )}
              {institutionData?.phone && (
                <a
                  href={`tel:${institutionData.phone}`}
                  className="bg-primary-foreground/20 dark:bg-primary-foreground/15 hover:bg-primary-foreground/30 dark:hover:bg-primary-foreground/25 p-2 rounded-lg flex flex-col items-center gap-0.5 transition-colors border border-primary-foreground/30"
                >
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary-foreground">
                    Call
                  </span>
                </a>
              )}
              <a
                href={`mailto:${
                  institutionData?.support_mail ||
                  institutionData?.email ||
                  "support@quickstudy.ng"
                }`}
                className="bg-primary-foreground/20 dark:bg-primary-foreground/15 hover:bg-primary-foreground/30 dark:hover:bg-primary-foreground/25 p-2 rounded-lg flex flex-col items-center gap-0.5 transition-colors border border-primary-foreground/30"
              >
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary-foreground">
                  Email
                </span>
              </a>
            </div>
            <Link href="/connect">
              <Button
                variant="secondary"
                className="w-full mt-3 rounded-full font-bold bg-primary-foreground/20 dark:bg-primary-foreground/15 hover:bg-primary-foreground/30 dark:hover:bg-primary-foreground/25 text-primary-foreground border-primary-foreground/30 text-xs h-8"
              >
                Join Discussions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
