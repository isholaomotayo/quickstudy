import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

/**
 * GET /api/discussion/topics
 * Get time-bound discussion topics (filtered by course_id, optionally by date range)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { searchParams } = new URL(request.url);
    const course_id = searchParams.get("course_id");
    const active_only = searchParams.get("active_only") === "true";

    if (!course_id) {
      return NextResponse.json(
        {
          success: false,
          error: "course_id is required",
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const whereClause: any = {
      course_id: parseInt(course_id),
    };

    // Filter for active discussions only (within start_date and end_date)
    if (active_only) {
      whereClause.AND = [
        {
          OR: [{ start_date: null }, { start_date: { lte: now } }],
        },
        {
          OR: [{ end_date: null }, { end_date: { gte: now } }],
        },
      ];
    }

    const topics = await prisma.course_discussion_topic.findMany({
      where: whereClause,
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
          select: {
            id: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Add comment count and active status
    const topicsWithMeta = topics.map((topic) => {
      const isActive =
        (!topic.start_date || topic.start_date <= now) &&
        (!topic.end_date || topic.end_date >= now);

      return {
        ...topic,
        comment_count: topic.course_discussion_comment.length,
        is_active: isActive,
        course_discussion_comment: undefined,
      };
    });

    return createSuccessResponse(topicsWithMeta, user);
  } catch (error) {
    console.error("Error fetching discussion topics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch discussion topics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/discussion/topics
 * Create a new time-bound discussion topic
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "forum.create_topic")) {
      return createAuthErrorResponse(
        "Insufficient permissions to create discussion topics",
        403
      );
    }

    const body = await request.json();
    const { course_id, title, body: topicBody, start_date, end_date } = body;

    // Validate required fields
    if (!course_id || !title || !topicBody) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: course_id, title, body",
        },
        { status: 400 }
      );
    }

    // Validate date range
    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return NextResponse.json(
        {
          success: false,
          error: "start_date must be before end_date",
        },
        { status: 400 }
      );
    }

    // Create discussion topic
    const topic = await prisma.course_discussion_topic.create({
      data: {
        course_id: parseInt(course_id),
        title,
        body: topicBody,
        user_id: parseInt(user.id),
        ...(start_date && { start_date: new Date(start_date) }),
        ...(end_date && { end_date: new Date(end_date) }),
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
    console.error("Error creating discussion topic:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create discussion topic",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
