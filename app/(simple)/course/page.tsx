"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCourseData } from "@/lib/hooks/useCourseData";
import { Suspense } from "react";
import {
  PlayIcon,
  MessageSquareIcon,
  UsersIcon,
  VideoIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  SettingsIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModuleCreator } from "./components/ModuleCreator";
import { useState } from "react";
import {
  handleApiResponse,
  handleApiError,
} from "@/helpers/apiResponseHandler";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserData } from "@/hooks/useUserData";

interface CourseModule {
  id: number;
  course_id: number;
  name: string;
  order: number;
  description: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  course_lessons?: CourseLesson[];
  // Progress fields (now coming from API)
  progress_percentage?: number;
  completed?: boolean;
  completed_lessons_count?: number;
  total_lessons_count?: number;
  completed_lesson_ids?: number[];
}

interface CourseLesson {
  id: number;
  course_module_id: number;
  name: string;
  order: number;
  description: string;
  created_at: string;
  updated_at: string;
  content: string;
  course_tests?: {
    id: number;
    course_id: number;
    course_module_id: number;
    course_lesson_id: number;
    name: string;
    instructions: string;
    duration_mins: number;
    deadline: string;
    max_attempts: number;
    max_score: number;
    created_at: string;
    updated_at: string;
    format: string;
    published: boolean;
  }[];
  // Progress fields (now coming from API)
  completed?: boolean;
  is_current?: boolean;
  is_last_accessed?: boolean;
}

interface CourseData {
  id: number;
  programme_id: number;
  code: string;
  name: string;
  level_id: number;
  units: number;
  description: string;
  created_at: string;
  updated_at: string;
  semester_position: number;
  department_id: number;
  published: boolean;
  level?: {
    id: number;
    name: string;
    description: string;
    institution_id: number;
  };
  department?: {
    id: number;
    faculty_id: number;
    code: string;
    name: string;
    email: string;
    phone: string;
    description: string;
    created_at: string;
    updated_at: string;
  };
  course_module?: CourseModule[]; // Changed from course_modules to match API response
  // Progress fields (now coming from API for students)
  completion_percentage?: number;
  total_lessons?: number;
  completed_lessons?: number;
  student_enrolled?: boolean;
  student_completed?: boolean;
  has_result?: boolean;
  enrollment_status?: "enrolled" | "completed" | "not_enrolled";
  last_accessed_at?: string | null;
}

function CoursePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams?.get("course_id");

  const { courseData, isLoading, isError, mutate } = useCourseData(
    courseId || ""
  );

  // State for authoring modals
  const [showModuleCreator, setShowModuleCreator] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const { userData } = useUserData();
  // API Functions
  const handleCreateModule = async (moduleData: any) => {
    setIsCreatingModule(true);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const response = await fetch(`${API_URL}/api/coursemodule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(moduleData),
      });

      await handleApiResponse(
        response,
        "Module created successfully!",
        "Failed to create module"
      );

      // Refresh course data
      await mutate();
      setShowModuleCreator(false);
    } catch (error) {
      handleApiError(error, "Error creating module");
      throw error;
    } finally {
      setIsCreatingModule(false);
    }
  };

  const handleUpdateModule = async (moduleData: any) => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const response = await fetch(
        `${API_URL}/api/coursemodule/${moduleData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(moduleData),
        }
      );

      await handleApiResponse(
        response,
        "Module updated successfully!",
        "Failed to update module"
      );

      // Refresh course data
      await mutate();
      setEditingModule(null);
    } catch (error) {
      handleApiError(error, "Error updating module");
      throw error;
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this module? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const response = await fetch(`${API_URL}/api/coursemodule/${moduleId}`, {
        method: "DELETE",
        credentials: "include",
      });

      await handleApiResponse(
        response,
        "Module deleted successfully!",
        "Failed to delete module"
      );

      // Refresh course data
      await mutate();
    } catch (error) {
      handleApiError(error, "Error deleting module");
    }
  };

  const handleEditModule = (module: CourseModule) => {
    setEditingModule(module);
    setShowModuleCreator(true);
  };

  if (!courseId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="text-sm font-medium text-destructive">
              Missing Course ID
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              No course ID provided in URL parameters.
            </p>
            <div className="mt-3">
              <Link href="/courses">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/40"
                >
                  Back to Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted/40 border-t-primary mx-auto mb-4"></div>
            <h3 className="text-sm font-medium text-foreground">
              Loading Course...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !courseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center">
            <div className="text-destructive">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-destructive">
                Error loading course
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Failed to fetch course data. Please try again.
              </p>
              <div className="mt-3">
                <Link href="/courses">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/40"
                  >
                    Back to Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const courseModules = courseData?.course_module || []; // Changed from course_modules to match API response

  // TODO: Implement proper role checking with client-side auth
  // For now, assuming admin access for development

  const isAdmin =
    userData?.role === "ADMIN" ||
    userData?.role === "SUPERADMIN" ||
    userData?.role === "HOD" ||
    userData?.role === "STAFF";

  // Helper functions
  const getPublishStatusColor = (published: boolean) => {
    return published
      ? "bg-primary/10 text-primary border-primary/30"
      : "bg-destructive/10 text-destructive border-destructive/30";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-emerald-500";
    if (percentage >= 50) return "bg-amber-400";
    return "bg-primary";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Info Section */}
        <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Course Overview
              </h2>
              <p className="text-muted-foreground mb-6">{courseData!.description}</p>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                {/* Live Classroom link */}
                <Link
                  href={`/lms/webinar-v2?roomName=${encodeURIComponent(
                    courseData!.code + " " + courseData!.name
                  )}&userInfo=${encodeURIComponent(
                    "User Name"
                  )}&courseCode=${encodeURIComponent(
                    courseData!.code
                  )}&courseName=${encodeURIComponent(
                    courseData!.name
                  )}&courseId=${encodeURIComponent(
                    courseData!.id
                  )}&provider=googlemeet`}
                  target="_blank"
                >
                  <Button
                    variant="outline"
                    className="bg-gradient-to-r from-primary to-emerald-500 hover:brightness-110 text-primary-foreground"
                    size="sm"
                  >
                    <VideoIcon className="h-4 w-4 mr-2" />
                    Live Classroom
                  </Button>
                </Link>

                <Link
                  href={`/connect?course=${
                    courseData!.id
                  }&tab=discussions&courseName=${encodeURIComponent(
                    courseData!.name
                  )}`}
                >
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-muted/40"
                    size="sm"
                  >
                    <MessageSquareIcon className="h-4 w-4 mr-2" />
                    Discussions
                  </Button>
                </Link>

                <Link
                  href={`/connect?course=${
                    courseData!.id
                  }&tab=forum&courseName=${encodeURIComponent(
                    courseData!.name
                  )}`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-muted/40"
                  >
                    <UsersIcon className="h-4 w-4 mr-2" />
                    Forum
                  </Button>
                </Link>
              </div>
            </div>

            {/* Course Stats */}
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4 border border-border/60">
                <div className="text-sm text-muted-foreground font-medium">
                  Course Code
                </div>
                <div className="text-lg font-bold text-foreground">
                  {courseData!.code}
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 border border-border/60">
                <div className="text-sm text-muted-foreground font-medium">
                  Total Modules
                </div>
                <div className="text-lg font-bold text-foreground">
                  {courseModules.length}
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 border border-border/60">
                <div className="text-sm text-muted-foreground font-medium">
                  Completed
                </div>
                <div className="text-lg font-bold text-foreground">
                  {
                    courseModules.filter(
                      (m) => m.completed || (m.progress_percentage || 0) >= 100
                    ).length
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Modules Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Course Modules
              </h2>
              <p className="text-muted-foreground">
                Work through the course modules in order
              </p>
            </div>

            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-primary to-emerald-500 hover:brightness-110 text-primary-foreground"
                onClick={() => {
                  setEditingModule(null);
                  setShowModuleCreator(true);
                }}
                disabled={isCreatingModule}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                {isCreatingModule ? "Creating..." : "Add Module"}
              </Button>
            )}
          </div>

          {/* Course Modules Table - Server-rendered */}
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border shadow-lg">
            <div className="p-6 border-b border-border/60">
              <h2 className="text-xl font-semibold text-foreground">
                Course Modules
              </h2>
            </div>

            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-border/60">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Module Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Progress
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                    )}
                    <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {isAdmin ? "Management" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border/60">
                  {courseModules.map((module) => {
                    const progressPercentage = module.progress_percentage || 0;
                    const isCompleted =
                      module.completed || progressPercentage >= 100;
                    const completedLessons =
                      module.completed_lessons_count || 0;
                    const totalLessons =
                      module.total_lessons_count ||
                      module.course_lessons?.length ||
                      0;
                    const isPublished = module.published;

                    let buttonText = "Launch";
                    let buttonClass =
                      "bg-gradient-to-r from-primary to-emerald-500 hover:brightness-110 text-primary-foreground";
                    let isDisabled = !isPublished && !isAdmin;

                    if (!isPublished && !isAdmin) {
                      buttonText = "Not Available";
                      buttonClass = "bg-muted text-muted-foreground cursor-not-allowed";
                    } else if (isCompleted) {
                      buttonText = "Review";
                      buttonClass =
                        "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 text-primary-foreground";
                    }

                    return (
                      <tr key={module.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/30"
                          >
                            {module.order}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-semibold text-foreground">
                              {module.name}
                            </div>
                            {module.description &&
                              module.description.trim() && (
                                <div className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
                                  {module.description}
                                </div>
                              )}
                            {module.course_lessons &&
                              module.course_lessons.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {module.course_lessons.length} lesson
                                  {module.course_lessons.length > 1 ? "s" : ""}
                                </div>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-center">
                            <div className="text-sm font-medium">
                              {totalLessons > 0
                                ? `${completedLessons}/${totalLessons}`
                                : "No lessons"}
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mt-1">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                                  progressPercentage
                                )}`}
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {progressPercentage}%
                            </div>
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <Badge
                              variant="outline"
                              className={getPublishStatusColor(
                                module.published
                              )}
                            >
                              {module.published ? "Published" : "Draft"}
                            </Badge>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={{
                                pathname: "/course-viewer",
                                query: {
                                  course_id: courseData.id,
                                  course_module_id: module.id,
                                },
                              }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className={buttonClass}
                                disabled={isDisabled}
                              >
                                <PlayIcon className="h-3 w-3 mr-1" />
                                {buttonText}
                              </Button>
                            </Link>

                            {isAdmin && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-border text-foreground hover:bg-muted/40"
                                  >
                                    <SettingsIcon className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditModule(module)}
                                    className="flex items-center gap-2"
                                  >
                                    <EditIcon className="h-4 w-4" />
                                    Edit Module
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteModule(module.id)
                                    }
                                    className="flex items-center gap-2 text-destructive"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                    Delete Module
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {courseModules.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Modules</div>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-emerald-500">
              {
                courseModules.filter(
                  (m) => m.completed || (m.progress_percentage || 0) >= 100
                ).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">
              {
                courseModules.filter(
                  (m) =>
                    !m.completed &&
                    (m.progress_percentage || 0) > 0 &&
                    (m.progress_percentage || 0) < 100
                ).length
              }
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-muted-foreground">
              {
                courseModules.filter(
                  (m) => !m.completed && (m.progress_percentage || 0) === 0
                ).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Not Started</div>
          </div>
        </div>
      </main>

      {/* Module Creator Modal */}
      {showModuleCreator && (
        <ModuleCreator
          courseId={parseInt(courseId)}
          existingModules={courseModules}
          initialData={editingModule || undefined}
          open={showModuleCreator}
          onClose={() => {
            setShowModuleCreator(false);
            setEditingModule(null);
          }}
          onSave={editingModule ? handleUpdateModule : handleCreateModule}
          isEditing={!!editingModule}
        />
      )}
    </div>
  );
}

export default function CoursePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted/40 border-t-primary mx-auto mb-4"></div>
              <h3 className="text-sm font-medium text-foreground">
                Loading Course...
              </h3>
            </div>
          </div>
        </div>
      }
    >
      <CoursePageContent />
    </Suspense>
  );
}
