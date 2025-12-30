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
    const [institutionData, setInstitutionData] = useState<InstitutionData | null>(null);
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
            <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64 w-full rounded-xl" />
                        <Skeleton className="h-48 w-full rounded-xl" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <Skeleton className="h-48 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="border-destructive/20 shadow-sm p-6 max-w-md w-full text-center bg-white/80 backdrop-blur-sm">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-destructive/10 rounded-full">
                            <HelpCircle className="w-6 h-6 text-destructive" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Unable to Load Dashboard
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        {error || "We couldn't retrieve your dashboard information."}
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Try Again
                    </Button>
                </Card>
            </div>
        );
    }

    // Check if student is admitted to a future session
    if (dashboardData.isFutureStudent && dashboardData.admittedSession) {
        const studentName = `${dashboardData.userData?.first_name || ""} ${dashboardData.userData?.last_name || ""
            }`.trim();

        return (
            <FutureStudentLanding
                studentName={studentName || "Student"}
                admittedSession={dashboardData.admittedSession}
            />
        );
    }

    const studentName = `${dashboardData.userData?.first_name || ""} ${dashboardData.userData?.last_name || ""
        }`.trim();

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Welcome back, {dashboardData.userData?.first_name}
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm">
                        Here's what's happening with your academic progress today.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/profile">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Users className="w-4 h-4" />
                            Profile
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* GPA Card - Light Purple Background */}
                <Link href="/results">
                    <Card className="p-5 h-36 shadow-sm hover:shadow-md transition-all bg-purple-50/50 border-0 cursor-pointer hover:scale-[1.02]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide flex items-center gap-1.5">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    CGPA
                                </p>
                                <h3 className="text-4xl font-extrabold mt-2 text-purple-900">
                                    {dashboardData.studentGpa?.cumulative_gpa?.toFixed(2) || "N/A"}
                                </h3>
                                <p className="text-xs font-semibold mt-1.5 text-purple-600">
                                    {dashboardData.studentGpa?.class_degree?.name || "Good Standing"}
                                </p>
                            </div>
                        </div>
                    </Card>
                </Link>

                {/* Programme Info - Light Blue Background */}
                <Link href="/profile">
                    <Card className="p-5 h-36 shadow-sm hover:shadow-md transition-all bg-blue-50/50 border-0 cursor-pointer hover:scale-[1.02]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    Programme
                                </p>
                                <h3 className="text-base font-bold mt-2 line-clamp-2 text-blue-900" title={dashboardData.student?.programme_name || "N/A"}>
                                    {dashboardData.student?.programme_name || "N/A"}
                                </h3>
                                <p className="text-xs font-semibold mt-1.5 text-blue-600">
                                    Current Session
                                </p>
                            </div>
                        </div>
                    </Card>
                </Link>

                {/* Registration Status - Light Green Background */}
                <Link href="/course-register">
                    <Card className="p-5 h-36 shadow-sm hover:shadow-md transition-all bg-green-50/50 border-0 cursor-pointer hover:scale-[1.02]">
                        <div className="flex justify-between items-start">
                            <div className="w-full">
                                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide flex items-center gap-1.5">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Registration
                                </p>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <h3 className="text-4xl font-extrabold text-green-900">
                                        {dashboardData.approvedRegistrationsSize}
                                    </h3>
                                    <span className="text-xs text-green-600 font-semibold">Approved</span>
                                </div>
                                {dashboardData.unApprovedRegistrationsSize > 0 && (
                                    <p className="text-xs font-semibold mt-1.5 text-amber-600">
                                        {dashboardData.unApprovedRegistrationsSize} Pending
                                    </p>
                                )}
                                {/* Progress bar */}
                                <div className="mt-3">
                                    <div className="w-full bg-green-200/50 rounded-full h-1.5">
                                        <div
                                            className="bg-green-600 h-1.5 rounded-full transition-all"
                                            style={{
                                                width: `${Math.min(100, (dashboardData.approvedRegistrationsSize / (dashboardData.approvedRegistrationsSize + dashboardData.unApprovedRegistrationsSize)) * 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Link>
            </div>

            {/* Results and Quick Actions - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Recent Results - Compact */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-teal-600" />
                            Recent Results
                        </h2>
                        <Link href="/results" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                            View All <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <Card className="overflow-hidden shadow-md bg-white">
                        {dashboardData.allStudentResult && dashboardData.allStudentResult.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Course</th>
                                            <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Grade</th>
                                            <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {dashboardData.allStudentResult.slice(0, 3).map((result) => (
                                            <tr key={result.id} className="hover:bg-teal-50/30 transition-colors">
                                                <td className="px-3 py-2">
                                                    <span className="font-bold text-gray-900 text-sm">{result.student_course?.course?.code}</span>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <Badge
                                                        variant={result.score >= 70 ? "default" : "secondary"}
                                                        className={result.score >= 70 ? 'bg-teal-600' : 'bg-gray-400'}
                                                    >
                                                        {result.grade?.name}
                                                    </Badge>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className="text-sm font-bold text-gray-700">{result.score}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-gray-500">
                                <p className="text-sm">No recent results available.</p>
                            </div>
                        )}
                    </Card>
                </section>

                {/* Quick Actions */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h2>
                    <Card className="p-4 shadow-md bg-white">
                        <div className="space-y-2">
                            <Link href="/payments">
                                <Button variant="ghost" className="w-full justify-start text-sm py-2 hover:bg-teal-50">
                                    <CreditCard className="w-4 h-4 mr-2 text-teal-600" />
                                    Payments
                                </Button>
                            </Link>
                            <Link href="/course-register">
                                <Button variant="ghost" className="w-full justify-start text-sm py-2 hover:bg-teal-50">
                                    <CheckCircle className="w-4 h-4 mr-2 text-teal-600" />
                                    Course Registration
                                </Button>
                            </Link>
                            <Link href="/calendar">
                                <Button variant="ghost" className="w-full justify-start text-sm py-2 hover:bg-teal-50">
                                    <Calendar className="w-4 h-4 mr-2 text-teal-600" />
                                    Academic Calendar
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </section>

            </div>

            {/* Bottom Row - Resources, Updates, Help */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Learning Resources */}
                <Card className="p-4 shadow-md bg-white">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-teal-600" />
                        Resources
                    </h3>
                    <div className="space-y-2">
                        <Link href="/courses">
                            <Button variant="ghost" className="w-full justify-start text-xs py-2 hover:bg-teal-50">
                                <Globe className="w-3 h-3 mr-2 text-teal-600" />
                                Online Courses
                            </Button>
                        </Link>
                        <Link href="/oer">
                            <Button variant="ghost" className="w-full justify-start text-xs py-2 hover:bg-teal-50">
                                <BookOpen className="w-3 h-3 mr-2 text-teal-600" />
                                Library
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Updates */}
                <Card className="p-4 shadow-md bg-white">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                        <Bell className="w-4 h-4 text-teal-600" />
                        Updates
                    </h3>
                    <div className="space-y-2">
                        <div className="p-2 bg-gray-50 rounded text-xs">
                            <p className="font-semibold text-gray-900">New semester!</p>
                            <p className="text-[10px] text-gray-500">Check your portal</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                            <Link href="/notifications">View All</Link>
                        </Button>
                    </div>
                </Card>

                {/* Help */}
                <Card className="p-4 shadow-md bg-white">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-teal-600" />
                        Need Help?
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        <a
                            href="https://wa.me/2348167667864"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center p-2 bg-gray-50 rounded hover:bg-teal-50 transition-colors"
                        >
                            <MessageCircle className="w-4 h-4 text-green-600 mb-1" />
                            <span className="text-[9px] font-bold">Chat</span>
                        </a>
                        <a
                            href="tel:+2348167667864"
                            className="flex flex-col items-center p-2 bg-gray-50 rounded hover:bg-teal-50 transition-colors"
                        >
                            <Phone className="w-4 h-4 text-blue-600 mb-1" />
                            <span className="text-[9px] font-bold">Call</span>
                        </a>
                        <a
                            href={`mailto:${
                                institutionData?.support_mail ||
                                institutionData?.email ||
                                "support@quickstudy.ng"
                            }`}
                            className="flex flex-col items-center p-2 bg-gray-50 rounded hover:bg-teal-50 transition-colors"
                        >
                            <Mail className="w-4 h-4 text-gray-600 mb-1" />
                            <span className="text-[9px] font-bold">Email</span>
                        </a>
                    </div>
                </Card>

            </div>
        </div>
    );
}

