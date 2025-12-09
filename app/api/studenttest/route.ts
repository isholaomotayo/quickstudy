import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";

/**
 * GET /api/studenttest
 * Get student test submissions
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
    const user_id = searchParams.get("user_id");

    // Build where clause
    const whereClause: any = {};

    if (course_test_id) {
      whereClause.course_test_id = parseInt(course_test_id);
    }

    if (user_id) {
      whereClause.user_id = parseInt(user_id);
    }

    // If user is a student, only show their own submissions
    if (user.role === "STUDENT") {
      whereClause.user_id = parseInt(user.id);
    }

    const submissions = await prisma.student_test.findMany({
      where: whereClause,
      include: {
        course_test: {
          select: {
            id: true,
            name: true,
            course_id: true,
            max_score: true,
            duration_mins: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return createSuccessResponse(submissions, user);
  } catch (error) {
    console.error("Error fetching student test submissions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch student test submissions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/studenttest
 * Create a new student test submission (start test)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const body = await request.json();
    const { course_test_id } = body;

    // Validate required fields
    if (!course_test_id) {
      return NextResponse.json(
        {
          success: false,
          error: "course_test_id is required",
        },
        { status: 400 }
      );
    }

    // Get test details
    const test = await prisma.course_test.findUnique({
      where: { id: parseInt(course_test_id) },
    });

    if (!test) {
      return createAuthErrorResponse("Course test not found", 404);
    }

    // Check if test is published
    if (!test.published) {
      return NextResponse.json(
        {
          success: false,
          error: "Test is not published",
        },
        { status: 403 }
      );
    }

    // Check deadline
    if (test.deadline && new Date(test.deadline) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: "Test deadline has passed",
        },
        { status: 403 }
      );
    }

    // Count existing attempts
    const attemptCount = await prisma.student_test.count({
      where: {
        user_id: parseInt(user.id),
        course_test_id: parseInt(course_test_id),
      },
    });

    // Check max attempts
    if (test.max_attempts && attemptCount >= test.max_attempts) {
      return NextResponse.json(
        {
          success: false,
          error: `Maximum ${test.max_attempts} attempt(s) reached`,
        },
        { status: 403 }
      );
    }

    // Calculate end time
    const endtime = test.duration_mins
      ? new Date(Date.now() + test.duration_mins * 60000)
      : null;

    // Create student test submission
    const submission = await prisma.student_test.create({
      data: {
        user_id: parseInt(user.id),
        course_test_id: parseInt(course_test_id),
        test_name: test.name,
        duration_mins: test.duration_mins,
        deadline: test.deadline,
        attempt_number: attemptCount + 1,
        max_attempts: test.max_attempts,
        max_score: test.max_score,
        format: test.format,
        institution_id: user.institution_id,
        department_id: user.department_id || 0,
        endtime,
        score: 0,
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

    return createSuccessResponse(submission, user);
  } catch (error) {
    console.error("Error creating student test submission:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create student test submission",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
