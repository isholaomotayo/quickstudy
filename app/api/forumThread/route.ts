import { NextRequest, NextResponse } from "next/server";
import {
  createJsonResponse,
  createAuthErrorResponse,
  authenticateUserWithPermissions,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";

// POST create a new forum thread
export async function POST(req: NextRequest) {
  const authResult = await authenticateUserWithPermissions([
    "forum.create_post",
  ]);

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;

  try {
    const body = await req.json();
    const { body: threadBody, user_id, school_forum_topic_id } = body;

    if (!threadBody || !school_forum_topic_id) {
      return createAuthErrorResponse(
        "Body and school_forum_topic_id are required",
        400
      );
    }

    const newForumThread = await prisma.school_forum_thread.create({
      data: {
        body: threadBody,
        user_id: BigInt(user_id || user.id),
        school_forum_topic_id: BigInt(school_forum_topic_id),
        institution_id: String(user.institution_id),
      },
      include: {
        user: true,
      },
    });

    const response = createJsonResponse(newForumThread);
    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating forum thread:", error);
    return createAuthErrorResponse("Failed to create forum thread", 500);
  }
}
