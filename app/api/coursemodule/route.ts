import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

/**
 * GET /api/coursemodule
 * Get all course modules (optionally filtered by course_id)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { searchParams } = new URL(request.url);
    const course_id = searchParams.get("course_id");

    const where: any = {};
    if (course_id) {
      where.course_id = parseInt(course_id);
    }

    const modules = await prisma.course_module.findMany({
      where,
      include: {
        course: true,
        course_lesson: {
          orderBy: { order: "asc" },
        },
        course_test: true,
      },
      orderBy: { order: "asc" },
    });

    return createSuccessResponse(modules, user);
  } catch (error) {
    console.error("Error fetching course modules:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course modules",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coursemodule
 * Create a new course module
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "lms.content.create")) {
      return createAuthErrorResponse("Insufficient permissions to create course modules", 403);
    }

    const body = await request.json();

    const {
      course_id,
      name,
      order,
      description,
      published = true,
    } = body;

    // Validate required fields
    if (!course_id || !name || order === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: course_id, name, order",
        },
        { status: 400 }
      );
    }

    // Create module
    const module = await prisma.course_module.create({
      data: {
        course_id: parseInt(course_id),
        name,
        order: parseInt(order),
        description,
        published,
      },
      include: {
        course: true,
        course_lesson: true,
      },
    });

    return createSuccessResponse(module, user);
  } catch (error) {
    console.error("Error creating course module:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course module",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
