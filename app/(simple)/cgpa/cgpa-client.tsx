"use client";

import { useEffect, useState } from "react";
import { useUserData } from "@/hooks/useUserData";
import { CgpaDashboard } from "./components/cgpa-dashboard";
import { CgpaError } from "./error";

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

interface CgpaData {
  student: Student;
  studentGpas: StudentGpa[];
  studentResults: StudentResult[];
  userData: any;
}

interface CgpaClientProps {
  token: string;
  role: string;
  userId: string;
  userData: any;
}

export function CgpaClient({
  token,
  role,
  userId,
  userData: serverUserData,
}: CgpaClientProps) {
  const { userData: clientUserData, isLoading: userLoading } = useUserData();
  const [data, setData] = useState<CgpaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | Error | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Use student ID from context
        const studentId = clientUserData?.student_id;
        if (!studentId) {
          throw new Error("Student ID not found in user data");
        }

        // Prepare headers for API calls
        const headers = {
          "Content-Type": "application/json",
        };

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

        // Get student GPAs by student ID
        const gpaResponse = await fetch(
          `${API_URL}/api/studentgpa/studentid/${studentId}`,
          { headers, credentials: "include" }
        );

        if (!gpaResponse.ok) {
          throw new Error("Failed to fetch GPA data");
        }

        const studentGpas = await gpaResponse.json();

        // Get student course registrations
        const coursesResponse = await fetch(
          `${API_URL}/api/studentcourse?student_id=${studentId}`,
          { headers, credentials: "include" }
        );

        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch course data");
        }

        const allStudentCourses = await coursesResponse.json();

        // Get student results using the student-specific endpoint
        let studentResults = [];
        const resultsResponse = await fetch(
          `${API_URL}/api/studentresult/${studentId}`,
          { headers, credentials: "include" }
        );

        if (resultsResponse.ok) {
          studentResults = await resultsResponse.json();
        }

        // Create student object from context data
        const student = {
          id: parseInt(studentId),
          reg_no: clientUserData?.reg_no || "N/A",
          user: {
            id: clientUserData?.id || 0,
            first_name: clientUserData?.first_name || "",
            last_name: clientUserData?.last_name || "",
            other_name: clientUserData?.other_name,
            avatar: clientUserData?.avatar,
          },
          ...(clientUserData?.programme_id &&
            clientUserData?.programme_name && {
              programme: {
                id: clientUserData.programme_id,
                name: clientUserData.programme_name,
                ...(clientUserData?.department_id &&
                  clientUserData?.department_name && {
                    department: {
                      id: clientUserData.department_id,
                      name: clientUserData.department_name,
                    },
                  }),
              },
            }),
        };

        setData({
          student,
          studentGpas,
          studentResults,
          userData: serverUserData,
        });
      } catch (err) {
        console.error("Error loading CGPA data:", err);
        setError(err instanceof Error ? err : "Failed to load CGPA data");
      } finally {
        setLoading(false);
      }
    }

    if (!userLoading && clientUserData) {
      loadData();
    }
  }, [token, role, userId, serverUserData, userLoading, clientUserData]);

  // Show loading state
  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted/40 border-t-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your academic records...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return <CgpaError error={error} />;
  }

  // Show data
  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <CgpaDashboard
      student={data.student}
      studentGpas={data.studentGpas}
      studentResults={data.studentResults}
      userData={data.userData}
    />
  );
}
