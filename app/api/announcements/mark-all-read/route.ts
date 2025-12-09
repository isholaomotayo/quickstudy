import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";

/**
 * POST /api/announcements/mark-all-read
 * Mark all announcements for the user's institution as read
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Get all announcement IDs for the user's institution
    const announcements = await prisma.announcements.findMany({
      where: {
        institution_id: user.institution_id,
      },
      select: {
        id: true,
      },
    });

    const announcementIds = announcements.map((a) => a.id);

    if (announcementIds.length === 0) {
      return createSuccessResponse(
        {
          message: "No announcements to mark as read",
          count: 0,
        },
        user
      );
    }

    // Get existing read records for this user
    const existingReads = await prisma.announcement_reads.findMany({
      where: {
        user_id: parseInt(user.id),
        announcement_id: { in: announcementIds },
      },
      select: {
        announcement_id: true,
      },
    });

    const existingReadIds = new Set(existingReads.map((r) => r.announcement_id));

    // Filter to only unread announcements
    const unreadIds = announcementIds.filter((id) => !existingReadIds.has(id));

    if (unreadIds.length === 0) {
      return createSuccessResponse(
        {
          message: "All announcements already marked as read",
          count: 0,
        },
        user
      );
    }

    // Create read records for all unread announcements
    const now = new Date();
    const readRecords = unreadIds.map((announcementId) => ({
      announcement_id: announcementId,
      user_id: parseInt(user.id),
      institution_id: user.institution_id,
      read_at: now,
    }));

    const result = await prisma.announcement_reads.createMany({
      data: readRecords,
      skipDuplicates: true,
    });

    return createSuccessResponse(
      {
        message: "All announcements marked as read",
        count: result.count,
      },
      user
    );
  } catch (error) {
    console.error("Error marking all announcements as read:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to mark all announcements as read",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
