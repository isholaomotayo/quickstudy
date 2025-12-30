import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { courseId } = await context.params;
    const courseIdNum = parseInt(courseId);
    
    console.log(`Getting semesters for course ${courseId}`);

    // Get distinct semesters for students enrolled in this course
    const studentCourses = await prisma.student_course.findMany({
      where: {
        course_id: courseIdNum,
      },
      select: {
        semester_id: true,
        semester: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
      distinct: ['semester_id'],
    });

    // Extract unique semesters
    const semesters = studentCourses
      .filter((sc) => sc.semester !== null)
      .map((sc) => sc.semester)
      .filter((semester, index, self) => 
        index === self.findIndex((s) => s?.id === semester?.id)
      );

    console.log(`Found ${semesters.length} semesters for course ${courseId}`);
    
    return createSuccessResponse(semesters, user);
  } catch (error) {
    console.error('Error in course semesters API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course semesters', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
