import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

/**
 * GET /api/forum/posts
 * Get forum posts/threads for a specific topic
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

    const posts = await prisma.school_forum_thread.findMany({
      where: {
        school_forum_topic_id: parseInt(topic_id),
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
      orderBy: { created_at: "asc" },
    });

    return createSuccessResponse(posts, user);
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch forum posts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/forum/posts
 * Create a new forum post/thread
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
        "Insufficient permissions to create forum posts",
        403
      );
    }

    const body = await request.json();
    const { topic_id, body: postBody } = body;

    // Validate required fields
    if (!topic_id || !postBody) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: topic_id, body",
        },
        { status: 400 }
      );
    }

    // Create forum post
    const post = await prisma.school_forum_thread.create({
      data: {
        school_forum_topic_id: parseInt(topic_id),
        body: postBody,
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

    return createSuccessResponse(post, user);
  } catch (error) {
    console.error("Error creating forum post:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create forum post",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
