"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  Star,
  Award,
  AlertTriangle,
  BookOpen,
  Calendar,
  BarChart3,
  Target,
  Eye,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface StudentGpa {
  id: number;
  student_id: number;
  semester_id: number;
  level_id: number;
  classdegree_id?: number;
  prev_tnu: number;
  prev_tcp: number;
  prev_gpa: number;
  current_tnu: number;
  current_tcp: number;
  current_gpa: number;
  cumulative_tnu: number;
  cumulative_tcp: number;
  cumulative_gpa: number;
  semester?: {
    id: number;
    name: string;
  };
  level?: {
    id: number;
    name: string;
  };
  class_degree?: {
    id: number;
    name: string;
  };
}

interface StudentResult {
  id: number;
  student_course_id: number;
  score: number;
  grade_id: number;
  approved: boolean;
  publish: boolean;
  studentcourse: {
    id: number;
    course: {
      id: number;
      name: string;
      code: string;
      units: number;
    };
    level: {
      id: number;
      name: string;
    };
    semester: {
      id: number;
      name: string;
    };
  };
  grade: {
    id: number;
    name: string;
    point: number;
  };
}

interface Student {
  id: number;
  reg_no: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    other_name?: string;
    avatar?: string;
  };
  programme?: {
    id: number;
    name: string;
    department?: {
      id: number;
      name: string;
    };
  };
}

interface CgpaDashboardProps {
  student: Student;
  studentGpas: StudentGpa[];
  studentResults: StudentResult[];
  userData: any;
}

export function CgpaDashboard({
  student,
  studentGpas,
  studentResults,
  userData,
}: CgpaDashboardProps) {
  const safeNumber = (value: any) => {
    const num = parseFloat(value);
    return Number.isFinite(num) ? num : null;
  };
  const formatGpa = (value: number | null) =>
    value !== null && Number.isFinite(value) ? value.toFixed(2) : "N/A";

  // Calculate overall CGPA
  const overallCGPA = useMemo(() => {
    if (!studentGpas || !studentGpas.length) return null;
    const latestGpa = studentGpas[studentGpas.length - 1];
    return safeNumber(latestGpa.cumulative_gpa);
  }, [studentGpas]);

  // Calculate current semester GPA
  const currentGPA = useMemo(() => {
    if (!studentGpas || !studentGpas.length) return null;
    const currentGpa = studentGpas[studentGpas.length - 1];
    return safeNumber(currentGpa.current_gpa);
  }, [studentGpas]);

  // Calculate GPA trend
  const gpaTrend = useMemo(() => {
    if (studentGpas.length < 2) return null;

    const recent = studentGpas.slice(-2);
    const prev = safeNumber(recent[0].cumulative_gpa);
    const latest = safeNumber(recent[1].cumulative_gpa);

    if (prev === null || latest === null) return null;
    const trend = latest - prev;

    if (trend > 0.1)
      return { direction: "up", color: "success", icon: TrendingUp };
    if (trend < -0.1)
      return { direction: "down", color: "destructive", icon: TrendingDown };
    return { direction: "stable", color: "warning", icon: Minus };
  }, [studentGpas]);

  // Get GPA status
  const getGPAStatus = (gpa: number | null) => {
    if (gpa === null) return null;
    if (gpa >= 4.5)
      return {
        status: "First Class",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-400/50",
        bgColor: "bg-emerald-500",
        icon: Trophy,
        description: "Excellent academic performance",
        badgeVariant: "default" as const,
      };
    if (gpa >= 3.5)
      return {
        status: "Second Class Upper",
        color: "bg-primary/10 text-primary border border-primary/40",
        bgColor: "bg-primary",
        icon: Star,
        description: "Very good academic performance",
        badgeVariant: "default" as const,
      };
    if (gpa >= 2.5)
      return {
        status: "Second Class Lower",
        color: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-400/50",
        bgColor: "bg-cyan-500",
        icon: Award,
        description: "Good academic performance",
        badgeVariant: "secondary" as const,
      };
    if (gpa >= 1.5)
      return {
        status: "Third Class",
        color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/50",
        bgColor: "bg-amber-500",
        icon: AlertTriangle,
        description: "Satisfactory academic performance",
        badgeVariant: "outline" as const,
      };
    return {
      status: "Pass",
      color: "bg-muted/30 text-muted-foreground border border-border/60",
      bgColor: "bg-muted",
      icon: AlertTriangle,
      description: "No CGPA available yet",
      badgeVariant: "secondary" as const,
    };
  };

  // Calculate total credits
  const totalCredits = useMemo(() => {
    return studentResults.reduce((total, result) => {
      return (
        total + parseInt(result.studentcourse.course.units?.toString() || "0")
      );
    }, 0);
  }, [studentResults]);

  // Calculate passed credits
  const passedCredits = useMemo(() => {
    return studentResults.reduce((passed, result) => {
      if (parseFloat(result.score.toString()) >= 40) {
        return (
          passed +
          parseInt(result.studentcourse.course.units?.toString() || "0")
        );
      }
      return passed;
    }, 0);
  }, [studentResults]);

  const completionPercentage =
    totalCredits > 0 ? (passedCredits / totalCredits) * 100 : 0;
  const gpaStatus = getGPAStatus(overallCGPA);
  const hasGpaData = overallCGPA !== null;
  const hasResults = studentResults.length > 0;
  const safeProgress = (value: number | null) =>
    value !== null && Number.isFinite(value) ? value * 20 : 0;
  const SummaryIcon = gpaStatus?.icon || AlertTriangle;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current GPA</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatGpa(currentGPA)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Credits
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {passedCredits}
                </p>
                <p className="text-xs text-muted-foreground">of {totalCredits}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Progress value={completionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Academic Standing
                </p>
                <p className="text-lg font-bold text-foreground">
                  {gpaStatus?.status || "Not available"}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center">
                {gpaStatus?.icon ? (
                  <gpaStatus.icon className="h-5 w-5 text-primary" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-primary" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Semesters</p>
                <p className="text-2xl font-bold text-foreground">
                  {studentGpas.length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GPA Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Semester GPA Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Semester</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Current GPA</TableHead>
                    <TableHead>Cumulative GPA</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Class Degree</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentGpas && studentGpas.length > 0 ? (
                    studentGpas.map((studentgpa) => {
                      const semesterStatus = getGPAStatus(
                        safeNumber(studentgpa.current_gpa)
                      );
                      return (
                        <TableRow key={studentgpa.id}>
                          <TableCell className="font-medium">
                            {studentgpa.semester?.name || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {studentgpa.level?.name || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-lg font-bold text-foreground">
                              {formatGpa(safeNumber(studentgpa.current_gpa))}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-lg font-bold text-foreground">
                              {formatGpa(safeNumber(studentgpa.cumulative_gpa))}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {studentgpa.current_tnu || 0}
                          </TableCell>
                          <TableCell>
                            {studentgpa.class_degree ? (
                              <Badge variant={semesterStatus?.badgeVariant || "secondary"}>
                                {studentgpa.class_degree.name}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={semesterStatus?.badgeVariant || "secondary"}>
                              {semesterStatus?.status || "N/A"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
                          <p>No GPA records found</p>
                          <p className="text-sm">
                            Results will appear here once your grades are
                            published.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* GPA Trend */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                GPA Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Current Semester
                  </span>
                  <span className="font-bold text-foreground">
                    {formatGpa(currentGPA)}
                  </span>
                </div>
                <Progress value={safeProgress(currentGPA)} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Cumulative GPA</span>
                  <span className="font-bold text-foreground">
                    {formatGpa(overallCGPA)}
                  </span>
                </div>
                <Progress value={safeProgress(overallCGPA)} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/results?tab=results">
                  <Eye className="mr-2 h-4 w-4" />
                  View Course Results
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/course-register">
                  <FileText className="mr-2 h-4 w-4" />
                  Course Registration
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* GPA Chart Placeholder */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            GPA Trend Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {studentGpas.length > 0 ? (
              <p>GPA chart visualization will be available soon.</p>
            ) : (
              <p>No GPA data available for chart visualization.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Academic Performance Summary */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SummaryIcon className="h-5 w-5 text-primary" />
            Academic Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg ${
                gpaStatus?.color || "bg-muted/30 text-muted-foreground border border-border/60"
              }`}
            >
              <h5 className="font-semibold mb-2">
                {gpaStatus?.status || "No CGPA available"} -{" "}
                {gpaStatus?.description || "No academic performance data yet."}
              </h5>
              <p className="text-sm">
                Your academic journey so far:{" "}
                <strong>{studentGpas.length}</strong> semesters completed with a
                cumulative GPA of <strong>{formatGpa(overallCGPA)}</strong>. You
                have earned <strong>{passedCredits}</strong> credits out of{" "}
                <strong>{totalCredits}</strong>
                attempted ({completionPercentage != null && isFinite(completionPercentage) ? completionPercentage.toFixed(1) : '0.0'}% completion rate).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

