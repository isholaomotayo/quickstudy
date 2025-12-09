import { Suspense } from "react";
import { AssignmentManager } from "@/app/(dashboard)/immersive-test/components/AssignmentManager";

interface AssignmentsPageProps {
  searchParams: Promise<{
    course_id?: string;
    course_module_id?: string;
    course_lesson_id?: string;
  }>;
}

async function AssignmentsPage({ searchParams }: AssignmentsPageProps) {
  const params = await searchParams;
  const courseId = params.course_id ? parseInt(params.course_id) : undefined;
  const courseModuleId = params.course_module_id
    ? parseInt(params.course_module_id)
    : undefined;
  const courseLessonId = params.course_lesson_id
    ? parseInt(params.course_lesson_id)
    : undefined;

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading assignments...</div>}>
        <AssignmentManager
          courseId={courseId}
          courseModuleId={courseModuleId}
          courseLessonId={courseLessonId}
        />
      </Suspense>
    </div>
  );
}

export default AssignmentsPage;

export async function generateMetadata() {
  return {
    title: "Assignment Management - iLearn",
    description: "Manage assignments and grade student submissions",
  };
}
