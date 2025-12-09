import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

/**
 * GET /api/forum/course/posts
 * Get course forum threads/posts for a specific topic
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

    const threads = await prisma.course_forum_thread.findMany({
      where: {
        course_forum_topic_id: parseInt(topic_id),
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
      orderBy: { created_at: "asc" },
    });

    return createSuccessResponse(threads, user);
  } catch (error) {
    console.error("Error fetching course forum threads:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course forum threads",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/forum/course/posts
 * Create a new course forum thread/post
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
        "Insufficient permissions to create course forum posts",
        403
      );
    }

    const body = await request.json();
    const { course_forum_topic_id, body: threadBody } = body;

    // Validate required fields
    if (!course_forum_topic_id || !threadBody) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: course_forum_topic_id, body",
        },
        { status: 400 }
      );
    }

    // Create course forum thread
    const thread = await prisma.course_forum_thread.create({
      data: {
        course_forum_topic_id: parseInt(course_forum_topic_id),
        body: threadBody,
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
        course_forum_topic: {
          select: {
            id: true,
            title: true,
            course_id: true,
          },
        },
      },
    });

    return createSuccessResponse(thread, user);
  } catch (error) {
    console.error("Error creating course forum thread:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course forum thread",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
