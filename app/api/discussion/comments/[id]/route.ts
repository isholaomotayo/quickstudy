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
 * PUT /api/discussion/comments/[id]
 * Update a discussion comment
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
        "Insufficient permissions to edit discussion comments",
        403
      );
    }

    const { id } = await context.params;
    const commentId = parseInt(id);
    const requestBody = await request.json();
    const { body: commentBody } = requestBody;

    if (!commentBody) {
      return NextResponse.json(
        {
          success: false,
          error: "Body is required",
        },
        { status: 400 }
      );
    }

    // Update comment
    const comment = await prisma.course_discussion_comment.update({
      where: { id: commentId },
      data: {
        body: commentBody,
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
        course_discussion_topic: {
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
        data: comment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating discussion comment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update discussion comment",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/discussion/comments/[id]
 * Delete a discussion comment
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
        "Insufficient permissions to delete discussion comments",
        403
      );
    }

    const { id } = await context.params;
    const commentId = parseInt(id);

    // Delete comment
    await prisma.course_discussion_comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Discussion comment deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting discussion comment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete discussion comment",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
