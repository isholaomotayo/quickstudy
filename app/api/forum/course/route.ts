import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";
import { cacheGet, cacheSet, cacheInvalidate, routeCacheKey, CACHE_TTL, CACHE_PREFIX } from "@/lib/route-cache";

/**
 * GET /api/forum/course
 * Get course forum topics (filtered by course_id)
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

    if (!course_id) {
      return NextResponse.json(
        {
          success: false,
          error: "course_id is required",
        },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = routeCacheKey(CACHE_PREFIX.FORUM, {
      type: 'course',
      course_id,
    });

    const cachedResponse = await cacheGet(cacheKey);
    if (cachedResponse) return cachedResponse;

    const topics = await prisma.course_forum_topic.findMany({
      where: {
        course_id: parseInt(course_id),
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
        _count: {
          select: {
            course_forum_thread: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Add thread count using _count
    const topicsWithCount = topics.map((topic) => ({
      ...topic,
      thread_count: topic._count.course_forum_thread,
      _count: undefined,
    }));

    // Cache the response
    const response = createSuccessResponse(topicsWithCount, user);
    const responseJson = await response.clone().json();
    await cacheSet(cacheKey, responseJson, CACHE_TTL.FORUM_TOPICS);

    return response;
  } catch (error) {
    console.error("Error fetching course forum topics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course forum topics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/forum/course
 * Create a new course forum topic
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
        "Insufficient permissions to create course forum topics",
        403
      );
    }

    const body = await request.json();
    const { course_id, title, description } = body;

    // Validate required fields
    if (!course_id || !title || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: course_id, title, description",
        },
        { status: 400 }
      );
    }

    // Create course forum topic
    const topic = await prisma.course_forum_topic.create({
      data: {
        course_id: parseInt(course_id),
        title,
        description,
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
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Invalidate forum cache
    await cacheInvalidate(CACHE_PREFIX.FORUM);

    return createSuccessResponse(topic, user);
  } catch (error) {
    console.error("Error creating course forum topic:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course forum topic",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
