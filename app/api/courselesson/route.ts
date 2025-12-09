import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

/**
 * GET /api/courselesson
 * Get all course lessons (optionally filtered by course_module_id)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { searchParams } = new URL(request.url);
    const course_module_id = searchParams.get("course_module_id");

    const where: any = {};
    if (course_module_id) {
      where.course_module_id = parseInt(course_module_id);
    }

    const lessons = await prisma.course_lesson.findMany({
      where,
      include: {
        course_module: {
          include: {
            course: true,
          },
        },
        course_test: true,
      },
      orderBy: { order: "asc" },
    });

    return createSuccessResponse(lessons, user);
  } catch (error) {
    console.error("Error fetching course lessons:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course lessons",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courselesson
 * Create a new course lesson
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
      return createAuthErrorResponse("Insufficient permissions to create course lessons", 403);
    }

    const body = await request.json();

    const {
      course_module_id,
      name,
      order,
      description,
      content = "",
    } = body;

    // Validate required fields
    if (!course_module_id || !name || order === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: course_module_id, name, order",
        },
        { status: 400 }
      );
    }

    // Create lesson
    const lesson = await prisma.course_lesson.create({
      data: {
        course_module_id: parseInt(course_module_id),
        name,
        order: parseInt(order),
        description,
        content,
      },
      include: {
        course_module: {
          include: {
            course: true,
          },
        },
      },
    });

    return createSuccessResponse(lesson, user);
  } catch (error) {
    console.error("Error creating course lesson:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course lesson",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
