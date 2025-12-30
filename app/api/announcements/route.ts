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
 * GET /api/announcements
 * Get all announcements for the user's institution with pagination
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

    // Check cache first
    const cacheKey = routeCacheKey(CACHE_PREFIX.ANNOUNCEMENT, {
      institution_id: user.institution_id,
      user_id: user.id,
      pgsize,
      pg,
    });

    const cachedResponse = await cacheGet(cacheKey);
    if (cachedResponse) return cachedResponse;

    // Get announcements for user's institution
    const [announcements, total] = await Promise.all([
      prisma.announcements.findMany({
        where: {
          institution_id: user.institution_id,
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
          announcement_reads: {
            where: {
              user_id: parseInt(user.id),
            },
            select: {
              read_at: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: pgsize,
        skip: (pg - 1) * pgsize,
      }),
      prisma.announcements.count({
        where: {
          institution_id: user.institution_id,
        },
      }),
    ]);

    const responseData = {
      announcements,
      pagination: {
        total,
        page: pg,
        pageSize: pgsize,
        totalPages: Math.ceil(total / pgsize),
      },
    };

    // Cache the response
    const response = createSuccessResponse(responseData, user);
    const responseJson = await response.clone().json();
    await cacheSet(cacheKey, responseJson, CACHE_TTL.ANNOUNCEMENTS);

    return response;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch announcements",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/announcements
 * Create a new school-wide announcement
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "announcements.create")) {
      return createAuthErrorResponse(
        "Insufficient permissions to create announcements",
        403
      );
    }

    const body = await request.json();
    const { title, body: announcementBody } = body;

    // Validate required fields
    if (!title || !announcementBody) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, body",
        },
        { status: 400 }
      );
    }

    // Create announcement
    const announcement = await prisma.announcements.create({
      data: {
        title,
        body: announcementBody,
        user_id: parseInt(user.id),
        institution_id: user.institution_id,
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

    // Invalidate announcement cache for this institution
    await cacheInvalidate(CACHE_PREFIX.ANNOUNCEMENT, user.institution_id);

    return createSuccessResponse(announcement, user);
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create announcement",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
