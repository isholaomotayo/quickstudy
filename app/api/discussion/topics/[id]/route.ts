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
 * GET /api/discussion/topics/[id]
 * Get a specific discussion topic with its comments
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const topicId = parseInt(params.id);

    const topic = await prisma.course_discussion_topic.findUnique({
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
        course_discussion_comment: {
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
      return createAuthErrorResponse("Discussion topic not found", 404);
    }

    // Add active status
    const now = new Date();
    const isActive =
      (!topic.start_date || topic.start_date <= now) &&
      (!topic.end_date || topic.end_date >= now);

    return createSuccessResponse(
      {
        ...topic,
        is_active: isActive,
      },
      user
    );
  } catch (error) {
    console.error("Error fetching discussion topic:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch discussion topic",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/discussion/topics/[id]
 * Update a discussion topic
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
        "Insufficient permissions to edit discussion topics",
        403
      );
    }

    const topicId = parseInt(params.id);
    const requestBody = await request.json();
    const { title, body: topicBody, start_date, end_date } = requestBody;

    // Validate date range if both provided
    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return NextResponse.json(
        {
          success: false,
          error: "start_date must be before end_date",
        },
        { status: 400 }
      );
    }

    // Update topic
    const topic = await prisma.course_discussion_topic.update({
      where: { id: topicId },
      data: {
        ...(title !== undefined && { title }),
        ...(topicBody !== undefined && { body: topicBody }),
        ...(start_date !== undefined && {
          start_date: start_date ? new Date(start_date) : null,
        }),
        ...(end_date !== undefined && {
          end_date: end_date ? new Date(end_date) : null,
        }),
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
    console.error("Error updating discussion topic:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update discussion topic",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/discussion/topics/[id]
 * Delete a discussion topic
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
        "Insufficient permissions to delete discussion topics",
        403
      );
    }

    const topicId = parseInt(params.id);

    // Delete topic
    await prisma.course_discussion_topic.delete({
      where: { id: topicId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Discussion topic deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting discussion topic:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete discussion topic",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
