import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

/**
 * GET /api/courseannouncements
 * Get all course announcements (optionally filtered by course_id)
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

    const where: any = {};
    if (course_id) {
      where.course_id = parseInt(course_id);
    }

    const announcements = await prisma.course_announcement.findMany({
      where,
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
      orderBy: { created_at: "desc" },
    });

    return createSuccessResponse(announcements, user);
  } catch (error) {
    console.error("Error fetching course announcements:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course announcements",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courseannouncements
 * Create a new course announcement
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
        "Insufficient permissions to create course announcements",
        403
      );
    }

    const body = await request.json();
    const { course_id, title, body: announcementBody } = body;

    // Validate required fields
    if (!course_id || !title || !announcementBody) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: course_id, title, body",
        },
        { status: 400 }
      );
    }

    // Create course announcement
    const announcement = await prisma.course_announcement.create({
      data: {
        course_id: parseInt(course_id),
        title,
        body: announcementBody,
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

    return createSuccessResponse(announcement, user);
  } catch (error) {
    console.error("Error creating course announcement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course announcement",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
