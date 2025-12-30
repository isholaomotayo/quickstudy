import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  authenticateUser,
  createAuthErrorResponse,
} from '@/lib/api-auth';
import { hasPermission } from '@/lib/permissions-config';
import { calculateAndUpdateGPA, calculateStudentGpa } from '@/lib/gpa-calculation';

/**
 * POST /api/studentgpa/batch
 * Batch calculate GPA for multiple students
 * 
 * This is the full port of backend/controllers/studentGpaController.js calculateBatchGpa
 * It calculates GPA for all semester/level combinations for each student
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions - only staff/admin can calculate GPA
    if (!hasPermission(user.role, 'academic.results.manage')) {
      return createAuthErrorResponse(
        'You do not have permission to calculate GPA',
        403
      );
    }

    const body = await request.json();
    const { student_ids, semester_id, level_id } = body;

    // Support both array of student_ids and single student_id
    let studentIds: bigint[] = [];
    if (Array.isArray(student_ids)) {
      studentIds = student_ids.map((id: string | number) => BigInt(id));
    } else if (student_ids) {
      studentIds = [BigInt(student_ids)];
    } else {
      return NextResponse.json(
        {
          error: 'student_ids array or student_id is required',
        },
        { status: 400 }
      );
    }

    console.log(`Processing batch GPA calculation for ${studentIds.length} students`);

    const results: any[] = [];

    // If semester_id and level_id are provided, use calculateStudentGpa for specific semester/level
    if (semester_id && level_id) {
      for (const studentId of studentIds) {
        try {
          const gpaResult = await calculateStudentGpa(
            studentId,
            parseInt(semester_id),
            parseInt(level_id),
            BigInt(user.id)
          );
          results.push({
            student_id: studentId.toString(),
            success: true,
            data: gpaResult,
          });
        } catch (error) {
          console.error(`Error calculating GPA for student ${studentId}:`, error);
          results.push({
            student_id: studentId.toString(),
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } else {
      // Calculate GPA for all semester/level combinations for each student
      // This matches the backend recalculateStudentGpa logic
      for (const studentId of studentIds) {
        try {
          // Get all semesters with results for this student
          const studentCourses = await prisma.student_course.findMany({
            where: {
              student_id: studentId,
            },
            include: {
              student_result: {
                where: {
                  approved: true,
                  publish: true,
                },
              },
              semester: {
                select: {
                  id: true,
                  name: true,
                },
              },
              level: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });

          // Extract unique semester/level combinations
          const semesterLevelMap = new Map<string, { semester_id: number; level_id: number }>();
          
          studentCourses.forEach((course) => {
            if (course.student_result && course.student_result.length > 0) {
              const key = `${course.level_id}-${course.semester_id}`;
              if (!semesterLevelMap.has(key)) {
                semesterLevelMap.set(key, {
                  semester_id: course.semester_id!,
                  level_id: course.level_id!,
                });
              }
            }
          });

          const semesters = Array.from(semesterLevelMap.values()).sort((a, b) => {
            if (a.level_id !== b.level_id) return a.level_id - b.level_id;
            return a.semester_id - b.semester_id;
          });

          const studentResults: any[] = [];
          
          for (const sem of semesters) {
            try {
              const gpaResult = await calculateStudentGpa(
                studentId,
                sem.semester_id,
                sem.level_id,
                BigInt(user.id)
              );
              studentResults.push({
                semester_id: sem.semester_id,
                level_id: sem.level_id,
                success: true,
                data: gpaResult,
              });
            } catch (error) {
              studentResults.push({
                semester_id: sem.semester_id,
                level_id: sem.level_id,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }

          // Also calculate overall CGPA using calculateAndUpdateGPA
          const overallGpa = await calculateAndUpdateGPA(studentId, BigInt(user.id));

          results.push({
            student_id: studentId.toString(),
            success: true,
            overallGpa,
            semesterResults: studentResults,
          });
        } catch (error) {
          console.error(`Error calculating GPA for student ${studentId}:`, error);
          results.push({
            student_id: studentId.toString(),
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`Batch GPA calculation completed: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      message: `Processed ${results.length} students`,
      results,
      summary: {
        successful,
        failed,
      },
    });
  } catch (error) {
    console.error('Error in batch GPA calculation API:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate batch GPA',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
