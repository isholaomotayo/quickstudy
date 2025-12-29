"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCourseData } from "@/lib/hooks/useCourseData";
import CourseViewerClient from "@/app/(dashboard)/course-viewer/components/CourseViewerClient";
import CourseViewerSkeleton from "@/app/(dashboard)/course-viewer/components/CourseViewerSkeleton";
import { useEffect } from "react";

interface CourseModule {
  id: number;
  course_id: number;
  name: string;
  order: number;
  description: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  course_lesson?: CourseLesson[]; // Changed from course_lessons to match API response
  // Progress fields (coming from course page)
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
}

interface CourseViewerPageProps {
  searchParams: Promise<{
    course_module_id?: string;
    module_data?: string;
  }>;
}

export default function CourseViewerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseModuleId = searchParams?.get("course_module_id");
  const courseId = searchParams?.get("course_id");

  const {
    courseData,
    isLoading,
    isError,
    mutate: mutateCourseData,
  } = useCourseData(courseId || "");

  // Listen for course progress updates and refresh course data
  useEffect(() => {
    const handleCourseProgressUpdate = (event: CustomEvent) => {
      if (event.detail?.courseId?.toString() === courseId) {
        mutateCourseData();
      }
    };

    window.addEventListener(
      "courseProgressUpdated",
      handleCourseProgressUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "courseProgressUpdated",
        handleCourseProgressUpdate as EventListener
      );
    };
  }, [courseId, mutateCourseData]);

  if (!courseModuleId || !courseId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="text-sm font-medium text-destructive">
              Missing Parameters
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Course ID and Module ID are required.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <CourseViewerSkeleton />;
  }

  if (isError || !courseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="text-sm font-medium text-destructive">
              Error Loading Course
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Failed to fetch course data. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Find the specific module
  const courseModuleData = courseData.course_module?.find(
    (module) => module.id.toString() === courseModuleId
  );

  if (!courseModuleData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="text-sm font-medium text-destructive">
              Module Not Found
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              The requested module could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const courseLessons = courseModuleData.course_lesson || []; // Changed from course_lessons to match API response

  return (
    <CourseViewerClient
      courseModuleData={courseModuleData}
      courseLessons={courseLessons}
      courseData={courseData}
      onRefreshData={mutateCourseData}
    />
  );
}
