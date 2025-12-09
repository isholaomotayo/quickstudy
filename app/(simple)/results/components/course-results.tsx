"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
  CheckCircle,
  XCircle,
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

interface CourseResultsProps {
  results: StudentResult[];
  gpas: StudentGPA[];
  onRefresh: () => void;
}

export function CourseResults({
  results,
  gpas,
  onRefresh,
}: CourseResultsProps) {
  const [expandedSemesters, setExpandedSemesters] = useState<Set<string>>(
    new Set()
  );

  const toggleSemester = (semesterKey: string) => {
    const newExpanded = new Set(expandedSemesters);
    if (newExpanded.has(semesterKey)) {
      newExpanded.delete(semesterKey);
    } else {
      newExpanded.add(semesterKey);
    }
    setExpandedSemesters(newExpanded);
  };

  const groupResultsBySemester = () => {
    const grouped: Record<
      string,
      {
        level: string;
        semester: string;
        results: StudentResult[];
      }
    > = {};

    results.forEach((result) => {
      const levelName = result.studentcourse?.level?.name || "Unknown Level";
      const semesterName =
        result.studentcourse?.semester?.name || "Unknown Semester";
      const semesterKey = `${levelName}-${semesterName}`;

      if (!grouped[semesterKey]) {
        grouped[semesterKey] = {
          level: levelName,
          semester: semesterName,
          results: [],
        };
      }
      grouped[semesterKey].results.push(result);
    });

    return grouped;
  };

  const getSemesterGPA = (level: string, semester: string) => {
    return gpas.find(
      (gpa) => gpa.level?.name === level && gpa.semester?.name === semester
    );
  };

  const getGradeBadgeClass = (grade: string) => {
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

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getStatusIcon = (score: number) => {
    if (score >= 40) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const groupedResults = groupResultsBySemester();

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">
              No Course Results Available
            </h3>
            <p className="text-sm text-gray-500">
              Your course results will appear here once they are published by
              your instructors.
            </p>
            <Button onClick={onRefresh} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grading Scale Reference */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Award className="h-5 w-5" />
            <span>Grading Scale</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">A</Badge>
              <span className="text-gray-600">70-100 (Excellent)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800">B</Badge>
              <span className="text-gray-600">60-69 (Very Good)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-yellow-100 text-yellow-800">C</Badge>
              <span className="text-gray-600">50-59 (Good)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-orange-100 text-orange-800">D</Badge>
              <span className="text-gray-600">45-49 (Fair)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-gray-100 text-gray-800">E</Badge>
              <span className="text-gray-600">40-44 (Pass)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-red-100 text-red-800">F</Badge>
              <span className="text-gray-600">0-39 (Fail)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results by Semester */}
      {Object.entries(groupedResults).map(([semesterKey, semesterData]) => {
        const semesterGpa = getSemesterGPA(
          semesterData.level,
          semesterData.semester
        );
        const isExpanded = expandedSemesters.has(semesterKey);
        const totalUnits = semesterData.results.reduce(
          (sum, result) => sum + result.studentcourse.course.units,
          0
        );
        const totalPoints = semesterData.results.reduce((sum, result) => {
          return (
            sum + result.studentcourse.course.units * (result.grade.point || 0)
          );
        }, 0);
        const calculatedGPA = totalUnits > 0 ? totalPoints / totalUnits : 0;

        return (
          <Card key={semesterKey} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSemester(semesterKey)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">
                      {semesterData.level} - {semesterData.semester}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {semesterData.results.length} courses
                  </Badge>
                </div>
                <div className="flex items-center space-x-4">
                  {semesterGpa && (
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Semester GPA</div>
                      <div className="text-lg font-bold text-blue-600">
                        {semesterGpa.current_gpa
                          ? parseFloat(String(semesterGpa.current_gpa) || "0").toFixed(2)
                          : calculatedGPA.toFixed(2)}
                      </div>
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          Course Code
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          Course Title
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">
                          Units
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">
                          Score
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">
                          Grade
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">
                          Points
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {semesterData.results.map((result) => (
                        <tr
                          key={result.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-mono text-sm text-gray-900">
                            {result.studentcourse.course.code}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {result.studentcourse.course.name}
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-gray-600">
                            {result.studentcourse.course.units}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`text-lg font-bold ${getScoreColor(
                                result.score
                              )}`}
                            >
                              {result.score}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              className={`text-xs ${getGradeBadgeClass(
                                result.grade.name
                              )}`}
                            >
                              {result.grade.name}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center text-sm font-medium text-gray-900">
                            {(
                              result.studentcourse.course.units *
                              (result.grade.point || 0)
                            ).toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {getStatusIcon(result.score)}
                              <span
                                className={`text-xs font-medium ${
                                  result.score >= 40
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {result.score >= 40 ? "PASS" : "FAIL"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
