import { NextRequest, NextResponse } from "next/server";
import {
  createJsonResponse,
  createAuthErrorResponse,
  authenticateUserWithPermissions,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authenticateUserWithPermissions();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  try {
    const { id } = await params;

    const forumTopic = await prisma.school_forum_topic.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        user: true,
        school_forum_thread: {
          include: {
            user: true,
          },
          orderBy: {
            id: "desc",
          },
        },
      },
    });

    if (!forumTopic) {
      return createAuthErrorResponse("Forum Topic does not exist", 404);
    }

    return NextResponse.json(forumTopic);
  } catch (error) {
    console.error("Error fetching forum topic:", error);
    return createAuthErrorResponse("Failed to fetch forum topic", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authenticateUserWithPermissions();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { title, body: topicBody } = body;

    const updatedForumTopic = await prisma.school_forum_topic.update({
      where: {
        id: parseInt(id),
      },
      data: {
        title,
        body: topicBody,
      },
      include: {
        user: true,
        school_forum_thread: true,
      },
    });

    return createJsonResponse(updatedForumTopic);
  } catch (error) {
    console.error("Error updating forum topic:", error);
    return createAuthErrorResponse("Failed to update forum topic", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authenticateUserWithPermissions();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  try {
    const { id } = await params;

    await prisma.school_forum_topic.delete({
      where: {
        id: parseInt(id),
      },
    });

    return createJsonResponse({ message: "Forum topic deleted successfully" });
  } catch (error) {
    console.error("Error deleting forum topic:", error);
    return createAuthErrorResponse("Failed to delete forum topic", 500);
  }
}
