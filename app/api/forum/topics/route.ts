import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

/**
 * GET /api/forum/topics
 * Get all school-wide forum topics for the user's institution
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { searchParams } = new URL(request.url);

    const pgsize = parseInt(searchParams.get("pgsize") || "50");
    const pg = parseInt(searchParams.get("pg") || "1");

    const [topics, total] = await Promise.all([
      prisma.school_forum_topic.findMany({
        where: {
          institution_id: user.institution_id.toString(),
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
          school_forum_thread: {
            select: {
              id: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: pgsize,
        skip: (pg - 1) * pgsize,
      }),
      prisma.school_forum_topic.count({
        where: {
          institution_id: user.institution_id.toString(),
        },
      }),
    ]);

    // Add thread count to each topic
    const topicsWithCount = topics.map((topic) => ({
      ...topic,
      thread_count: topic.school_forum_thread.length,
      school_forum_thread: undefined, // Remove the array, keep count only
    }));

    return createSuccessResponse(
      {
        topics: topicsWithCount,
        pagination: {
          total,
          page: pg,
          pageSize: pgsize,
          totalPages: Math.ceil(total / pgsize),
        },
      },
      user
    );
  } catch (error) {
    console.error("Error fetching forum topics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch forum topics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/forum/topics
 * Create a new school-wide forum topic
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
        "Insufficient permissions to create forum topics",
        403
      );
    }

    const body = await request.json();
    const { title, body: topicBody } = body;

    // Validate required fields
    if (!title || !topicBody) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, body",
        },
        { status: 400 }
      );
    }

    // Create forum topic
    const topic = await prisma.school_forum_topic.create({
      data: {
        title,
        body: topicBody,
        user_id: parseInt(user.id),
        institution_id: user.institution_id.toString(),
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
    console.error("Error creating forum topic:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create forum topic",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
