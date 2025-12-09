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
 * GET /api/studentcourse/[id]
 * Get a specific student course registration
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { id } = await context.params;
    const registrationId = parseInt(id);

    const registration = await prisma.student_course.findUnique({
      where: { id: registrationId },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
          },
        },
        student: {
          select: {
            id: true,
            user_id: true,
            reg_no: true,
          },
        },
        semester: {
          select: {
            id: true,
            name: true,
            start_date: true,
            end_date: true,
          },
        },
        user_student_course_created_byTouser: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        user_student_course_updated_byTouser: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    if (!registration) {
      return createAuthErrorResponse(
        "Student course registration not found",
        404
      );
    }

    return createSuccessResponse(registration, user);
  } catch (error) {
    console.error("Error fetching student course registration:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch student course registration",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/studentcourse/[id]
 * Update a student course registration
 */
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "courses.enroll")) {
      return createAuthErrorResponse(
        "Insufficient permissions to update student course registrations",
        403
      );
    }

    const { id } = await context.params;
    const registrationId = parseInt(id);
    const body = await request.json();

    const { semester_id, level_id, units, cleared, approval_status } = body;

    // Update registration
    const registration = await prisma.student_course.update({
      where: { id: registrationId },
      data: {
        ...(semester_id !== undefined && {
          semester_id: semester_id ? parseInt(semester_id) : null,
        }),
        ...(level_id !== undefined && {
          level_id: level_id ? parseInt(level_id) : null,
        }),
        ...(units !== undefined && { units: parseInt(units) }),
        ...(cleared !== undefined && { cleared }),
        ...(approval_status !== undefined && { approval_status }),
        updated_by: parseInt(user.id),
        updated_at: new Date(),
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        student: {
          select: {
            id: true,
            user_id: true,
            reg_no: true,
          },
        },
      },
    });

    return createSuccessResponse(registration, user);
  } catch (error) {
    console.error("Error updating student course registration:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update student course registration",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/studentcourse/[id]
 * Delete a student course registration
 */
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    const { id } = await context.params;
    const registrationId = parseInt(id);

    // Get the registration to check ownership
    const registration = await prisma.student_course.findUnique({
      where: { id: registrationId },
      select: {
        id: true,
        student_id: true,
        approval_status: true,
      },
    });

    if (!registration) {
      return createAuthErrorResponse(
        "Student course registration not found",
        404
      );
    }

    // If user is a student, verify they can only delete their own registrations
    if (user.role === "STUDENT") {
      // Get student record for the authenticated user
      const studentRecord = await prisma.student.findFirst({
        where: { user_id: BigInt(user.id) },
      });

      if (!studentRecord) {
        return createAuthErrorResponse(
          "Student record not found",
          404
        );
      }

      // Verify this registration belongs to this student
      if (Number(registration.student_id) !== Number(studentRecord.id)) {
        return createAuthErrorResponse(
          "You can only delete your own course registrations",
          403
        );
      }

      // Students can only delete pending (non-approved) registrations
      if (registration.approval_status) {
        return createAuthErrorResponse(
          "Cannot delete approved course registrations. Please contact administration.",
          403
        );
      }
    } else {
      // For non-students, check if they have permission to unenroll others
      if (!hasPermission(user.role, "courses.enroll")) {
        return createAuthErrorResponse(
          "Insufficient permissions to delete student course registrations",
          403
        );
      }
    }

    // Delete registration
    await prisma.student_course.delete({
      where: { id: registrationId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student course registration deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting student course registration:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete student course registration",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
