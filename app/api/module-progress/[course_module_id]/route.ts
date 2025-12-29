import { NextRequest } from "next/server";
import {
  createJsonResponse,
  createAuthErrorResponse,
  authenticateUser,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";

// GET module progress
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ course_module_id: string }> }
) {
  const authResult = await authenticateUser();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;

  // Role check: STUDENT, STAFF, HOD, ADMIN, SUPERADMIN
  const allowedRoles = [
    "STUDENT",
    "STAFF",
    "HOD",
    "ADMIN",
    "SUPERADMIN",
    "LECTURER",
  ];
  if (!allowedRoles.includes(user.role)) {
    return createAuthErrorResponse("Insufficient permissions", 403);
  }
  const { course_module_id } = await params;

  try {
    // Get student_id based on role
    let student_id: bigint;

    if (user.role === "STUDENT") {
      // Get student record
      const student = await prisma.student.findFirst({
        where: { user_id: BigInt(user.id) },
      });

      if (!student) {
        return createAuthErrorResponse("Student record not found", 404);
      }

      student_id = student.id;
    } else {
      // For staff/admin, check if student_id is provided in query
      const { searchParams } = new URL(req.url);
      const queryStudentId = searchParams.get("student_id");

      if (!queryStudentId) {
        return createAuthErrorResponse(
          "student_id is required for non-student users",
          400
        );
      }

      student_id = BigInt(queryStudentId);
    }

    // Find the course module
    const module = await prisma.course_module.findUnique({
      where: { id: Number(course_module_id) },
    });

    if (!module || !module.course_id) {
      return createJsonResponse({
        completed: [],
        lastLessonId: null,
        error: "Module not found",
      });
    }

    // Try to find existing progress
    const progress = await prisma.course_progress.findFirst({
      where: {
        student_id: student_id,
        course_id: module.course_id,
      },
    });

    if (!progress) {
      return createJsonResponse({
        completed: [],
        lastLessonId: null,
      });
    }

    // Parse the progress_data JSONB field
    const progressData = (progress.progress_data as any) || {};
    const moduleData = progressData[course_module_id] || {};
    const completedLessons = moduleData.completed_lessons || [];
    const lastLessonId = progress.last_lesson_id || null;

    return createJsonResponse({
      completed: completedLessons,
      lastLessonId: lastLessonId,
    });
  } catch (error) {
    console.error("Error in getModuleProgress:", error);
    return createAuthErrorResponse("Failed to fetch module progress", 500);
  }
}

// PUT update module progress
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ course_module_id: string }> }
) {
  const authResult = await authenticateUser();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;
  const { course_module_id } = await params;

  // Only students can update their own progress (matching Fastify controller)
  if (user.role !== "STUDENT") {
    return createAuthErrorResponse("Only students can update progress", 403);
  }

  try {
    const body = await req.json();
    const {
      completed_lessons = [],
      current_lesson_id,
      last_lesson_id,
      time_spent_minutes = 0,
    } = body;

    // Get student record
    const student = await prisma.student.findFirst({
      where: { user_id: BigInt(user.id) },
    });

    if (!student) {
      return createAuthErrorResponse("Student record not found", 404);
    }

    // Get course module
    const module = await prisma.course_module.findUnique({
      where: { id: Number(course_module_id) },
    });

    if (!module || !module.course_id) {
      return createAuthErrorResponse("Course module not found", 404);
    }

    // Find or create progress record
    let progress = await prisma.course_progress.findFirst({
      where: {
        student_id: student.id,
        course_id: module.course_id,
      },
    });

    if (!progress) {
      // Create new progress record
      progress = await prisma.course_progress.create({
        data: {
          student_id: student.id,
          course_id: module.course_id,
          institution_id: user.institution_id,
          progress_data: {
            [course_module_id]: {
              completed_lessons: completed_lessons,
              last_updated: new Date().toISOString(),
            },
          },
          last_lesson_id: last_lesson_id ? Number(last_lesson_id) : null,
          current_lesson_id: current_lesson_id
            ? Number(current_lesson_id)
            : null,
        },
      });
    } else {
      // Update existing progress
      const progressData = (progress.progress_data as any) || {};
      progressData[course_module_id] = {
        completed_lessons: completed_lessons,
        last_updated: new Date().toISOString(),
      };

      // Calculate overall course progress
      const allModules = await prisma.course_module.findMany({
        where: { course_id: module.course_id },
        include: {
          course_lesson: true,
        },
      });

      let totalLessons = 0;
      let completedLessonsCount = 0;

      allModules.forEach((mod) => {
        const lessonCount = mod.course_lesson.length;
        totalLessons += lessonCount;

        const modProgress = progressData[String(mod.id)] || {};
        const modCompleted = modProgress.completed_lessons || [];
        completedLessonsCount += modCompleted.length;
      });

      const completionPercentage =
        totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;

      progress = await prisma.course_progress.update({
        where: { id: progress.id },
        data: {
          progress_data: progressData,
          last_lesson_id: last_lesson_id
            ? Number(last_lesson_id)
            : progress.last_lesson_id,
          current_lesson_id: current_lesson_id
            ? Number(current_lesson_id)
            : progress.current_lesson_id,
          completion_percentage: completionPercentage,
          completed_lessons: completedLessonsCount,
          total_lessons: totalLessons,
          last_accessed_at: new Date(),
        },
      });
    }

    return createJsonResponse({
      success: true,
      completed: completed_lessons,
      lastLessonId: last_lesson_id,
      completion_percentage: Number(progress.completion_percentage),
    });
  } catch (error: any) {
    console.error("Error updating module progress:", error);
    return createAuthErrorResponse(
      error.message || "Failed to update module progress",
      500
    );
  }
}
