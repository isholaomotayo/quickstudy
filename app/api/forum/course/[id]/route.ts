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
 * GET /api/forum/course/[id]
 * Get a specific course forum topic with its threads
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const topicId = parseInt(params.id);

    const topic = await prisma.course_forum_topic.findUnique({
      where: { id: topicId },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        course_forum_thread: {
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
          orderBy: { created_at: "asc" },
        },
      },
    });

    if (!topic) {
      return createAuthErrorResponse("Course forum topic not found", 404);
    }

    return createSuccessResponse(topic, user);
  } catch (error) {
    console.error("Error fetching course forum topic:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course forum topic",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/forum/course/[id]
 * Update a course forum topic
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "forum.edit_topic")) {
      return createAuthErrorResponse(
        "Insufficient permissions to edit course forum topics",
        403
      );
    }

    const topicId = parseInt(params.id);
    const body = await request.json();
    const { title, description } = body;

    // Update topic
    const topic = await prisma.course_forum_topic.update({
      where: { id: topicId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
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
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return createSuccessResponse(topic, user);
  } catch (error) {
    console.error("Error updating course forum topic:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course forum topic",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/forum/course/[id]
 * Delete a course forum topic
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "forum.delete_topic")) {
      return createAuthErrorResponse(
        "Insufficient permissions to delete course forum topics",
        403
      );
    }

    const topicId = parseInt(params.id);

    // Delete topic
    await prisma.course_forum_topic.delete({
      where: { id: topicId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course forum topic deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course forum topic:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete course forum topic",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
