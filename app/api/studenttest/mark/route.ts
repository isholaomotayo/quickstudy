import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";

/**
 * POST /api/studenttest/mark
 * Mark a submitted test (for staff/lecturers)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Only staff, HOD, admin, or superadmin can mark tests
    const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only staff members can mark tests",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { student_test_id, score, feedback } = body;

    // Validate required fields
    if (!student_test_id) {
      return NextResponse.json(
        {
          success: false,
          error: "student_test_id is required",
        },
        { status: 400 }
      );
    }

    // Get the student test record
    const studentTest = await prisma.student_test.findUnique({
      where: { id: parseInt(student_test_id) },
    });

    if (!studentTest) {
      return NextResponse.json(
        {
          success: false,
          pageNotif: "invalid_test_marking_attempt",
        },
        { status: 404 }
      );
    }

    // Check if test has been submitted
    if (!studentTest.submitted_at) {
      return NextResponse.json(
        {
          success: false,
          pageNotif: "test_not_submitted",
        },
        { status: 400 }
      );
    }

    // Check if marking edit window has expired (30 minutes after first marking)
    const currentDatetime = new Date();
    if (studentTest.marked_at) {
      const maxEditTime = new Date(
        new Date(studentTest.marked_at).getTime() + 30 * 60000
      );
      if (currentDatetime > maxEditTime) {
        return NextResponse.json(
          {
            success: false,
            pageNotif: "test_edit_time_exeeded",
          },
          { status: 403 }
        );
      }
    }

    // Additional validation for assignment submissions
    if (
      studentTest.format === "assignment" &&
      (score === undefined || score === null)
    ) {
      return NextResponse.json(
        {
          success: false,
          pageNotif: "assignment_score_required",
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      marked_by: BigInt(user.id),
      marked_at: currentDatetime,
    };

    // Add score if provided
    if (score !== undefined && score !== null) {
      updateData.score = parseFloat(score);
    }

    // Process feedback
    if (feedback) {
      let feedbackArray: any[] = [];

      if (Array.isArray(feedback)) {
        // If feedback is an array of objects with questionId and feedback
        feedbackArray = feedback
          .map((feedbackItem) => {
            if (
              feedbackItem &&
              feedbackItem.feedback &&
              feedbackItem.feedback.trim()
            ) {
              return {
                questionId: feedbackItem.questionId,
                feedback: feedbackItem.feedback.trim(),
              };
            }
            return null;
          })
          .filter(Boolean);
      } else if (feedback.feedback && feedback.feedback.trim()) {
        // If it's a single feedback object
        feedbackArray = [
          {
            questionId: feedback.questionId,
            feedback: feedback.feedback.trim(),
          },
        ];
      }

      if (feedbackArray.length > 0) {
        updateData.feedback = feedbackArray as any;
      }
    }

    // Update the student test record
    const updatedStudentTest = await prisma.student_test.update({
      where: { id: parseInt(student_test_id) },
      data: updateData,
      include: {
        course_test: {
          select: {
            id: true,
            name: true,
            course_id: true,
            max_score: true,
            format: true,
          },
        },
        user_student_test_user_idTouser: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Get marker information
    const marker = await prisma.user.findUnique({
      where: { id: BigInt(user.id) },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        username: true,
        email: true,
      },
    });

    const response = {
      ...updatedStudentTest,
      marker,
    };

    return createSuccessResponse(response, user);
  } catch (error) {
    console.error("Error marking student test:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to mark test",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
