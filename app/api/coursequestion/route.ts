import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

/**
 * GET /api/coursequestion
 * Get course questions for a specific test
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { searchParams } = new URL(request.url);
    const course_test_id = searchParams.get("course_test_id");

    if (!course_test_id) {
      return NextResponse.json(
        {
          success: false,
          error: "course_test_id is required",
        },
        { status: 400 }
      );
    }

    const questions = await prisma.course_question.findMany({
      where: {
        course_test_id: parseInt(course_test_id),
      },
      include: {
        course_test: {
          select: {
            id: true,
            name: true,
            course_id: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return createSuccessResponse(questions, user);
  } catch (error) {
    console.error("Error fetching course questions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course questions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coursequestion
 * Create a new course question
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
        "Insufficient permissions to create course questions",
        403
      );
    }

    const body = await request.json();
    const { course_test_id, question, details, options, answer, order, marks } =
      body;

    // Validate required fields
    if (!course_test_id || !question || order === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: course_test_id, question, order",
        },
        { status: 400 }
      );
    }

    // Create course question
    const newQuestion = await prisma.course_question.create({
      data: {
        course_test_id: parseInt(course_test_id),
        question,
        details: details || null,
        options: options || null,
        answer: answer || "",
        order: parseInt(order),
        marks: marks ? parseInt(marks) : 1,
      },
      include: {
        course_test: {
          select: {
            id: true,
            name: true,
            course_id: true,
          },
        },
      },
    });

    return createSuccessResponse(newQuestion, user);
  } catch (error) {
    console.error("Error creating course question:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course question",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
