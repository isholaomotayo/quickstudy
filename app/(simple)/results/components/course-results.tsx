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
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-400/50";
      case "B":
        return "bg-primary/10 text-primary border border-primary/40";
      case "C":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/50";
      case "D":
        return "bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-400/50";
      case "E":
        return "bg-muted/30 text-muted-foreground border border-border/60";
      case "F":
        return "bg-destructive/10 text-destructive border border-destructive/40";
      default:
        return "bg-muted/30 text-muted-foreground border border-border/60";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-600 dark:text-emerald-300";
    if (score >= 60) return "text-primary";
    if (score >= 50) return "text-amber-600 dark:text-amber-300";
    if (score >= 40) return "text-orange-600 dark:text-orange-300";
    return "text-destructive";
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
      <Card className="border border-border bg-card">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground">
              No Course Results Available
            </h3>
            <p className="text-sm text-muted-foreground">
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
      <Card className="bg-muted/30 border border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <Award className="h-5 w-5" />
            <span>Grading Scale</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-400/50">A</Badge>
              <span className="text-muted-foreground">70-100 (Excellent)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-primary/10 text-primary border border-primary/40">B</Badge>
              <span className="text-muted-foreground">60-69 (Very Good)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/50">C</Badge>
              <span className="text-muted-foreground">50-59 (Good)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-400/50">D</Badge>
              <span className="text-muted-foreground">45-49 (Fair)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-muted/30 text-muted-foreground border border-border/60">E</Badge>
              <span className="text-muted-foreground">40-44 (Pass)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-destructive/10 text-destructive border border-destructive/40">F</Badge>
              <span className="text-muted-foreground">0-39 (Fail)</span>
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
          <Card key={semesterKey} className="overflow-hidden border border-border bg-card">
            <CardHeader
              className="cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => toggleSemester(semesterKey)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
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
                      <div className="text-sm text-muted-foreground">Semester GPA</div>
                      <div className="text-lg font-bold text-primary">
                        {semesterGpa.current_gpa
                          ? parseFloat(String(semesterGpa.current_gpa) || "0").toFixed(2)
                          : calculatedGPA.toFixed(2)}
                      </div>
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/60">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Course Code
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Course Title
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                          Units
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                          Score
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                          Grade
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                          Points
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {semesterData.results.map((result) => (
                        <tr
                          key={result.id}
                          className="border-b border-border/40 hover:bg-muted/30"
                        >
                          <td className="py-3 px-4 font-mono text-sm text-foreground">
                            {result.studentcourse.course.code}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground">
                            {result.studentcourse.course.name}
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-muted-foreground">
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
                          <td className="py-3 px-4 text-center text-sm font-medium text-foreground">
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
                                    ? "text-emerald-600 dark:text-emerald-300"
                                    : "text-destructive"
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
