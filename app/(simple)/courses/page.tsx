"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClockIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModernTable } from "@/components/ui/modern-table";
import { api } from "@/lib/api-wrapper";

interface Course {
  id: number;
  code: string;
  name: string;
  title?: string;
  units: number;
  instructor?: string;
  schedule?: string;
  status: "Available" | "Full" | "Waitlist";
  publishStatus: "Published" | "Not Published" | "Pending";
  enrolled?: number;
  capacity?: number;
  published?: boolean;
  description?: string;
  department_id?: number;
  level_id?: number;
  // Student-specific fields
  student_enrolled?: boolean;
  student_completed?: boolean;
  has_result?: boolean;
  enrollment_status?: "enrolled" | "completed" | "not_enrolled";
  // Progress fields
  completion_percentage?: number;
  total_lessons?: number;
  completed_lessons?: number;
}

export default function CoursesPage() {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAdmin] = useState(true); // TODO: Replace with actual admin check from auth context

  // Fetch courses data from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const courses = await api.get(`/api/course`);
  
        // Transform the data to match our interface
        const transformedCourses: Course[] = courses.data.map((course: any) => ({
          id: course.id,
          code: course.code,
          name: course.name || course.title,
          title: course.title,
          units: course.units || 0,
          instructor: course.instructor || "TBA",
          schedule: course.schedule || "TBA",
          status: course.published
            ? "Available"
            : ("Not Published" as "Available" | "Full" | "Waitlist"),
          publishStatus: course.published
            ? "Published"
            : ("Not Published" as "Published" | "Not Published" | "Pending"),
          enrolled: course.enrolled || 0,
          capacity: course.capacity || 50,
          published: course.published,
          description: course.description,
          department_id: course.department_id,
          level_id: course.level_id,
          // Student enrollment data (these would come from the API if available)
          student_enrolled: course.student_enrolled || false,
          student_completed: course.student_completed || false,
          has_result: course.has_result || false,
          enrollment_status: course.enrollment_status || "not_enrolled",
          // Progress fields
          completion_percentage: course.completion_percentage || 0,
          total_lessons: course.total_lessons || 0,
          completed_lessons: course.completed_lessons || 0,
        }));

        setCoursesData(transformedCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch courses"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);
  const getStatusColor = (status: Course["status"]) => {
    switch (status) {
      case "Available":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Full":
        return "bg-red-100 text-red-700 border-red-200";
      case "Waitlist":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPublishStatusColor = (publishStatus: Course["publishStatus"]) => {
    switch (publishStatus) {
      case "Published":
        return "bg-green-100 text-green-700 border-green-200";
      case "Not Published":
        return "bg-red-100 text-red-700 border-red-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const columns = [
    {
      key: "code",
      header: "Course Code",
      sortable: true,
      className: "font-mono font-medium",
      render: (course: Course) => (
        <div className="font-mono font-semibold text-blue-700">
          {course.code || "N/A"}
        </div>
      ),
    },
    {
      key: "name",
      header: "Course Name",
      sortable: true,
      render: (course: Course) => (
        <div>
          <div className="font-semibold text-gray-900">
            {course.name || course.title || "Untitled Course"}
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <UserIcon className="h-3 w-3" />
              {course.instructor || "TBA"}
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              {course.schedule || "TBA"}
            </span>
          </div>
          {course.description && (
            <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
              {course.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "units",
      header: "Units",
      sortable: true,
      className: "text-center",
      render: (course: Course) => (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          {course.units || 0} Units
        </Badge>
      ),
    },
    {
      key: "publishStatus",
      header: "Status",
      sortable: true,
      render: (course: Course) => (
        <Badge
          variant="outline"
          className={getPublishStatusColor(course.publishStatus)}
        >
          {course.publishStatus}
        </Badge>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      sortable: true,
      render: (course: Course) => {
        const completionPercentage = course.completion_percentage || 0;
        const completedLessons = course.completed_lessons || 0;
        const totalLessons = course.total_lessons || 0;

        return (
          <div className="text-center">
            <div className="text-sm font-medium">
              {totalLessons > 0
                ? `${completedLessons}/${totalLessons}`
                : "Not Started"}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {completionPercentage}%
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (course: Course) => {
        // Use the actual enrollment data from the API
        const isEnrolled = course.student_enrolled || false;
        const isCompleted = course.student_completed || false;
        const hasResult = course.has_result || false;

        let buttonText = "Start Course";
        let buttonClass =
          "cursor-pointer bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white";
        let isDisabled = course.publishStatus !== "Published";

        if (course.publishStatus !== "Published") {
          buttonText = "Not Available";
          buttonClass = "bg-gray-400 text-white cursor-not-allowed";
          isDisabled = true;
        } else if (hasResult) {
          buttonText = "View Result";
          buttonClass =
            "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white";
        } else if (isCompleted) {
          buttonText = "Completed";
          buttonClass =
            "cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white";
        } else if (isEnrolled) {
          buttonText = "Continue";
          buttonClass =
            "cursor-pointer bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white";
        }

        return (
          <Button
            variant="outline"
            size="sm"
            className={buttonClass}
            disabled={isDisabled}
            onClick={() => {
              // Handle course action based on status
              router.push(`/course?course_id=${course.id}`);
            }}
          >
            {buttonText}
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Available Courses
        </h2>
        <p className="text-gray-600">
          Browse and enroll in courses for the current semester
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading courses...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="text-red-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading courses
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Courses Table */}
      {!loading && !error && (
        <>
          <ModernTable
            data={coursesData}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search courses, instructors, or codes..."
            onRowClick={(item: Course) => setSelectedCourse(item)}
            className="animate-fade-in"
          />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {coursesData.length}
              </div>
              <div className="text-sm text-gray-600">Total Courses</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {
                  coursesData.filter(
                    (c) =>
                      !c.student_enrolled && c.publishStatus === "Published"
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Available to Start</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {
                  coursesData.filter(
                    (c) => c.student_enrolled && !c.student_completed
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {coursesData.filter((c) => c.student_completed).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
