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
 * GET /api/coursequestion/[id]
 * Get a specific course question
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { id } = await context.params;
    const questionId = parseInt(id);

    const question = await prisma.course_question.findUnique({
      where: { id: questionId },
      include: {
        course_test: {
          select: {
            id: true,
            name: true,
            course_id: true,
          },
        },
      },
    });

    if (!question) {
      return createAuthErrorResponse("Course question not found", 404);
    }

    return createSuccessResponse(question, user);
  } catch (error) {
    console.error("Error fetching course question:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course question",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/coursequestion/[id]
 * Update a course question
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
        "Insufficient permissions to edit course questions",
        403
      );
    }

    const { id } = await context.params;
    const questionId = parseInt(id);
    const body = await request.json();

    const { question, details, options, answer, order, marks } = body;

    // Update question
    const updatedQuestion = await prisma.course_question.update({
      where: { id: questionId },
      data: {
        ...(question !== undefined && { question }),
        ...(details !== undefined && { details }),
        ...(options !== undefined && { options }),
        ...(answer !== undefined && { answer }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(marks !== undefined && { marks: parseInt(marks) }),
        updated_at: new Date(),
      },
      include: {
        course_test: {
          select: {
            id: true,
            name: true,
            course_id: true,
          },
        },
      },
    });

    return createSuccessResponse(updatedQuestion, user);
  } catch (error) {
    console.error("Error updating course question:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course question",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/coursequestion/[id]
 * Delete a course question
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
        "Insufficient permissions to delete course questions",
        403
      );
    }

    const { id } = await context.params;
    const questionId = parseInt(id);

    // Delete question
    await prisma.course_question.delete({
      where: { id: questionId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course question deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course question:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete course question",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
