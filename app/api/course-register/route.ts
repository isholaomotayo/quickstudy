import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";

/**
 * GET /api/course-register
 * Get all course registration data for the authenticated student
 * Returns: student info, programme courses, registered courses, and current semester
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Only students can access this endpoint
    if (user.role !== "STUDENT") {
      return createAuthErrorResponse(
        "Access denied. Student access required.",
        403
      );
    }

    // Get student record
    const student = await prisma.student.findFirst({
      where: {
        user_id: BigInt(user.id),
        is_active: true,
      },
      select: {
        id: true,
        user_id: true,
        programme_id: true,
        semester_admitted_id: true,
        entry_level_id: true,
      },
    });

    if (!student) {
      return createAuthErrorResponse(
        "Student information not found. Please contact support.",
        404
      );
    }

    if (!student.programme_id) {
      return createAuthErrorResponse(
        "Programme information not found. Please contact support.",
        404
      );
    }

    // Fetch all data in parallel for better performance
    const [programmeCourses, studentCourses, activeSemester, levels] =
      await Promise.all([
        // Fetch all courses for the student's programme
        prisma.programme_course.findMany({
          where: {
            programme_id: student.programme_id,
          },
          include: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
                units: true,
              },
            },
            programme: {
              select: {
                id: true,
                name: true,
              },
            },
            level: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: [{ level_id: "asc" }, { semester_position: "asc" }],
        }),

        // Fetch student's registered courses
        prisma.student_course.findMany({
          where: {
            student_id: student.id,
          },
          include: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
                units: true,
              },
            },
            level: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        }),

        // Fetch current active semester
        prisma.semester.findFirst({
          where: {
            is_active: true,
          },
          select: {
            id: true,
            name: true,
            position: true,
            start_date: true,
            end_date: true,
          },
        }),

        // Fetch all levels for mapping
        prisma.level.findMany({
          select: {
            id: true,
            name: true,
          },
        }),
      ]);

    // Create a level lookup map
    const levelMap = new Map(levels.map((l) => [l.id, l.name]));

    // Prepare response data
    const responseData = {
      student: {
        id: student.id.toString(),
        programme_id: student.programme_id,
        semester_admitted_id: student.semester_admitted_id,
        entry_level_id: student.entry_level_id,
      },
      studentCourses: studentCourses.map((sc) => ({
        id: sc.id,
        course_id: sc.course_id,
        course: sc.course,
        // Use relation if available, otherwise fallback to level map
        level: sc.level
          ? sc.level
          : sc.level_id
          ? {
              id: sc.level_id,
              name: levelMap.get(sc.level_id) || `Level ${sc.level_id}`,
            }
          : null,
        approval_status: sc.approval_status,
        cleared: sc.cleared,
        created_at: sc.created_at,
      })),
      courseList: programmeCourses.map((pc) => ({
        id: pc.id,
        course: pc.course,
        programme: pc.programme,
        level_id: pc.level_id,
        level: pc.level,
        semester_position: pc.semester_position,
      })),
      currentSemester: activeSemester
        ? {
            id: activeSemester.id,
            name: activeSemester.name,
            position: activeSemester.position,
            start_date: activeSemester.start_date,
            end_date: activeSemester.end_date,
          }
        : null,
      currentSemesterId: activeSemester?.id || null,
      semesterPosition: activeSemester?.position || 1,
      currentLevelId: student.entry_level_id || null,
    };

    return createSuccessResponse(responseData, user);
  } catch (error) {
    console.error("Error fetching course registration data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course registration data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
