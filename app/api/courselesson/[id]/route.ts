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
 * GET /api/courselesson/[id]
 * Get a specific course lesson by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const lessonId = parseInt(params.id);

    const lesson = await prisma.course_lesson.findUnique({
      where: { id: lessonId },
      include: {
        course_module: {
          include: {
            course: true,
          },
        },
        course_test: {
          include: {
            course_question: true,
          },
        },
      },
    });

    if (!lesson) {
      return createAuthErrorResponse("Course lesson not found", 404);
    }

    return createSuccessResponse(lesson, user);
  } catch (error) {
    console.error("Error fetching course lesson:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course lesson",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/courselesson/[id]
 * Update a course lesson
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
    if (!hasPermission(user.role, "lms.content.edit")) {
      return createAuthErrorResponse("Insufficient permissions to update course lessons", 403);
    }

    const lessonId = parseInt(params.id);
    const body = await request.json();

    const {
      name,
      order,
      description,
      content,
    } = body;

    // Update lesson
    const lesson = await prisma.course_lesson.update({
      where: { id: lessonId },
      data: {
        ...(name !== undefined && { name }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        updated_at: new Date(),
      },
      include: {
        course_module: {
          include: {
            course: true,
          },
        },
      },
    });

    return createSuccessResponse(lesson, user);
  } catch (error) {
    console.error("Error updating course lesson:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course lesson",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courselesson/[id]
 * Delete a course lesson
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
    if (!hasPermission(user.role, "lms.content.edit")) {
      return createAuthErrorResponse("Insufficient permissions to delete course lessons", 403);
    }

    const lessonId = parseInt(params.id);

    // Delete lesson
    await prisma.course_lesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course lesson deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course lesson:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete course lesson",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
