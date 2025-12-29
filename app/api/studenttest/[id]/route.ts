import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/studenttest/[id]
 * Get a specific student test submission
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { id } = await context.params;
    const submissionId = parseInt(id);

    const submission = await prisma.student_test.findUnique({
      where: { id: submissionId },
      include: {
        user_student_test_user_idTouser: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    if (!submission) {
      return createAuthErrorResponse("Student test submission not found", 404);
    }

    // Students can only view their own submissions
    if (user.role === "STUDENT" && submission.user_id.toString() !== user.id) {
      return createAuthErrorResponse(
        "Insufficient permissions to view this submission",
        403
      );
    }

    // Format response to match Fastify controller
    // Only include expected fields, format nulls as empty strings, minimal user object
    const result = {
      id: submission.id,
      user_id: submission.user_id?.toString() ?? "",
      course_test_id: submission.course_test_id ?? 0,
      test_name: submission.test_name ?? "",
      duration_mins: submission.duration_mins ?? 0,
      deadline: submission.deadline ?? "",
      endtime: submission.endtime ?? "",
      submitted_at: submission.submitted_at ?? "",
      attempt_number: submission.attempt_number ?? 1,
      max_attempts: submission.max_attempts ?? 1,
      questions_answers: submission.questions_answers ?? [],
      score: submission.score ?? 0,
      max_score: submission.max_score ?? 0,
      feedback: submission.feedback ?? [],
      marked_by: submission.marked_by ? submission.marked_by.toString() : 0,
      marked_at: submission.marked_at ?? "",
      created_at: submission.created_at ?? "",
      updated_at: submission.updated_at ?? "",
      format: submission.format ?? "quiz",
      institution_id: submission.institution_id ?? 0,
      department_id: submission.department_id ?? 0,
      user: submission.user_student_test_user_idTouser
        ? {
            id: submission.user_student_test_user_idTouser.id?.toString() ?? "",
            first_name:
              submission.user_student_test_user_idTouser.first_name ?? "",
            last_name:
              submission.user_student_test_user_idTouser.last_name ?? "",
            email: submission.user_student_test_user_idTouser.email ?? "",
          }
        : undefined,
    };

    return createSuccessResponse(result, user);
  } catch (error) {
    console.error("Error fetching student test submission:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch student test submission",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/studenttest/[id]
 * Update a student test submission (submit answers or grade)
 */
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { id } = await context.params;
    const submissionId = parseInt(id);
    const body = await request.json();

    const { questions_answers, score, feedback, is_grading } = body;

    // Get existing submission
    const existingSubmission = await prisma.student_test.findUnique({
      where: { id: submissionId },
    });

    if (!existingSubmission) {
      return createAuthErrorResponse("Student test submission not found", 404);
    }

    // For grading operations
    if (is_grading) {
      // Check permissions
      if (!hasPermission(user.role, "academic.grades.edit")) {
        return createAuthErrorResponse(
          "Insufficient permissions to grade submissions",
          403
        );
      }

      // Update with grading information
      const updatedSubmission = await prisma.student_test.update({
        where: { id: submissionId },
        data: {
          ...(score !== undefined && { score: parseInt(score) }),
          ...(feedback !== undefined && { feedback }),
          marked_by: parseInt(user.id),
          marked_at: new Date(),
          updated_at: new Date(),
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

      return createSuccessResponse(updatedSubmission, user);
    }

    // For student submission
    // Verify student owns this submission
    if (existingSubmission.user_id.toString() !== user.id) {
      return createAuthErrorResponse(
        "Insufficient permissions to update this submission",
        403
      );
    }

    // Check if already submitted
    if (existingSubmission.submitted_at) {
      return NextResponse.json(
        {
          success: false,
          error: "Test already submitted",
        },
        { status: 409 }
      );
    }

    // Check if time expired
    if (
      existingSubmission.endtime &&
      new Date(existingSubmission.endtime) < new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Test time has expired",
        },
        { status: 403 }
      );
    }

    // Update submission with answers
    const updatedSubmission = await prisma.student_test.update({
      where: { id: submissionId },
      data: {
        questions_answers,
        submitted_at: new Date(),
        updated_at: new Date(),
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

    return createSuccessResponse(updatedSubmission, user);
  } catch (error) {
    console.error("Error updating student test submission:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update student test submission",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/studenttest/[id]
 * Delete a student test submission
 */
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "academic.grades.edit")) {
      return createAuthErrorResponse(
        "Insufficient permissions to delete test submissions",
        403
      );
    }

    const { id } = await context.params;
    const submissionId = parseInt(id);

    // Delete submission
    await prisma.student_test.delete({
      where: { id: submissionId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student test submission deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting student test submission:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete student test submission",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
