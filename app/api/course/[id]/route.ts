import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/course/[id]
 * Get a specific course by ID
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { id } = await context.params;
    const courseId = parseInt(id);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        programme: true,
        level: true,
        department: true,
        course_module: {
          include: {
            course_lesson: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        staff_course: {
          include: {
            staff: {
              include: {
                user_staff_user_idTouser: {
                  select: {
                    first_name: true,
                    last_name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      return createAuthErrorResponse("Course not found", 404);
    }

    return createSuccessResponse(course, user);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/course/[id]
 * Update a course
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "courses.edit")) {
      return createAuthErrorResponse("Insufficient permissions to update courses", 403);
    }

    const courseId = parseInt(params.id);
    const body = await request.json();

    const {
      code,
      name,
      units,
      description,
      programme_id,
      level_id,
      department_id,
      semester_position,
      published,
    } = body;

    // Update course
    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(code !== undefined && { code }),
        ...(name !== undefined && { name }),
        ...(units !== undefined && { units: parseInt(units) }),
        ...(description !== undefined && { description }),
        ...(programme_id !== undefined && { programme_id: programme_id ? parseInt(programme_id) : null }),
        ...(level_id !== undefined && { level_id: level_id ? parseInt(level_id) : null }),
        ...(department_id !== undefined && { department_id: department_id ? parseInt(department_id) : null }),
        ...(semester_position !== undefined && { semester_position: semester_position ? parseInt(semester_position) : null }),
        ...(published !== undefined && { published }),
        updated_at: new Date(),
      },
      include: {
        programme: true,
        level: true,
        department: true,
        course_module: true,
      },
    });

    return createSuccessResponse(course, user);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/course/[id]
 * Delete a course
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "courses.delete")) {
      return createAuthErrorResponse("Insufficient permissions to delete courses", 403);
    }

    const courseId = parseInt(params.id);

    // Check if course has enrollments
    const enrollmentCount = await prisma.student_course.count({
      where: { course_id: courseId },
    });

    if (enrollmentCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete course with active enrollments",
        },
        { status: 400 }
      );
    }

    // Delete course
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete course",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
