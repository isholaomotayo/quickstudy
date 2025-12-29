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
 * GET /api/course/[id]
 * Get a specific course by ID
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { id } = await context.params;
    const courseId = parseInt(id);

    // Determine if user is admin/staff who should see all tests
    const canManageTests =
      user.role === 'ADMIN' ||
      user.role === 'SUPERADMIN' ||
      user.role === 'HOD' ||
      user.role === 'STAFF';

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        programme: true,
        level: true,
        department: true,
        course_module: {
          include: {
            course_lesson: {
              include: {
                course_test: {
                  // Only filter by published status for students
                  where: canManageTests ? {} : { published: true },
                  include: {
                    course_question: {
                      orderBy: { order: "asc" },
                    },
                  },
                  orderBy: { created_at: "desc" },
                },
              },
              orderBy: { order: "asc" },
            },
            course_test: {
              // Only filter by published status for students
              where: canManageTests ? {} : { published: true },
              include: {
                course_question: {
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { created_at: "desc" },
            },
          },
          orderBy: { order: "asc" },
        },
        staff_course: {
          include: {
            staff: {
              include: {
                user_staff_user_idTouser: {
                  select: {
                    first_name: true,
                    last_name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      return createAuthErrorResponse("Course not found", 404);
    }

    // Add progress data for students
    if (user.role === "STUDENT") {
      // Get student record
      const student = await prisma.student.findFirst({
        where: { user_id: BigInt(user.id) },
      });

      if (student) {
        // Get course progress for this student
        const courseProgress = await prisma.course_progress.findFirst({
          where: {
            student_id: student.id,
            course_id: courseId,
          },
        });

        let courseData: any = course;

        if (courseProgress) {
          // Get progress data from JSONB field
          const progressData = (courseProgress.progress_data as any) || {};

          // Add overall course progress
          courseData = {
            ...courseData,
            completion_percentage:
              Number(courseProgress.completion_percentage) || 0,
            total_lessons: courseProgress.total_lessons || 0,
            completed_lessons: courseProgress.completed_lessons || 0,
            student_enrolled: courseProgress.status !== "not_started",
            student_completed: courseProgress.status === "completed",
            has_result: courseProgress.status === "completed",
            enrollment_status:
              courseProgress.status === "completed"
                ? "completed"
                : courseProgress.status === "not_started"
                ? "not_enrolled"
                : "enrolled",
            last_accessed_at: courseProgress.last_accessed_at,
          };

          // Add module-level progress data
          if (
            courseData.course_module &&
            Array.isArray(courseData.course_module)
          ) {
            courseData.course_module = courseData.course_module.map(
              (module: any) => {
                const moduleId = module.id;
                const moduleData = progressData[String(moduleId)] || {};
                const moduleCompletedLessons =
                  moduleData.completed_lessons || [];
                const totalModuleLessons = module.course_lesson
                  ? module.course_lesson.length
                  : 0;
                const moduleProgressPercentage =
                  totalModuleLessons > 0
                    ? Math.round(
                        (moduleCompletedLessons.length / totalModuleLessons) *
                          100
                      )
                    : 0;

                return {
                  ...module,
                  // Add module-specific progress
                  progress_percentage: moduleProgressPercentage,
                  completed: moduleProgressPercentage >= 100,
                  completed_lessons_count: moduleCompletedLessons.length,
                  total_lessons_count: totalModuleLessons,
                  completed_lesson_ids: moduleCompletedLessons,
                  // Transform course_test to course_tests for frontend compatibility
                  course_tests: module.course_test
                    ? module.course_test.map((test: any) => ({
                        ...test,
                        course_questions: test.course_question || [],
                      }))
                    : [],
                  // Add lesson-level progress data
                  course_lesson: module.course_lesson
                    ? module.course_lesson.map((lesson: any) => ({
                        ...lesson,
                        completed: moduleCompletedLessons.includes(lesson.id),
                        is_current:
                          courseProgress.current_lesson_id === lesson.id,
                        is_last_accessed:
                          courseProgress.last_lesson_id === lesson.id,
                        // Transform course_test to course_tests for frontend compatibility
                        course_tests: lesson.course_test
                          ? lesson.course_test.map((test: any) => ({
                              ...test,
                              course_questions: test.course_question || [],
                            }))
                          : [],
                      }))
                    : [],
                };
              }
            );
          }

          return createSuccessResponse(courseData, user);
        } else {
          // No progress found - set default values
          courseData = {
            ...courseData,
            completion_percentage: 0,
            total_lessons: 0,
            completed_lessons: 0,
            student_enrolled: false,
            student_completed: false,
            has_result: false,
            enrollment_status: "not_enrolled",
            last_accessed_at: null,
          };

          // Add default module progress
          if (
            courseData.course_module &&
            Array.isArray(courseData.course_module)
          ) {
            courseData.course_module = courseData.course_module.map(
              (module: any) => ({
                ...module,
                progress_percentage: 0,
                completed: false,
                completed_lessons_count: 0,
                total_lessons_count: module.course_lesson
                  ? module.course_lesson.length
                  : 0,
                completed_lesson_ids: [],
                // Transform course_test to course_tests for frontend compatibility
                course_tests: module.course_test
                  ? module.course_test.map((test: any) => ({
                      ...test,
                      course_questions: test.course_question || [],
                    }))
                  : [],
                course_lesson: module.course_lesson
                  ? module.course_lesson.map((lesson: any) => ({
                      ...lesson,
                      // Transform course_test to course_tests for frontend compatibility
                      course_tests: lesson.course_test
                        ? lesson.course_test.map((test: any) => ({
                            ...test,
                            course_questions: test.course_question || [],
                          }))
                        : [],
                    }))
                  : [],
              })
            );
          }

          return createSuccessResponse(courseData, user);
        }
      }
    }

    // Transform field names for non-student users (admin/staff)
    const transformedCourse = {
      ...course,
      course_module: course.course_module
        ? course.course_module.map((module: any) => ({
            ...module,
            // Transform course_test to course_tests for frontend compatibility
            course_tests: module.course_test
              ? module.course_test.map((test: any) => ({
                  ...test,
                  course_questions: test.course_question || [],
                }))
              : [],
            course_lesson: module.course_lesson
              ? module.course_lesson.map((lesson: any) => ({
                  ...lesson,
                  // Transform course_test to course_tests for frontend compatibility
                  course_tests: lesson.course_test
                    ? lesson.course_test.map((test: any) => ({
                        ...test,
                        course_questions: test.course_question || [],
                      }))
                    : [],
                }))
              : [],
          }))
        : [],
    };

    return createSuccessResponse(transformedCourse, user);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/course/[id]
 * Update a course
 */
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "courses.edit")) {
      return createAuthErrorResponse(
        "Insufficient permissions to update courses",
        403
      );
    }

    const { id } = await context.params;
    const courseId = parseInt(id);
    const body = await request.json();

    const {
      code,
      name,
      units,
      description,
      programme_id,
      level_id,
      department_id,
      semester_position,
      published,
    } = body;

    // Update course
    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(code !== undefined && { code }),
        ...(name !== undefined && { name }),
        ...(units !== undefined && { units: parseInt(units) }),
        ...(description !== undefined && { description }),
        ...(programme_id !== undefined && {
          programme_id: programme_id ? parseInt(programme_id) : null,
        }),
        ...(level_id !== undefined && {
          level_id: level_id ? parseInt(level_id) : null,
        }),
        ...(department_id !== undefined && {
          department_id: department_id ? parseInt(department_id) : null,
        }),
        ...(semester_position !== undefined && {
          semester_position: semester_position
            ? parseInt(semester_position)
            : null,
        }),
        ...(published !== undefined && { published }),
        updated_at: new Date(),
      },
      include: {
        programme: true,
        level: true,
        department: true,
        course_module: true,
      },
    });

    return createSuccessResponse(course, user);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/course/[id]
 * Delete a course
 */
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "courses.delete")) {
      return createAuthErrorResponse(
        "Insufficient permissions to delete courses",
        403
      );
    }

    const { id } = await context.params;
    const courseId = parseInt(id);

    // Check if course has enrollments
    const enrollmentCount = await prisma.student_course.count({
      where: { course_id: courseId },
    });

    if (enrollmentCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete course with active enrollments",
        },
        { status: 400 }
      );
    }

    // Delete course
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete course",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
