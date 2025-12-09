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
  GraduationCap,
  Eye,
  FileText,
  ArrowRight,
} from "lucide-react";
import { GpaChart } from "./gpa-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  classdegree?: {
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
  const [selectedSemester, setSelectedSemester] = useState<string>("all");

  // Calculate overall CGPA
  const overallCGPA = useMemo(() => {
    if (!studentGpas || !studentGpas.length) return 0;
    const latestGpa = studentGpas[studentGpas.length - 1];
    return parseFloat(latestGpa.cumulative_gpa.toString()) || 0;
  }, [studentGpas]);

  // Calculate current semester GPA
  const currentGPA = useMemo(() => {
    if (!studentGpas || !studentGpas.length) return 0;
    const currentGpa = studentGpas[studentGpas.length - 1];
    return parseFloat(currentGpa.current_gpa.toString()) || 0;
  }, [studentGpas]);

  // Calculate GPA trend
  const gpaTrend = useMemo(() => {
    if (studentGpas.length < 2) return null;

    const recent = studentGpas.slice(-2);
    const trend = recent[1].cumulative_gpa - recent[0].cumulative_gpa;

    if (trend > 0.1)
      return { direction: "up", color: "success", icon: TrendingUp };
    if (trend < -0.1)
      return { direction: "down", color: "destructive", icon: TrendingDown };
    return { direction: "stable", color: "warning", icon: Minus };
  }, [studentGpas]);

  // Get GPA status
  const getGPAStatus = (gpa: number) => {
    if (gpa >= 4.5)
      return {
        status: "First Class",
        color: "bg-green-100 text-green-800",
        bgColor: "bg-green-500",
        icon: Trophy,
        description: "Excellent academic performance",
        badgeVariant: "default" as const,
      };
    if (gpa >= 3.5)
      return {
        status: "Second Class Upper",
        color: "bg-blue-100 text-blue-800",
        bgColor: "bg-blue-500",
        icon: Star,
        description: "Very good academic performance",
        badgeVariant: "default" as const,
      };
    if (gpa >= 2.5)
      return {
        status: "Second Class Lower",
        color: "bg-cyan-100 text-cyan-800",
        bgColor: "bg-cyan-500",
        icon: Award,
        description: "Good academic performance",
        badgeVariant: "secondary" as const,
      };
    if (gpa >= 1.5)
      return {
        status: "Third Class",
        color: "bg-yellow-100 text-yellow-800",
        bgColor: "bg-yellow-500",
        icon: AlertTriangle,
        description: "Satisfactory academic performance",
        badgeVariant: "outline" as const,
      };
    return {
      status: "Pass",
      color: "bg-red-100 text-red-800",
      bgColor: "bg-red-500",
      icon: AlertTriangle,
      description: "Minimum academic performance",
      badgeVariant: "destructive" as const,
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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-white/20">
                <AvatarImage src={student?.user?.avatar} alt="Student Avatar" />
                <AvatarFallback className="bg-white/20 text-white text-lg font-semibold">
                  {student?.user?.first_name?.[0]}
                  {student?.user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  {student?.user?.last_name}, {student?.user?.first_name}{" "}
                  {student?.user?.other_name}
                </h2>
                <p className="text-blue-100">Student ID: {student?.reg_no}</p>
                <p className="text-blue-100 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {student?.programme?.department?.name || "N/A"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm mb-2">Cumulative GPA</p>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold">
                  {overallCGPA.toFixed(2)}
                </span>
                {gpaTrend && (
                  <div className="flex items-center gap-1 text-sm">
                    <gpaTrend.icon className="h-4 w-4" />
                    <span>
                      {gpaTrend.direction === "up"
                        ? "Improving"
                        : gpaTrend.direction === "down"
                        ? "Declining"
                        : "Stable"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current GPA</p>
                <p className="text-2xl font-bold text-green-600">
                  {currentGPA.toFixed(2)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Credits
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {passedCredits}
                </p>
                <p className="text-xs text-gray-500">of {totalCredits}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <Progress value={completionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Academic Standing
                </p>
                <p className="text-lg font-bold text-yellow-600">
                  {gpaStatus.status}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <gpaStatus.icon className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Semesters</p>
                <p className="text-2xl font-bold text-gray-600">
                  {studentGpas.length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-gray-600" />
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
                        studentgpa.current_gpa || 0
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
                            <span className="text-lg font-bold text-green-600">
                              {studentgpa.current_gpa
                                ? parseFloat(
                                    studentgpa.current_gpa.toString()
                                  ).toFixed(2)
                                : "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-lg font-bold text-blue-600">
                              {studentgpa.cumulative_gpa
                                ? parseFloat(
                                    studentgpa.cumulative_gpa.toString()
                                  ).toFixed(2)
                                : "N/A"}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {studentgpa.current_tnu || 0}
                          </TableCell>
                          <TableCell>
                            {studentgpa.classdegree ? (
                              <Badge variant={semesterStatus.badgeVariant}>
                                {studentgpa.classdegree.name}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={semesterStatus.badgeVariant}>
                              {semesterStatus.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-gray-500">
                          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                GPA Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    Current Semester
                  </span>
                  <span className="font-bold text-green-600">
                    {currentGPA.toFixed(2)}
                  </span>
                </div>
                <Progress value={currentGPA * 20} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Cumulative GPA</span>
                  <span className="font-bold text-blue-600">
                    {overallCGPA.toFixed(2)}
                  </span>
                </div>
                <Progress value={overallCGPA * 20} className="h-2" />
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
                <a href="/results">
                  <Eye className="mr-2 h-4 w-4" />
                  View Course Results
                </a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/course-register">
                  <FileText className="mr-2 h-4 w-4" />
                  Course Registration
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* GPA Chart */}
      <GpaChart studentGpas={studentGpas} />

      {/* Academic Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <gpaStatus.icon className="h-5 w-5" />
            Academic Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${gpaStatus.color}`}>
              <h5 className="font-semibold mb-2">
                {gpaStatus.status} - {gpaStatus.description}
              </h5>
              <p className="text-sm">
                Your academic journey so far:{" "}
                <strong>{studentGpas.length}</strong> semesters completed with a
                cumulative GPA of <strong>{overallCGPA.toFixed(2)}</strong>. You
                have earned <strong>{passedCredits}</strong> credits out of{" "}
                <strong>{totalCredits}</strong>
                attempted ({completionPercentage.toFixed(1)}% completion rate).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
