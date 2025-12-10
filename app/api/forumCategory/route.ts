import { NextRequest } from "next/server";
import {
  createJsonResponse,
  createAuthErrorResponse,
  authenticateUserWithPermissions,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";

// GET all forum categories
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
    const forumCategories = await prisma.school_forum_category.findMany({
      where: {
        institution_id: String(user.institution_id),
      },
      include: {
        school_forum_topic: {
          include: {
            user: true,
          },
        },
      },
    });

    return createJsonResponse(forumCategories);
  } catch (error) {
    console.error("Error fetching forum categories:", error);
    return createAuthErrorResponse("Failed to fetch forum categories", 500);
  }
}

// POST create a new forum category
export async function POST(req: NextRequest) {
  const authResult = await authenticateUserWithPermissions(["forum.moderate"]);

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;

  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return createAuthErrorResponse("Name is required", 400);
    }

    const newForumCategory = await prisma.school_forum_category.create({
      data: {
        name,
        institution_id: String(user.institution_id),
      },
    });

    return createJsonResponse(newForumCategory);
  } catch (error) {
    console.error("Error creating forum category:", error);
    return createAuthErrorResponse("Failed to create forum category", 500);
  }
}
