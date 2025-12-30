import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

/**
 * GET /api/studentcourse
 * Get student course registrations
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { searchParams } = new URL(request.url);
    const student_id = searchParams.get("student_id");
    const course_id = searchParams.get("course_id");
    const semester_id = searchParams.get("semester_id");
    const fields = searchParams.get("fields");

    // Build where clause
    const whereClause: any = {};

    if (student_id) {
      whereClause.student_id = BigInt(student_id);
    }

    if (course_id) {
      whereClause.course_id = parseInt(course_id);
    }

    if (semester_id) {
      whereClause.semester_id = parseInt(semester_id);
    }

    // If user is a student, only show their own registrations
    if (user.role === "STUDENT") {
      const studentRecord = await prisma.student.findFirst({
        where: { user_id: BigInt(user.id) },
      });

      if (studentRecord) {
        whereClause.student_id = studentRecord.id;
      }
    }

    // Check if minimal fields requested
    const isMinimal = fields === "minimal";

    const registrations = await prisma.student_course.findMany({
      where: whereClause,
      include: isMinimal
        ? {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          }
        : {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
                units: true,
              },
            },
            student: {
              select: {
                id: true,
                user_id: true,
                reg_no: true,
              },
            },
            level: {
              select: {
                id: true,
                name: true,
              },
            },
            semester: {
              select: {
                id: true,
                name: true,
                position: true,
              },
            },
          },
      orderBy: { created_at: "desc" },
    });

    return createSuccessResponse(registrations, user);
  } catch (error) {
    console.error("Error fetching student course registrations:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch student course registrations",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/studentcourse
 * Create student course registration(s) - supports single or bulk
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    const body = await request.json();

    // Support both single and bulk registration
    const registrations = Array.isArray(body) ? body : [body];

    // If user is a student, verify they can only register themselves
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

      // Verify all registrations are for this student only
      const allForSelf = registrations.every(
        (reg) => BigInt(reg.student_id) === studentRecord.id
      );

      if (!allForSelf) {
        return createAuthErrorResponse(
          "Students can only register themselves for courses",
          403
        );
      }
    } else {
      // For non-students, check if they have permission to enroll others
      if (!hasPermission(user.role, "courses.enroll")) {
        return createAuthErrorResponse(
          "Insufficient permissions to register students for courses",
          403
        );
      }
    }

    // Validate required fields
    for (const reg of registrations) {
      if (!reg.student_id || !reg.course_id) {
        return NextResponse.json(
          {
            success: false,
            error: "Each registration must have student_id and course_id",
          },
          { status: 400 }
        );
      }
    }

    // Check for duplicate registrations
    const duplicateChecks = await Promise.all(
      registrations.map(async (reg) => {
        const existing = await prisma.student_course.findFirst({
          where: {
            student_id: BigInt(reg.student_id),
            course_id: parseInt(reg.course_id),
            semester_id: reg.semester_id
              ? parseInt(reg.semester_id)
              : undefined,
          },
        });
        return { ...reg, isDuplicate: !!existing };
      })
    );

    const duplicates = duplicateChecks.filter((r) => r.isDuplicate);

    if (duplicates.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Some registrations already exist",
          duplicates: duplicates.map((d) => ({
            student_id: d.student_id,
            course_id: d.course_id,
          })),
        },
        { status: 409 }
      );
    }

    // Create registrations
    const created = await prisma.$transaction(
      registrations.map((reg) =>
        prisma.student_course.create({
          data: {
            student_id: BigInt(reg.student_id),
            course_id: parseInt(reg.course_id),
            semester_id: reg.semester_id ? parseInt(reg.semester_id) : null,
            level_id: reg.level_id ? parseInt(reg.level_id) : null,
            units: reg.units ? parseInt(reg.units) : 0,
            cleared: reg.cleared ?? false,
            approval_status: reg.approval_status ?? false,
            created_by: BigInt(user.id),
            updated_by: BigInt(user.id),
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
            level: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        })
      )
    );

    // Return single object if single registration, array if bulk
    const result = Array.isArray(body) ? created : created[0];

    return createSuccessResponse(result, user);
  } catch (error) {
    console.error("Error creating student course registration:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create student course registration",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
