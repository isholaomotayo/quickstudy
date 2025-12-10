import { NextRequest } from "next/server";
import {
  createJsonResponse,
  createAuthErrorResponse,
  authenticateUserWithPermissions,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authResult = await authenticateUserWithPermissions(["forum.view"]);

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;

  try {
    // Get today's date at start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get start of this week (Monday)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
    startOfWeek.setDate(today.getDate() - daysToSubtract);

    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get posts created today
    const todayPosts = await prisma.school_forum_topic.count({
      where: {
        created_at: {
          gte: today,
        },
      },
    });

    // Get posts created this week
    const thisWeekPosts = await prisma.school_forum_topic.count({
      where: {
        created_at: {
          gte: startOfWeek,
        },
      },
    });

    // Get total posts
    const totalPosts = await prisma.school_forum_topic.count();

    return createJsonResponse({
      today: todayPosts,
      thisWeek: thisWeekPosts,
      totalMembers: totalUsers,
      totalPosts: totalPosts,
    });
  } catch (error) {
    console.error("Error fetching forum stats:", error);
    return createAuthErrorResponse("Failed to fetch forum statistics", 500);
  }
}
