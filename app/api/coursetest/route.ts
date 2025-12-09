import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

/**
 * GET /api/coursetest
 * Get course tests (filtered by course_id, course_module_id, or course_lesson_id)
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
    const course_module_id = searchParams.get("course_module_id");
    const course_lesson_id = searchParams.get("course_lesson_id");
    const published_only = searchParams.get("published_only") === "true";

    // Build where clause
    const whereClause: any = {};

    if (course_id) {
      whereClause.course_id = parseInt(course_id);
    }

    if (course_module_id) {
      whereClause.course_module_id = parseInt(course_module_id);
    }

    if (course_lesson_id) {
      whereClause.course_lesson_id = parseInt(course_lesson_id);
    }

    if (published_only) {
      whereClause.published = true;
    }

    const tests = await prisma.course_test.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        course_module: {
          select: {
            id: true,
            name: true,
          },
        },
        course_lesson: {
          select: {
            id: true,
            name: true,
          },
        },
        course_question: {
          select: {
            id: true,
            marks: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Add question count
    const testsWithMeta = tests.map((test) => ({
      ...test,
      question_count: test.course_question.length,
      course_question: undefined,
    }));

    return createSuccessResponse(testsWithMeta, user);
  } catch (error) {
    console.error("Error fetching course tests:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course tests",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coursetest
 * Create a new course test
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
      return createAuthErrorResponse(
        "Insufficient permissions to create course tests",
        403
      );
    }

    const body = await request.json();
    const {
      course_id,
      course_module_id,
      course_lesson_id,
      name,
      instructions,
      duration_mins,
      deadline,
      max_attempts,
      max_score,
      format,
      published,
    } = body;

    // Validate required fields
    if (!name || !course_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, course_id",
        },
        { status: 400 }
      );
    }

    // Create course test
    const test = await prisma.course_test.create({
      data: {
        course_id: parseInt(course_id),
        course_module_id: course_module_id ? parseInt(course_module_id) : null,
        course_lesson_id: course_lesson_id ? parseInt(course_lesson_id) : null,
        name,
        instructions: instructions || null,
        duration_mins: duration_mins ? parseInt(duration_mins) : null,
        deadline: deadline ? new Date(deadline) : null,
        max_attempts: max_attempts ? parseInt(max_attempts) : 1,
        max_score: max_score ? parseInt(max_score) : 0,
        format: format || "",
        published: published ?? true,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        course_module: {
          select: {
            id: true,
            name: true,
          },
        },
        course_lesson: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return createSuccessResponse(test, user);
  } catch (error) {
    console.error("Error creating course test:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course test",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
