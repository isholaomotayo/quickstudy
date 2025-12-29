import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";

/**
 * POST /api/studenttest/start
 * Start a new test attempt
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Only students can start tests
    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          error: "Only students can start tests",
        },
        { status: 403 }
      );
    }

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

    // Get test details with course module and course information
    const courseTest = await prisma.course_test.findUnique({
      where: { id: parseInt(course_test_id) },
      include: {
        course_module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!courseTest) {
      return NextResponse.json(
        {
          success: false,
          pageNotif: "invalid_test_post_attempt",
        },
        { status: 404 }
      );
    }

    // Check if test is published
    if (!courseTest.published) {
      return NextResponse.json(
        {
          success: false,
          error: "Test is not published",
        },
        { status: 403 }
      );
    }

    // Count prior attempts
    const priorAttempts = await prisma.student_test.count({
      where: {
        user_id: parseInt(user.id),
        course_test_id: parseInt(course_test_id),
      },
    });

    // Check if max attempts exceeded
    if (courseTest.max_attempts && priorAttempts >= courseTest.max_attempts) {
      return NextResponse.json(
        {
          success: false,
          pageNotif: "test_max_attempts_exceeded",
        },
        { status: 403 }
      );
    }

    // Check if there are questions in this test
    const numQuestions = await prisma.course_question.count({
      where: { course_test_id: parseInt(course_test_id) },
    });

    if (numQuestions < 1) {
      return NextResponse.json(
        {
          success: false,
          pageNotif: "test_no_questions",
        },
        { status: 400 }
      );
    }

    // Calculate end time based on duration
    const currentDatetime = new Date();
    const testEndtime = courseTest.duration_mins
      ? new Date(currentDatetime.getTime() + courseTest.duration_mins * 60000)
      : null;

    // Get course details for department_id
    const course = courseTest.course_module?.course;
    const departmentId = course?.department_id || user.department_id || 0;

    // Create the student test record
    const studentTestData = {
      user_id: parseInt(user.id),
      course_test_id: parseInt(course_test_id),
      test_name: courseTest.name,
      questions_answers: [],
      duration_mins: courseTest.duration_mins,
      deadline: courseTest.deadline,
      endtime: testEndtime,
      attempt_number: priorAttempts + 1,
      max_attempts: courseTest.max_attempts,
      max_score: courseTest.max_score,
      format: courseTest.format,
      institution_id: user.institution_id,
      department_id: departmentId,
      score: 0,
    };

    const newStudentTest = await prisma.student_test.create({
      data: studentTestData,
      include: {
        course_test: {
          select: {
            id: true,
            name: true,
            course_id: true,
            max_score: true,
            duration_mins: true,
            format: true,
          },
        },
      },
    });

    return createSuccessResponse(newStudentTest, user);
  } catch (error) {
    console.error("Error starting student test:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to start test",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
