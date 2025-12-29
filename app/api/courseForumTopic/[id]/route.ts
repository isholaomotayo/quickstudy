import { NextRequest, NextResponse } from "next/server";
import {
  createJsonResponse,
  createAuthErrorResponse,
  authenticateUser,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";

// GET course forum topics by course_id or single topic by id
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authenticateUser();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;
  const allowedRoles = [
    "STUDENT",
    "STAFF",
    "HOD",
    "ADMIN",
    "SUPERADMIN",
    "LECTURER",
  ];
  if (!allowedRoles.includes(user.role)) {
    return createAuthErrorResponse("Insufficient permissions", 403);
  }

  const { id } = await params;

  try {
    // Check if this is a course_id query (for topics by course)
    const idNum = Number(id);

    // Try to find topics by course_id first
    const topics = await prisma.course_forum_topic.findMany({
      where: {
        course_id: idNum,
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
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        course_forum_thread: {
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
          orderBy: { created_at: "desc" },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return createJsonResponse(topics);
  } catch (error) {
    console.error("Error fetching course forum topics:", error);
    return createAuthErrorResponse("Failed to fetch course forum topics", 500);
  }
}

// PUT update a course forum topic
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authenticateUser();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;
  const { id } = await params;

  try {
    const body = await req.json();
    const { title, description } = body;

    if (!title) {
      return createAuthErrorResponse("Title is required", 400);
    }

    // First, fetch the topic to check ownership
    const existingTopic = await prisma.course_forum_topic.findUnique({
      where: { id: Number(id) },
    });

    if (!existingTopic) {
      return createAuthErrorResponse("Forum Topic does not exist", 400);
    }

    // Check if user can edit this topic
    const isAdmin = [
      "SUPERADMIN",
      "ADMIN",
      "HOD",
      "STAFF",
      "LECTURER",
    ].includes(user.role);
    const isOwner = String(existingTopic.user_id) === user.id;

    if (!isAdmin && !isOwner) {
      return createAuthErrorResponse("You can only edit your own posts", 403);
    }

    const updatedTopic = await prisma.course_forum_topic.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
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
        course_forum_thread: true,
      },
    });

    return createJsonResponse(updatedTopic);
  } catch (error: any) {
    console.error("Error updating course forum topic:", error);
    if (error.code === "P2025") {
      return createAuthErrorResponse("Forum Topic does not exist", 400);
    }
    return createAuthErrorResponse("Failed to update course forum topic", 500);
  }
}

// DELETE a course forum topic
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authenticateUser();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;
  const { id } = await params;

  try {
    // First fetch the topic to check ownership
    const topic = await prisma.course_forum_topic.findUnique({
      where: { id: Number(id) },
      include: {
        course_forum_thread: true,
      },
    });

    if (!topic) {
      return createAuthErrorResponse("Forum Topic does not exist", 400);
    }

    // Check if user can delete this topic
    const isAdmin = [
      "SUPERADMIN",
      "ADMIN",
      "HOD",
      "STAFF",
      "LECTURER",
    ].includes(user.role);
    const isOwner = String(topic.user_id) === user.id;

    if (!isAdmin && !isOwner) {
      return createAuthErrorResponse("You can only delete your own posts", 403);
    }

    // Delete all threads first
    if (topic.course_forum_thread.length > 0) {
      await prisma.course_forum_thread.deleteMany({
        where: { course_forum_topic_id: Number(id) },
      });
    }

    // Delete the topic
    await prisma.course_forum_topic.delete({
      where: { id: Number(id) },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting course forum topic:", error);
    if (error.code === "P2025") {
      return createAuthErrorResponse("Forum Topic does not exist", 400);
    }
    return createAuthErrorResponse("Failed to delete course forum topic", 500);
  }
}
