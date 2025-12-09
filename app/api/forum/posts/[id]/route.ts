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
 * PUT /api/forum/posts/[id]
 * Update a forum post
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "forum.edit_post")) {
      return createAuthErrorResponse(
        "Insufficient permissions to edit forum posts",
        403
      );
    }

    const postId = parseInt(params.id);
    const body = await request.json();
    const { body: postBody } = body;

    // Update post
    const post = await prisma.school_forum_thread.update({
      where: { id: postId },
      data: {
        body: postBody,
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
      },
    });

    return createSuccessResponse(post, user);
  } catch (error) {
    console.error("Error updating forum post:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update forum post",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/forum/posts/[id]
 * Delete a forum post
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "forum.delete_post")) {
      return createAuthErrorResponse(
        "Insufficient permissions to delete forum posts",
        403
      );
    }

    const postId = parseInt(params.id);

    // Delete post
    await prisma.school_forum_thread.delete({
      where: { id: postId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Forum post deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting forum post:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete forum post",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
