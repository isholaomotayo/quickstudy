import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateUser, createAuthErrorResponse } from "@/lib/api-auth";

/**
 * GET /api/schoolAnnouncement/stats
 * Get announcement statistics (total, unread, this week)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const userId = BigInt(user.id);

    // Get all announcements for the user's institution
    const allAnnouncements = await prisma.announcements.findMany({
      where: {
        institution_id: user.institution_id,
      },
      select: {
        id: true,
        created_at: true,
      },
    });

    // Get read announcements for this user
    const readAnnouncements = await prisma.announcement_reads.findMany({
      where: {
        user_id: userId,
      },
      select: {
        announcement_id: true,
      },
    });

    const readAnnouncementIds = new Set(
      readAnnouncements.map((r) => r.announcement_id.toString())
    );

    // Calculate stats
    const total = allAnnouncements.length;
    const unread = allAnnouncements.filter(
      (a) => !readAnnouncementIds.has(a.id.toString())
    ).length;

    // Calculate this week's announcements (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const thisWeek = allAnnouncements.filter((a) => {
      if (!a.created_at) return false;
      return new Date(a.created_at) > weekAgo;
    }).length;

    return NextResponse.json({
      total,
      unread,
      thisWeek,
    });
  } catch (error) {
    console.error("Error fetching announcement stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch announcement stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
