"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Award,
  BookOpen,
  Target,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";

interface StudentResult {
  id: number;
  score: number;
  grade: {
    name: string;
    point: number;
  };
  studentcourse: {
    course: {
      code: string;
      name: string;
      units: number;
    };
    level: {
      name: string;
    };
    semester: {
      name: string;
    };
  };
  publish: boolean;
}

interface StudentGPA {
  id: number;
  semester_gpa: number;
  current_gpa: number;
  cumulative_gpa: number;
  level: {
    name: string;
  };
  semester: {
    name: string;
  };
}

interface ResultsSummaryProps {
  results: StudentResult[];
  gpas: StudentGPA[];
}

export function ResultsSummary({ results, gpas }: ResultsSummaryProps) {
  const calculateStats = () => {
    if (!results.length) return null;

    const totalCourses = results.length;
    const totalUnits = results.reduce(
      (sum, result) => sum + (result.studentcourse.course.units || 0),
      0
    );
    const averageScore =
      results.reduce((sum, result) => sum + result.score, 0) / totalCourses;

    const gradeDistribution = results.reduce((acc, result) => {
      const grade = result.grade.name;
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const passedCourses = results.filter((result) => result.score >= 40).length;
    const failedCourses = totalCourses - passedCourses;
    const passRate = (passedCourses / totalCourses) * 100;

    const latestGpa = gpas.length > 0 ? gpas[gpas.length - 1] : null;

    return {
      totalCourses,
      totalUnits,
      averageScore: Math.round(averageScore * 100) / 100,
      gradeDistribution,
      passedCourses,
      failedCourses,
      passRate: Math.round(passRate * 100) / 100,
      latestGpa,
    };
  };

  const stats = calculateStats();

  if (!stats) {
    return null;
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800";
      case "B":
        return "bg-blue-100 text-blue-800";
      case "C":
        return "bg-yellow-100 text-yellow-800";
      case "D":
        return "bg-orange-100 text-orange-800";
      case "E":
        return "bg-gray-100 text-gray-800";
      case "F":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getClassOfDegree = (cgpa: number) => {
    if (cgpa >= 4.5)
      return { class: "First Class", color: "bg-green-100 text-green-800" };
    if (cgpa >= 3.5)
      return {
        class: "Second Class Upper",
        color: "bg-blue-100 text-blue-800",
      };
    if (cgpa >= 2.5)
      return {
        class: "Second Class Lower",
        color: "bg-yellow-100 text-yellow-800",
      };
    if (cgpa >= 1.5)
      return { class: "Third Class", color: "bg-orange-100 text-orange-800" };
    return { class: "Pass", color: "bg-gray-100 text-gray-800" };
  };

  const degreeClass = stats.latestGpa
    ? getClassOfDegree(parseFloat(String(stats.latestGpa.cumulative_gpa) || "0"))
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Courses */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm">Total Courses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">
            {stats.totalCourses}
          </div>
          <div className="text-xs text-blue-700 mt-1">
            {stats.totalUnits} Units
          </div>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-green-900">
            <Target className="h-5 w-5" />
            <span className="text-sm">Average Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {stats.averageScore}%
          </div>
          <div className="text-xs text-green-700 mt-1">
            {stats.averageScore >= 70
              ? "Excellent"
              : stats.averageScore >= 60
              ? "Very Good"
              : stats.averageScore >= 50
              ? "Good"
              : stats.averageScore >= 40
              ? "Pass"
              : "Needs Improvement"}
          </div>
        </CardContent>
      </Card>

      {/* Pass Rate */}
      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-emerald-900">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm">Pass Rate</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900">
            {stats.passRate}%
          </div>
          <div className="text-xs text-emerald-700 mt-1">
            {stats.passedCourses} passed, {stats.failedCourses} failed
          </div>
          <Progress value={stats.passRate} className="mt-2 h-2" />
        </CardContent>
      </Card>

      {/* CGPA */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-purple-900">
            <Award className="h-5 w-5" />
            <span className="text-sm">CGPA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.latestGpa ? (
            <>
              <div className="text-2xl font-bold text-purple-900">
                {parseFloat(String(stats.latestGpa.cumulative_gpa) || "0").toFixed(2)}
              </div>
              <Badge className={`mt-1 ${degreeClass?.color}`}>
                {degreeClass?.class}
              </Badge>
            </>
          ) : (
            <div className="text-sm text-purple-700">No GPA data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
