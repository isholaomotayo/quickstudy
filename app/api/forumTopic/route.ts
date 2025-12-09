import { NextRequest, NextResponse } from "next/server";
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
    // Get all forum topics for the user's institution
    const forumTopics = await prisma.school_forum_topic.findMany({
      where: {
        institution_id: String(user.institution_id),
      },
      include: {
        user: true,
        school_forum_thread: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return createJsonResponse(forumTopics);
  } catch (error) {
    console.error("Error fetching forum topics:", error);
    return createAuthErrorResponse("Failed to fetch forum topics", 500);
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateUserWithPermissions();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;

  try {
    const body = await req.json();
    const { title, body: topicBody, user_id, school_forum_category_id } = body;

    // Create new forum topic
    const newForumTopic = await prisma.school_forum_topic.create({
      data: {
        title,
        body: topicBody,
        user_id: user_id || user.id,
        school_forum_category_id,
        institution_id: String(user.institution_id),
      },
      include: {
        user: true,
        school_forum_thread: true,
      },
    });

    return NextResponse.json(newForumTopic);
  } catch (error) {
    console.error("Error creating forum topic:", error);
    return createAuthErrorResponse("Failed to create forum topic", 500);
  }
}
