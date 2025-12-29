"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClockIcon, UserIcon, Search } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isAdmin] = useState(true); // TODO: Replace with actual admin check from auth context

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch courses data from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
        const courses = await api.get(`/api/course?pgsize=${itemsPerPage}&pg=${currentPage}${searchParam}`);
  
        // API returns courses array directly (api.get already unwraps the response)
        // Ensure we have an array
        const coursesArray = Array.isArray(courses) ? courses : [];
        
        // Calculate pagination from data length (API doesn't return total count yet)
        setTotalCourses(coursesArray.length);
        // For now, assume we have more pages if we got a full page of results
        setTotalPages(coursesArray.length === itemsPerPage ? currentPage + 1 : currentPage);

        // Transform the data to match our interface
        const transformedCourses: Course[] = coursesArray.map((course: any) => ({
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
  }, [currentPage, itemsPerPage, debouncedSearch]);
  const getStatusColor = (status: Course["status"]) => {
    switch (status) {
      case "Available":
        return "bg-primary/10 text-primary border-primary/30";
      case "Full":
        return "bg-destructive/10 text-destructive border-destructive/30";
      case "Waitlist":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-400/30";
      default:
        return "bg-muted/40 text-foreground border-border";
    }
  };

  const getPublishStatusColor = (publishStatus: Course["publishStatus"]) => {
    switch (publishStatus) {
      case "Published":
        return "bg-primary/10 text-primary border-primary/30";
      case "Not Published":
        return "bg-destructive/10 text-destructive border-destructive/30";
      case "Pending":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-400/30";
      default:
        return "bg-muted/40 text-foreground border-border";
    }
  };

  const columns = [
    {
      key: "code",
      header: "Course Code",
      sortable: true,
      className: "font-mono font-medium",
      render: (course: Course) => (
        <div className="font-mono font-semibold text-primary">
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
          <div className="font-semibold text-foreground">
            {course.name || course.title || "Untitled Course"}
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
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
            <div className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
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
          className="bg-primary/10 text-primary border-primary/30"
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
            <div className="w-full bg-muted rounded-full h-2 mt-1">
              <div
                className="bg-gradient-to-r from-primary to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
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
          "cursor-pointer bg-gradient-to-r from-primary to-emerald-500 hover:brightness-110 text-primary-foreground";
        let isDisabled = course.publishStatus !== "Published";

        if (course.publishStatus !== "Published") {
          buttonText = "Not Available";
          buttonClass = "bg-muted text-muted-foreground cursor-not-allowed";
          isDisabled = true;
        } else if (hasResult) {
          buttonText = "View Result";
          buttonClass =
            "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 text-primary-foreground";
        } else if (isCompleted) {
          buttonText = "Completed";
          buttonClass =
            "cursor-pointer bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 text-primary-foreground";
        } else if (isEnrolled) {
          buttonText = "Continue";
          buttonClass =
            "cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-primary-foreground";
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
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Available Courses
        </h2>
        <p className="text-muted-foreground">
          Browse and enroll in courses for the current semester
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted/50 border-t-primary"></div>
          <span className="ml-3 text-muted-foreground">Loading courses...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="text-destructive">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-destructive">
                Error loading courses
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Courses Table */}
      {!loading && !error && (
        <>
          {/* Search Input */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search courses by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            {debouncedSearch && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing results for "{debouncedSearch}"
              </p>
            )}
          </div>

          {coursesData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card/80 backdrop-blur-sm rounded-2xl border border-border">
              <div className="text-lg font-medium text-foreground mb-2">No courses available</div>
              <div className="text-sm">
                {debouncedSearch 
                  ? `No courses match "${debouncedSearch}". Try a different search term.`
                  : "There are no courses available at the moment. Please check back later."}
              </div>
            </div>
          ) : (
            <ModernTable
              data={coursesData}
              columns={columns}
              searchable={false}
              onRowClick={(item: Course) => setSelectedCourse(item)}
              className="animate-fade-in"
            />
          )}

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-6 mt-6 bg-card/50 rounded-lg border border-border">
              <div className="text-sm font-medium text-foreground">
                Showing <span className="text-primary">{totalCourses > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - 
                <span className="text-primary">{Math.min(currentPage * itemsPerPage, totalCourses)}</span> of 
                <span className="text-primary"> {totalCourses}</span> courses
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-border rounded-md px-3 py-1 text-sm bg-background"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {totalCourses || coursesData.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Courses</div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {
                  coursesData.filter(
                    (c) =>
                      !c.student_enrolled && c.publishStatus === "Published"
                  ).length
                }
              </div>
              <div className="text-sm text-muted-foreground">Available to Start</div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4 text-center">
              <div className="text-2xl font-bold text-amber-500">
                {
                  coursesData.filter(
                    (c) => c.student_enrolled && !c.student_completed
                  ).length
                }
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4 text-center">
              <div className="text-2xl font-bold text-emerald-500">
                {coursesData.filter((c) => c.student_completed).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
