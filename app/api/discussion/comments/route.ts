import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

/**
 * GET /api/discussion/comments
 * Get discussion comments for a specific topic
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { searchParams } = new URL(request.url);
    const topic_id = searchParams.get("topic_id");

    if (!topic_id) {
      return NextResponse.json(
        {
          success: false,
          error: "topic_id is required",
        },
        { status: 400 }
      );
    }

    const comments = await prisma.course_discussion_comment.findMany({
      where: {
        course_discussion_topic_id: parseInt(topic_id),
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
            start_date: true,
            end_date: true,
          },
        },
      },
      orderBy: { created_at: "asc" },
    });

    return createSuccessResponse(comments, user);
  } catch (error) {
    console.error("Error fetching discussion comments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch discussion comments",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/discussion/comments
 * Create a new discussion comment
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "forum.create_post")) {
      return createAuthErrorResponse(
        "Insufficient permissions to create discussion comments",
        403
      );
    }

    const requestBody = await request.json();
    const { course_discussion_topic_id, body: commentBody } = requestBody;

    // Validate required fields
    if (!course_discussion_topic_id || !commentBody) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: course_discussion_topic_id, body",
        },
        { status: 400 }
      );
    }

    // Check if topic exists and is active
    const topic = await prisma.course_discussion_topic.findUnique({
      where: { id: parseInt(course_discussion_topic_id) },
      select: {
        id: true,
        start_date: true,
        end_date: true,
      },
    });

    if (!topic) {
      return createAuthErrorResponse("Discussion topic not found", 404);
    }

    // Check if discussion is active (within date range)
    const now = new Date();
    const isActive =
      (!topic.start_date || topic.start_date <= now) &&
      (!topic.end_date || topic.end_date >= now);

    if (!isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Discussion is not active (outside date range)",
        },
        { status: 403 }
      );
    }

    // Create discussion comment
    const comment = await prisma.course_discussion_comment.create({
      data: {
        course_discussion_topic_id: parseInt(course_discussion_topic_id),
        body: commentBody,
        user_id: parseInt(user.id),
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

    return createSuccessResponse(comment, user);
  } catch (error) {
    console.error("Error creating discussion comment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create discussion comment",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
