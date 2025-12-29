import { NextRequest, NextResponse } from "next/server";
import {
  createJsonResponse,
  createAuthErrorResponse,
  authenticateUser,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";

// POST create a new course forum thread
export async function POST(req: NextRequest) {
  const authResult = await authenticateUser();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;
  const allowedRoles = ["STUDENT", "STAFF", "HOD", "ADMIN", "SUPERADMIN"];
  if (!allowedRoles.includes(user.role)) {
    return createAuthErrorResponse("Insufficient permissions", 403);
  }

  try {
    const body = await req.json();
    const { body: threadBody, user_id, course_forum_topic_id } = body;

    if (!threadBody || !course_forum_topic_id) {
      return createAuthErrorResponse("Body and course_forum_topic_id are required", 400);
    }

    const newForumThread = await prisma.course_forum_thread.create({
      data: {
        body: threadBody,
        user_id: BigInt(user_id || user.id),
        course_forum_topic_id: Number(course_forum_topic_id),
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

    return createJsonResponse(newForumThread, 201);
  } catch (error) {
    console.error("Error creating course forum thread:", error);
    return createAuthErrorResponse("Failed to create course forum thread", 500);
  }
}
