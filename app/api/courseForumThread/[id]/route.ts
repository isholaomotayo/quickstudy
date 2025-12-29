import { NextRequest, NextResponse } from "next/server";
import {
  createJsonResponse,
  createAuthErrorResponse,
  authenticateUser,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";

// GET all forum threads for a topic or get a single thread
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
  const allowedRoles = ["STUDENT", "STAFF", "HOD", "ADMIN", "SUPERADMIN"];
  if (!allowedRoles.includes(user.role)) {
    return createAuthErrorResponse("Insufficient permissions", 403);
  }

  const { id } = await params;

  // Check if there's a second ID in the URL path (for single thread retrieval)
  const url = new URL(req.url);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const threadIdIndex = pathSegments.indexOf(id) + 1;
  const hasThreadId = threadIdIndex < pathSegments.length;

  try {
    if (hasThreadId) {
      // Get a single thread
      const threadId = pathSegments[threadIdIndex];
      const forumThread = await prisma.course_forum_thread.findFirst({
        where: {
          id: Number(threadId),
          course_forum_topic_id: Number(id),
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

      if (!forumThread) {
        return createAuthErrorResponse("Forum Thread does not exist", 400);
      }

      return createJsonResponse(forumThread);
    } else {
      // Get all threads for a topic
      const forumThreads = await prisma.course_forum_thread.findMany({
        where: {
          course_forum_topic_id: Number(id),
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
        orderBy: {
          id: "desc",
        },
      });

      return createJsonResponse(forumThreads);
    }
  } catch (error) {
    console.error("Error fetching course forum threads:", error);
    return createAuthErrorResponse("Failed to fetch course forum threads", 500);
  }
}

// PUT update a forum thread
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
    const { body: threadBody } = body;

    if (!threadBody) {
      return createAuthErrorResponse("Body is required", 400);
    }

    // First, fetch the thread to check ownership
    const existingThread = await prisma.course_forum_thread.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingThread) {
      return createAuthErrorResponse("Forum Thread does not exist", 400);
    }

    // Check if user can edit this thread
    const isAdmin = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"].includes(user.role);
    const isOwner = String(existingThread.user_id) === user.id;

    if (!isAdmin && !isOwner) {
      return createAuthErrorResponse(
        "You can only edit your own comments",
        403
      );
    }

    const updatedThread = await prisma.course_forum_thread.update({
      where: {
        id: Number(id),
      },
      data: {
        body: threadBody,
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

    return createJsonResponse(updatedThread);
  } catch (error: any) {
    console.error("Error updating course forum thread:", error);
    if (error.code === "P2025") {
      return createAuthErrorResponse("Forum Thread does not exist", 400);
    }
    return createAuthErrorResponse("Failed to update course forum thread", 500);
  }
}

// DELETE a forum thread
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
    // First fetch the thread to check ownership
    const thread = await prisma.course_forum_thread.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!thread) {
      return createAuthErrorResponse("Forum Thread does not exist", 400);
    }

    // Check if user can delete this thread
    const isAdmin = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"].includes(user.role);
    const isOwner = String(thread.user_id) === user.id;

    if (!isAdmin && !isOwner) {
      return createAuthErrorResponse(
        "You can only delete your own comments",
        403
      );
    }

    await prisma.course_forum_thread.delete({
      where: {
        id: Number(id),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting course forum thread:", error);
    if (error.code === "P2025") {
      return createAuthErrorResponse("Forum Thread does not exist", 400);
    }
    return createAuthErrorResponse("Failed to delete course forum thread", 500);
  }
}
