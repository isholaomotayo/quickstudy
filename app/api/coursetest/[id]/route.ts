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
 * GET /api/coursetest/[id]
 * Get a specific course test with its questions
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { id } = await context.params;
    const testId = parseInt(id);

    const test = await prisma.course_test.findUnique({
      where: { id: testId },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        course_module: {
          select: {
            id: true,
            name: true,
          },
        },
        course_lesson: {
          select: {
            id: true,
            name: true,
          },
        },
        course_question: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!test) {
      return createAuthErrorResponse("Course test not found", 404);
    }

    return createSuccessResponse(test, user);
  } catch (error) {
    console.error("Error fetching course test:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course test",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/coursetest/[id]
 * Update a course test
 */
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "lms.content.edit")) {
      return createAuthErrorResponse(
        "Insufficient permissions to edit course tests",
        403
      );
    }

    const { id } = await context.params;
    const testId = parseInt(id);
    const body = await request.json();

    const {
      name,
      instructions,
      duration_mins,
      deadline,
      max_attempts,
      max_score,
      format,
      published,
    } = body;

    // Update test
    const test = await prisma.course_test.update({
      where: { id: testId },
      data: {
        ...(name !== undefined && { name }),
        ...(instructions !== undefined && { instructions }),
        ...(duration_mins !== undefined && {
          duration_mins: duration_mins ? parseInt(duration_mins) : null,
        }),
        ...(deadline !== undefined && {
          deadline: deadline ? new Date(deadline) : null,
        }),
        ...(max_attempts !== undefined && {
          max_attempts: max_attempts ? parseInt(max_attempts) : 1,
        }),
        ...(max_score !== undefined && {
          max_score: max_score ? parseInt(max_score) : 0,
        }),
        ...(format !== undefined && { format }),
        ...(published !== undefined && { published }),
        updated_at: new Date(),
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        course_module: {
          select: {
            id: true,
            name: true,
          },
        },
        course_lesson: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return createSuccessResponse(test, user);
  } catch (error) {
    console.error("Error updating course test:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course test",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/coursetest/[id]
 * Delete a course test
 */
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "lms.content.edit")) {
      return createAuthErrorResponse(
        "Insufficient permissions to delete course tests",
        403
      );
    }

    const { id } = await context.params;
    const testId = parseInt(id);

    // Check if there are student submissions
    const submissions = await prisma.student_test.count({
      where: { course_test_id: testId },
    });

    if (submissions > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete test with ${submissions} student submission(s)`,
        },
        { status: 409 }
      );
    }

    // Delete test
    await prisma.course_test.delete({
      where: { id: testId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course test deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course test:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete course test",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
