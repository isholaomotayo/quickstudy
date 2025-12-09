import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";

/**
 * GET /api/announcements/search
 * Search announcements by title or body
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("query") || "";
    const pgsize = parseInt(searchParams.get("pgsize") || "500");
    const pg = parseInt(searchParams.get("pg") || "1");

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "Search query is required",
        },
        { status: 400 }
      );
    }

    // Build search conditions
    const where = {
      institution_id: user.institution_id,
      OR: [
        { title: { contains: query, mode: "insensitive" as const } },
        { body: { contains: query, mode: "insensitive" as const } },
      ],
    };

    // Fetch matching announcements with pagination
    const [announcements, total] = await Promise.all([
      prisma.announcements.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          announcement_reads: {
            where: {
              user_id: parseInt(user.id),
            },
            select: {
              read_at: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: pgsize,
        skip: (pg - 1) * pgsize,
      }),
      prisma.announcements.count({ where }),
    ]);

    return createSuccessResponse(
      {
        announcements,
        query,
        pagination: {
          total,
          page: pg,
          pageSize: pgsize,
          totalPages: Math.ceil(total / pgsize),
        },
      },
      user
    );
  } catch (error) {
    console.error("Error searching announcements:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search announcements",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
