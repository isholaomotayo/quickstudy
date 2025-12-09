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
    // Get total announcements for institution
    const totalAnnouncements = await prisma.announcements.count({
      where: {
        institution_id: user.institution_id,
      },
    });

    // Get read announcements for user
    const readCount = await prisma.announcement_reads.count({
      where: {
        user_id: BigInt(user.id),
        institution_id: user.institution_id,
      },
    });

    const unreadCount = Math.max(0, totalAnnouncements - readCount);

    return createJsonResponse({
      total: totalAnnouncements,
      read: readCount,
      unread: unreadCount,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    // Return safe default instead of throwing error to prevent logout
    return createJsonResponse({
      total: 0,
      read: 0,
      unread: 0,
    });
  }
}
