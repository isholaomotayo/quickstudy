import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * POST /api/announcements/[id]/read
 * Mark a single announcement as read for the current user
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { id } = await context.params;
    const announcementId = parseInt(id);

    // Check if announcement exists
    const announcement = await prisma.announcements.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      return createAuthErrorResponse("Announcement not found", 404);
    }

    // Check institution access
    if (announcement.institution_id !== user.institution_id) {
      return createAuthErrorResponse("Access denied to this announcement", 403);
    }

    // Create or update read record (upsert)
    const readRecord = await prisma.announcement_reads.upsert({
      where: {
        announcement_id_user_id: {
          announcement_id: announcementId,
          user_id: parseInt(user.id),
        },
      },
      create: {
        announcement_id: announcementId,
        user_id: parseInt(user.id),
        institution_id: user.institution_id,
        read_at: new Date(),
      },
      update: {
        read_at: new Date(),
      },
    });

    return createSuccessResponse(
      {
        message: "Announcement marked as read",
        readRecord,
      },
      user
    );
  } catch (error) {
    console.error("Error marking announcement as read:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to mark announcement as read",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
