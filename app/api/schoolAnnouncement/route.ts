import { NextRequest } from "next/server";
import {
  createJsonResponse,
  createAuthErrorResponse,
  authenticateUserWithPermissions,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authResult = await authenticateUserWithPermissions();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;

  try {
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const pgsize = parseInt(searchParams.get("pgsize") || "500");
    const pg = parseInt(searchParams.get("pg") || "1");

    // Calculate pagination
    const skip = (pg - 1) * pgsize;

    // Get announcements for institution
    const announcements = await prisma.announcements.findMany({
      where: {
        institution_id: user.institution_id,
      },
      include: {
        user: true,
      },
      orderBy: {
        id: "desc",
      },
      skip,
      take: pgsize,
    });

    // Get total count for pagination
    const total = await prisma.announcements.count({
      where: {
        institution_id: user.institution_id,
      },
    });

    // Get read status for current user
    const announcementIds = announcements.map((a) => a.id);
    let readAnnouncements: { announcement_id: bigint }[] = [];

    if (announcementIds.length > 0) {
      readAnnouncements = await prisma.announcement_reads.findMany({
        where: {
          user_id: BigInt(user.id),
          announcement_id: {
            in: announcementIds,
          },
        },
        select: {
          announcement_id: true,
        },
      });
    }

    const readIds = new Set(
      readAnnouncements.map((r) => Number(r.announcement_id))
    );

    // Add read status to each announcement
    const announcementsWithReadStatus = announcements.map((announcement) => ({
      ...announcement,
      read: readIds.has(Number(announcement.id)),
    }));

    // Calculate pagination info
    const pageCount = Math.ceil(total / pgsize);

    return createJsonResponse(announcementsWithReadStatus);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return createAuthErrorResponse("Failed to fetch announcements", 500);
  }
}
