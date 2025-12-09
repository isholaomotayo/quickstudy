import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateUser, createAuthErrorResponse } from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PUT /api/forum/course/posts/[id]
 * Update a course forum thread/post
 */
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "forum.edit_post")) {
      return createAuthErrorResponse(
        "Insufficient permissions to edit course forum posts",
        403
      );
    }

    const { id } = await context.params;
    const threadId = parseInt(id);
    const requestBody = await request.json();
    const { body: threadBody } = requestBody;

    if (!threadBody) {
      return NextResponse.json(
        {
          success: false,
          error: "Body is required",
        },
        { status: 400 }
      );
    }

    // Update thread
    const thread = await prisma.course_forum_thread.update({
      where: { id: threadId },
      data: {
        body: threadBody,
        updated_at: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        course_forum_topic: {
          select: {
            id: true,
            title: true,
            course_id: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: thread,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating course forum thread:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course forum thread",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/forum/course/posts/[id]
 * Delete a course forum thread/post
 */
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "forum.delete_post")) {
      return createAuthErrorResponse(
        "Insufficient permissions to delete course forum posts",
        403
      );
    }

    const { id } = await context.params;
    const threadId = parseInt(id);

    // Delete thread
    await prisma.course_forum_thread.delete({
      where: { id: threadId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course forum thread deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course forum thread:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete course forum thread",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
