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
 * GET /api/coursemodule/[id]
 * Get a specific course module by ID
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { id } = await context.params;
    const moduleId = parseInt(id);

    const module = await prisma.course_module.findUnique({
      where: { id: moduleId },
      include: {
        course: true,
        course_lesson: {
          orderBy: { order: "asc" },
        },
        course_test: {
          include: {
            course_question: true,
          },
        },
      },
    });

    if (!module) {
      return createAuthErrorResponse("Course module not found", 404);
    }

    return createSuccessResponse(module, user);
  } catch (error) {
    console.error("Error fetching course module:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course module",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/coursemodule/[id]
 * Update a course module
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
        "Insufficient permissions to update course modules",
        403
      );
    }

    const { id } = await context.params;
    const moduleId = parseInt(id);
    const body = await request.json();

    const { name, order, description, published } = body;

    // Update module
    const module = await prisma.course_module.update({
      where: { id: moduleId },
      data: {
        ...(name !== undefined && { name }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(description !== undefined && { description }),
        ...(published !== undefined && { published }),
        updated_at: new Date(),
      },
      include: {
        course: true,
        course_lesson: {
          orderBy: { order: "asc" },
        },
      },
    });

    return createSuccessResponse(module, user);
  } catch (error) {
    console.error("Error updating course module:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course module",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/coursemodule/[id]
 * Delete a course module
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
        "Insufficient permissions to delete course modules",
        403
      );
    }

    const { id } = await context.params;
    const moduleId = parseInt(id);

    // Check if module has lessons
    const lessonCount = await prisma.course_lesson.count({
      where: { course_module_id: moduleId },
    });

    if (lessonCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete module with existing lessons. Delete lessons first.",
        },
        { status: 400 }
      );
    }

    // Delete module
    await prisma.course_module.delete({
      where: { id: moduleId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course module deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course module:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete course module",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
