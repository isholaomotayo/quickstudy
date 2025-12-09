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
 * GET /api/courseannouncements/[id]
 * Get a specific course announcement by ID
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { id } = await context.params;
    const announcementId = parseInt(id);

    const announcement = await prisma.course_announcement.findUnique({
      where: { id: announcementId },
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

    if (!announcement) {
      return createAuthErrorResponse("Course announcement not found", 404);
    }

    return createSuccessResponse(announcement, user);
  } catch (error) {
    console.error("Error fetching course announcement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course announcement",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/courseannouncements/[id]
 * Update a course announcement
 */
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "announcements.edit")) {
      return createAuthErrorResponse(
        "Insufficient permissions to update course announcements",
        403
      );
    }

    const { id } = await context.params;
    const announcementId = parseInt(id);
    const body = await request.json();

    const { title, body: announcementBody } = body;

    // Update course announcement
    const announcement = await prisma.course_announcement.update({
      where: { id: announcementId },
      data: {
        ...(title !== undefined && { title }),
        ...(announcementBody !== undefined && { body: announcementBody }),
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

    return createSuccessResponse(announcement, user);
  } catch (error) {
    console.error("Error updating course announcement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course announcement",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courseannouncements/[id]
 * Delete a course announcement
 */
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "announcements.delete")) {
      return createAuthErrorResponse(
        "Insufficient permissions to delete course announcements",
        403
      );
    }

    const { id } = await context.params;
    const announcementId = parseInt(id);

    // Delete course announcement
    await prisma.course_announcement.delete({
      where: { id: announcementId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course announcement deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course announcement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete course announcement",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
