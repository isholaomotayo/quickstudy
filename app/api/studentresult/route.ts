import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  authenticateUser,
  createAuthErrorResponse,
} from '@/lib/api-auth';
import { hasPermission } from '@/lib/permissions-config';
import { calculateAndUpdateGPA } from '@/lib/gpa-calculation';

/**
 * POST /api/studentresult
 * Bulk upload student results
 * Supports batch upload with array of results
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions - only staff/admin can upload results
    if (!hasPermission(user.role, 'academic.results.manage')) {
      return createAuthErrorResponse(
        'You do not have permission to upload results',
        403
      );
    }

    const body = await request.json();
    const { results } = body;

    // Check if this is a batch request
    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        {
          error: 'Results array is required and cannot be empty for batch upload',
        },
        { status: 400 }
      );
    }

    console.log(`Processing bulk student result upload: ${results.length} results`);

    const uploadedResults: any[] = [];
    const errors: any[] = [];
    const affectedStudents = new Set<bigint>();

    // Use transaction to ensure data integrity
    try {
      await prisma.$transaction(async (tx) => {
        for (let i = 0; i < results.length; i++) {
          const resultData = results[i];

          try {
            // Validate required fields
            if (!resultData.student_course_id) {
              errors.push({
                index: i + 1,
                regNo: resultData._metadata?.regNo || 'N/A',
                error: 'Missing student_course_id',
              });
              continue;
            }

            if (!resultData.grade_id) {
              errors.push({
                index: i + 1,
                regNo: resultData._metadata?.regNo || 'N/A',
                error: 'Missing grade_id',
              });
              continue;
            }

            if (resultData.score === undefined || resultData.score === null) {
              errors.push({
                index: i + 1,
                regNo: resultData._metadata?.regNo || 'N/A',
                error: 'Missing score',
              });
              continue;
            }

            const studentCourseId = BigInt(resultData.student_course_id);

            // Check if result already exists
            const existingResult = await tx.student_result.findFirst({
              where: {
                student_course_id: studentCourseId,
              },
              include: {
                student_course: {
                  select: {
                    student_id: true,
                  },
                },
              },
            });

            let studentId: bigint | null = null;

            if (existingResult) {
              // Update existing result
              const updated = await tx.student_result.update({
                where: { id: existingResult.id },
                data: {
                  score: String(resultData.score),
                  grade_id: parseInt(resultData.grade_id),
                  ca_mark: resultData.ca_mark ? parseFloat(resultData.ca_mark) : null,
                  exam_score: resultData.exam_score ? parseFloat(resultData.exam_score) : null,
                  approved: true,
                  publish: true,
                  updated_by: BigInt(user.id),
                  updated_at: new Date(),
                },
                include: {
                  grade: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  student_course: {
                    include: {
                      student: {
                        select: {
                          id: true,
                          reg_no: true,
                        },
                      },
                    },
                  },
                },
              });

              studentId = updated.student_course?.student?.id || null;

              uploadedResults.push({
                id: updated.id.toString(),
                student_course_id: resultData.student_course_id,
                score: updated.score,
                grade: updated.grade?.name || 'N/A',
                status: 'Updated',
                regNo: resultData._metadata?.regNo || updated.student_course?.student?.reg_no || 'N/A',
                studentId: studentId ? studentId.toString() : null,
              });
            } else {
              // Create new result
              // First get student_course to get student_id
              const studentCourse = await tx.student_course.findUnique({
                where: { id: studentCourseId },
                select: {
                  student_id: true,
                  student: {
                    select: {
                      id: true,
                      reg_no: true,
                    },
                  },
                },
              });

              if (!studentCourse) {
                errors.push({
                  index: i + 1,
                  regNo: resultData._metadata?.regNo || 'N/A',
                  error: 'Student course not found',
                });
                continue;
              }

              studentId = studentCourse.student_id;

              const created = await tx.student_result.create({
                data: {
                  student_course_id: studentCourseId,
                  score: String(resultData.score),
                  grade_id: parseInt(resultData.grade_id),
                  ca_mark: resultData.ca_mark ? parseFloat(resultData.ca_mark) : null,
                  exam_score: resultData.exam_score ? parseFloat(resultData.exam_score) : null,
                  approved: true,
                  publish: true,
                  created_by: BigInt(user.id),
                  updated_by: BigInt(user.id),
                },
                include: {
                  grade: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  student_course: {
                    include: {
                      student: {
                        select: {
                          id: true,
                          reg_no: true,
                        },
                      },
                    },
                  },
                },
              });

              uploadedResults.push({
                id: created.id.toString(),
                student_course_id: resultData.student_course_id,
                score: created.score,
                grade: created.grade?.name || 'N/A',
                status: 'Created',
                regNo: resultData._metadata?.regNo || created.student_course?.student?.reg_no || 'N/A',
                studentId: studentId ? studentId.toString() : null,
              });
            }

            // Track student for GPA calculation
            if (studentId) {
              affectedStudents.add(studentId);
            }
          } catch (error) {
            console.error(`Error processing result ${i + 1}:`, error);
            errors.push({
              index: i + 1,
              regNo: resultData._metadata?.regNo || 'N/A',
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            // Continue processing other records
          }
        }
      });
    } catch (transactionError) {
      console.error('Transaction failed:', transactionError);
      throw transactionError;
    }

    // Calculate GPA for all affected students after successful batch upload
    console.log(
      `Starting GPA calculation for ${
        affectedStudents.size
      } affected students: ${Array.from(affectedStudents).map((id) => id.toString())}`
    );
    const gpaResults: any[] = [];

    if (affectedStudents.size > 0) {
      for (const studentId of affectedStudents) {
        try {
          console.log(`Calculating GPA for student ${studentId}...`);
          const gpaResult = await calculateAndUpdateGPA(studentId, BigInt(user.id));
          gpaResults.push(gpaResult);
          console.log(
            `GPA calculation completed for student ${studentId}: CGPA = ${gpaResult.cgpa}`
          );
        } catch (gpaError) {
          console.error(
            `Error calculating GPA for student ${studentId}:`,
            gpaError
          );
          // Add error to results but don't fail the entire operation
          gpaResults.push({
            studentId: studentId.toString(),
            error: gpaError instanceof Error ? gpaError.message : 'Unknown error',
            success: false,
          });
        }
      }
    } else {
      console.warn('No affected students found for GPA calculation');
    }

    console.log(
      `Batch upload completed: ${uploadedResults.length} successful, ${errors.length} errors, ${gpaResults.length} GPA calculations`
    );

    return NextResponse.json({
      success: true,
      uploaded: uploadedResults.length,
      errors: errors.length,
      results: uploadedResults,
      errorDetails: errors,
      gpaCalculations: gpaResults,
      affectedStudentsCount: affectedStudents.size,
      affectedStudents: Array.from(affectedStudents).map((id) => id.toString()),
    });
  } catch (error) {
    console.error('Error in student result upload API:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload results',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
