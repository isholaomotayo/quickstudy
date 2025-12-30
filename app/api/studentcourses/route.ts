import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from '@/lib/api-auth';

/**
 * GET /api/studentcourses
 * Get student course registrations (alias for /api/studentcourse)
 * This route uses the same logic as /api/studentcourse for consistency
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

    console.log(`Found ${registrations.length} student courses`);
    
    return createSuccessResponse(registrations, user);
  } catch (error) {
    console.error('Error in student courses API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student courses', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
