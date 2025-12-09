import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
  hasInstitutionAccess,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/forum/topics/[id]
 * Get a specific forum topic with its threads
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const topicId = parseInt(params.id);

    const topic = await prisma.school_forum_topic.findUnique({
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
        school_forum_thread: {
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
      return createAuthErrorResponse("Forum topic not found", 404);
    }

    // Check institution access
    if (topic.institution_id !== user.institution_id.toString()) {
      return createAuthErrorResponse("Access denied to this forum topic", 403);
    }

    return createSuccessResponse(topic, user);
  } catch (error) {
    console.error("Error fetching forum topic:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch forum topic",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/forum/topics/[id]
 * Update a forum topic
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
        "Insufficient permissions to edit forum topics",
        403
      );
    }

    const topicId = parseInt(params.id);
    const body = await request.json();

    // Check topic exists and user has access
    const existingTopic = await prisma.school_forum_topic.findUnique({
      where: { id: topicId },
    });

    if (!existingTopic) {
      return createAuthErrorResponse("Forum topic not found", 404);
    }

    if (existingTopic.institution_id !== user.institution_id.toString()) {
      return createAuthErrorResponse("Access denied to this forum topic", 403);
    }

    const { title, body: topicBody } = body;

    // Update topic
    const topic = await prisma.school_forum_topic.update({
      where: { id: topicId },
      data: {
        ...(title !== undefined && { title }),
        ...(topicBody !== undefined && { body: topicBody }),
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

    return createSuccessResponse(topic, user);
  } catch (error) {
    console.error("Error updating forum topic:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update forum topic",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/forum/topics/[id]
 * Delete a forum topic and its threads
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
        "Insufficient permissions to delete forum topics",
        403
      );
    }

    const topicId = parseInt(params.id);

    // Check topic exists and user has access
    const existingTopic = await prisma.school_forum_topic.findUnique({
      where: { id: topicId },
    });

    if (!existingTopic) {
      return createAuthErrorResponse("Forum topic not found", 404);
    }

    if (existingTopic.institution_id !== user.institution_id.toString()) {
      return createAuthErrorResponse("Access denied to this forum topic", 403);
    }

    // Delete topic (threads will be deleted by cascade if configured)
    await prisma.school_forum_topic.delete({
      where: { id: topicId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Forum topic deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting forum topic:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete forum topic",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
