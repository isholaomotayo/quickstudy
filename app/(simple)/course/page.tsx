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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="text-sm font-medium text-red-800">
              Missing Course ID
            </h3>
            <p className="text-sm text-red-700 mt-1">
              No course ID provided in URL parameters.
            </p>
            <div className="mt-3">
              <Link href="/courses">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-700 border-red-300"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-sm font-medium text-gray-800">
              Loading Course...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center">
            <div className="text-red-600">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading course
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Failed to fetch course data. Please try again.
              </p>
              <div className="mt-3">
                <Link href="/courses">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-700 border-red-300"
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
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-red-100 text-red-700 border-red-200";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Info Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Course Overview
              </h2>
              <p className="text-gray-600 mb-6">{courseData!.description}</p>

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
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
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
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
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
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <UsersIcon className="h-4 w-4 mr-2" />
                    Forum
                  </Button>
                </Link>
              </div>
            </div>

            {/* Course Stats */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">
                  Course Code
                </div>
                <div className="text-lg font-bold text-blue-900">
                  {courseData!.code}
                </div>
              </div>

              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="text-sm text-emerald-600 font-medium">
                  Total Modules
                </div>
                <div className="text-lg font-bold text-emerald-900">
                  {courseModules.length}
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium">
                  Completed
                </div>
                <div className="text-lg font-bold text-purple-900">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Course Modules
              </h2>
              <p className="text-gray-600">
                Work through the course modules in order
              </p>
            </div>

            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
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
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
            <div className="p-6 border-b border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-900">
                Course Modules
              </h2>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Module Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    )}
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isAdmin ? "Management" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
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
                      "bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white";
                    let isDisabled = !isPublished && !isAdmin;

                    if (!isPublished && !isAdmin) {
                      buttonText = "Not Available";
                      buttonClass = "bg-gray-400 text-white cursor-not-allowed";
                    } else if (isCompleted) {
                      buttonText = "Review";
                      buttonClass =
                        "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white";
                    }

                    return (
                      <tr key={module.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {module.order}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {module.name}
                            </div>
                            {module.description &&
                              module.description.trim() && (
                                <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                  {module.description}
                                </div>
                              )}
                            {module.course_lessons &&
                              module.course_lessons.length > 0 && (
                                <div className="text-xs text-gray-400 mt-1">
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
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                                  progressPercentage
                                )}`}
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
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
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
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
                                    className="flex items-center gap-2 text-red-600"
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
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {courseModules.length}
            </div>
            <div className="text-sm text-gray-600">Total Modules</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {
                courseModules.filter(
                  (m) => m.completed || (m.progress_percentage || 0) >= 100
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {
                courseModules.filter(
                  (m) =>
                    !m.completed &&
                    (m.progress_percentage || 0) > 0 &&
                    (m.progress_percentage || 0) < 100
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {
                courseModules.filter(
                  (m) => !m.completed && (m.progress_percentage || 0) === 0
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Not Started</div>
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-sm font-medium text-gray-800">
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
