import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
  hasInstitutionAccess,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/announcements/[id]
 * Get a specific announcement by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const announcementId = parseInt(params.id);

    const announcement = await prisma.announcements.findUnique({
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
        announcement_reads: {
          where: {
            user_id: parseInt(user.id),
          },
        },
      },
    });

    if (!announcement) {
      return createAuthErrorResponse("Announcement not found", 404);
    }

    // Check institution access
    if (!hasInstitutionAccess(user, announcement.institution_id)) {
      return createAuthErrorResponse("Access denied to this announcement", 403);
    }

    return createSuccessResponse(announcement, user);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch announcement",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/announcements/[id]
 * Update an announcement
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "announcements.edit")) {
      return createAuthErrorResponse(
        "Insufficient permissions to update announcements",
        403
      );
    }

    const announcementId = parseInt(params.id);
    const body = await request.json();

    // Check announcement exists and user has access
    const existingAnnouncement = await prisma.announcements.findUnique({
      where: { id: announcementId },
    });

    if (!existingAnnouncement) {
      return createAuthErrorResponse("Announcement not found", 404);
    }

    if (!hasInstitutionAccess(user, existingAnnouncement.institution_id)) {
      return createAuthErrorResponse("Access denied to this announcement", 403);
    }

    const { title, body: announcementBody } = body;

    // Update announcement
    const announcement = await prisma.announcements.update({
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
      },
    });

    return createSuccessResponse(announcement, user);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update announcement",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/announcements/[id]
 * Delete an announcement
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "announcements.delete")) {
      return createAuthErrorResponse(
        "Insufficient permissions to delete announcements",
        403
      );
    }

    const announcementId = parseInt(params.id);

    // Check announcement exists and user has access
    const existingAnnouncement = await prisma.announcements.findUnique({
      where: { id: announcementId },
    });

    if (!existingAnnouncement) {
      return createAuthErrorResponse("Announcement not found", 404);
    }

    if (!hasInstitutionAccess(user, existingAnnouncement.institution_id)) {
      return createAuthErrorResponse("Access denied to this announcement", 403);
    }

    // Delete announcement (cascade will handle announcement_reads)
    await prisma.announcements.delete({
      where: { id: announcementId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Announcement deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete announcement",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
