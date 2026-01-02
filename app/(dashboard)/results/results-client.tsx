"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  GraduationCap, AlertCircle
} from "lucide-react";
import { CourseResults } from "./components/course-results";
import { LearningResults } from "./components/learning-results";
import { ResultsSummary } from "./components/results-summary";
import { ExportResults } from "./components/export-results";
import { useUserData } from "@/hooks/useUserData";

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

interface LearningResult {
  id: number; // This is now the student_test.id
  course_test_id: number;
  name: string;
  test_name: string;
}

export function ResultsClient() {
  const router = useRouter();
  // Map API response to LearningResult interface
  const mapLearningResults = (results: any[]): LearningResult[] => {
    if (!Array.isArray(results)) return [];
    return results.map((item) => ({
      id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
      course_test_id: item.course_test_id || 0,
      name: item.name || "",
      test_name: item.test_name || "",
    }));
  };
  const { userData } = useUserData();
  const [activeTab, setActiveTab] = useState("course");
  const [courseResults, setCourseResults] = useState<StudentResult[]>([]);
  const [learningResults, setLearningResults] = useState<LearningResult[]>([]);
  const [studentGpas, setStudentGpas] = useState<StudentGPA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (userData) {
      fetchResults();
    }
  }, [userData]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userData || !userData.student_id) {
        setError("Student information not available. Please log in again.");
        return;
      }

      // Parallelize all independent fetch calls with proper error handling
      const [courseResult, gpaResult, learningResult] = await Promise.allSettled([
        fetch(`/api/studentresult/${userData.student_id}`, {
          credentials: "include",
        }),
        fetch(`/api/studentgpa/studentid/${userData.student_id}`, {
          credentials: "include",
        }),
        fetch("/api/studenttest/new", {
          credentials: "include",
        }),
      ]);

      // Process each result independently to handle partial failures gracefully
      const errors: string[] = [];
      let hasAuthError = false;

      // Handle course results
      if (courseResult.status === "fulfilled" && courseResult.value.ok) {
        try {
          const data = await courseResult.value.json();
          setCourseResults(data || []);
        } catch (parseError) {
          console.error("Failed to parse course results:", parseError);
          errors.push("Failed to load course results");
        }
      } else {
        const status = courseResult.status === "fulfilled" 
          ? courseResult.value.status 
          : 500;
        if (status === 401) {
          hasAuthError = true;
        } else {
          console.error("Course results fetch failed:", {
            status,
            studentId: userData.student_id,
            error: courseResult.status === "rejected" ? courseResult.reason : undefined,
          });
          errors.push("Failed to load course results");
        }
      }

      // Handle GPA data
      if (gpaResult.status === "fulfilled" && gpaResult.value.ok) {
        try {
          const data = await gpaResult.value.json();
          setStudentGpas(data || []);
        } catch (parseError) {
          console.error("Failed to parse GPA data:", parseError);
          errors.push("Failed to load GPA data");
        }
      } else {
        const status = gpaResult.status === "fulfilled" 
          ? gpaResult.value.status 
          : 500;
        if (status === 401) {
          hasAuthError = true;
        } else {
          console.error("GPA fetch failed:", {
            status,
            studentId: userData.student_id,
            error: gpaResult.status === "rejected" ? gpaResult.reason : undefined,
          });
          errors.push("Failed to load GPA data");
        }
      }

      // Handle learning results
      if (learningResult.status === "fulfilled" && learningResult.value.ok) {
        try {
          const data = await learningResult.value.json();
          setLearningResults(mapLearningResults(data));
        } catch (parseError) {
          console.error("Failed to parse learning results:", parseError);
          errors.push("Failed to load learning results");
        }
      } else {
        const status = learningResult.status === "fulfilled" 
          ? learningResult.value.status 
          : 500;
        if (status === 401) {
          hasAuthError = true;
        } else {
          console.error("Learning results fetch failed:", {
            status,
            error: learningResult.status === "rejected" ? learningResult.reason : undefined,
          });
          errors.push("Failed to load learning results");
        }
      }

      // Set error state appropriately
      if (hasAuthError) {
        setError("Authentication required. Please sign in again.");
        return;
      } else if (errors.length > 0) {
        setError(errors.join("; "));
      }
    } catch (err) {
      setError("Failed to load results. Please try again.");
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchResults();
  };

  const handleExport = async (format: "pdf" | "print") => {
    setIsExporting(true);
    try {
      if (format === "pdf") {
        // For now, we'll just trigger print which can be saved as PDF
        window.print();
      } else {
        window.print();
      }
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const calculateOverallCGPA = () => {
    if (!studentGpas || !studentGpas.length) return 0;
    const latestGpa = studentGpas[studentGpas.length - 1];
    return parseFloat(String(latestGpa.cumulative_gpa) || "0");
  };

  const getClassOfDegree = (cgpa: number) => {
    if (cgpa >= 4.5) return "First Class";
    if (cgpa >= 3.5) return "Second Class Upper";
    if (cgpa >= 2.5) return "Second Class Lower";
    if (cgpa >= 1.5) return "Third Class";
    return "Pass";
  };

  const getDegreeClassColor = (cgpa: number) => {
    if (cgpa >= 4.5) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-400/50";
    if (cgpa >= 3.5) return "bg-primary/10 text-primary border border-primary/40";
    if (cgpa >= 2.5) return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/50";
    if (cgpa >= 1.5) return "bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-400/50";
    return "bg-muted/40 text-muted-foreground border border-border";
  };

  const overallCGPA = calculateOverallCGPA();
  const degreeClass = getClassOfDegree(overallCGPA);

  if (loading) {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted/40 border-t-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your results...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userData) {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              Authentication Required
            </h3>
            <p className="text-sm text-muted-foreground">
              Please log in to view your academic results.
            </p>
            <Button
              onClick={() => router.push("/signin")}
              variant="outline"
            >
              Go to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchResults} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary - only show if we have data */}
      {(courseResults.length > 0 || studentGpas.length > 0) && (
        <ResultsSummary results={courseResults} gpas={studentGpas} />
      )}

      {/* Export & Share - only show if we have data */}
      {(courseResults.length > 0 || learningResults.length > 0) && (
        <ExportResults onExport={handleExport} isExporting={isExporting} />
      )}

      {/* Results Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="course" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Course Results</span>
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center space-x-2">
            <GraduationCap className="h-4 w-4" />
            <span>Learning Results</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="course" className="space-y-4">
          <CourseResults
            results={courseResults}
            gpas={studentGpas}
            onRefresh={fetchResults}
          />
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <LearningResults results={learningResults} onRefresh={fetchResults} />
        </TabsContent>
      </Tabs>

      {/* Show message when no results are available */}
      {courseResults.length === 0 &&
        learningResults.length === 0 &&
        !loading &&
        !error && (
          <Card className="border border-border bg-card">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">
                  No Results Available
                </h3>
                <p className="text-sm text-muted-foreground">
                  You don't have any published results yet. Results will appear
                  here once they are published by your instructors.
                </p>
                <Button onClick={fetchResults} variant="outline">
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
