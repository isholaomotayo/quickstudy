import { NextRequest, NextResponse } from "next/server";
import {
  createJsonResponse,
  createAuthErrorResponse,
  authenticateUserWithPermissions,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";

// GET a single forum category
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authenticateUserWithPermissions(["forum.view"]);

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;
  const { id } = await params;

  try {
    const forumCategory = await prisma.school_forum_category.findFirst({
      where: {
        id: BigInt(id),
      },
      include: {
        school_forum_topic: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!forumCategory) {
      return createAuthErrorResponse("Forum Category does not exist", 400);
    }

    return createJsonResponse(forumCategory);
  } catch (error) {
    console.error("Error fetching forum category:", error);
    return createAuthErrorResponse("Failed to fetch forum category", 500);
  }
}

// PUT update a forum category
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authenticateUserWithPermissions(["forum.moderate"]);

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return createAuthErrorResponse("Name is required", 400);
    }

    const updatedCategory = await prisma.school_forum_category.update({
      where: {
        id: BigInt(id),
      },
      data: {
        name,
      },
    });

    return createJsonResponse(updatedCategory);
  } catch (error: any) {
    console.error("Error updating forum category:", error);
    if (error.code === "P2025") {
      return createAuthErrorResponse("Forum Category does not exist", 400);
    }
    return createAuthErrorResponse("Failed to update forum category", 500);
  }
}

// DELETE a forum category
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authenticateUserWithPermissions(["forum.moderate"]);

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const { id } = await params;

  try {
    await prisma.school_forum_category.delete({
      where: {
        id: BigInt(id),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting forum category:", error);
    if (error.code === "P2025") {
      return createAuthErrorResponse("Forum Category does not exist", 400);
    }
    return createAuthErrorResponse("Failed to delete forum category", 500);
  }
}
