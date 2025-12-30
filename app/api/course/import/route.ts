import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";
import { parseCourseMarkdown, validateParsedCourse } from "@/lib/course-markdown-parser";
import { ImportResult, ValidationError } from "@/lib/types/course-markdown";

/**
 * POST /api/course/import
 * Import a course from markdown document
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "lms.content.create")) {
      return createAuthErrorResponse(
        "Insufficient permissions to import courses",
        403
      );
    }

    const formData = await request.formData();
    const markdownFile = formData.get("file") as File | null;
    const markdownText = formData.get("markdown") as string | null;
    const departmentId = formData.get("department_id") as string | null;

    if (!markdownFile && !markdownText) {
      return NextResponse.json(
        {
          success: false,
          error: "Either markdown file or markdown text is required",
        },
        { status: 400 }
      );
    }

    // Get markdown content
    let markdown: string;
    if (markdownFile) {
      markdown = await markdownFile.text();
    } else {
      markdown = markdownText!;
    }

    // Parse markdown
    const parsedCourse = parseCourseMarkdown(markdown);

    // Validate parsed course
    const validation = validateParsedCourse(parsedCourse);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          validation: validation,
        },
        { status: 400 }
      );
    }

    // Use department_id from form or from parsed course metadata
    const finalDepartmentId = departmentId
      ? parseInt(departmentId)
      : parsedCourse.metadata.department_id;

    if (!finalDepartmentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Department ID is required (provide in form or course metadata)",
        },
        { status: 400 }
      );
    }

    // Import course in transaction
    const result = await prisma.$transaction(async (tx) => {
      const importResult: ImportResult = {
        success: false,
        created: {
          course: false,
          modules: 0,
          lessons: 0,
          tests: 0,
          questions: 0,
          practiceQuestions: 0,
        },
        warnings: validation.warnings,
      };

      try {
        // Create course
        const course = await tx.course.create({
          data: {
            code: parsedCourse.metadata.code,
            name: parsedCourse.metadata.name,
            description: parsedCourse.metadata.description,
            units: parsedCourse.metadata.units,
            department_id: finalDepartmentId,
            programme_id: parsedCourse.metadata.programme_id || null,
            level_id: parsedCourse.metadata.level_id || null,
            semester_position: parsedCourse.metadata.semester_position || null,
            published: parsedCourse.metadata.published ?? true,
          },
        });

        importResult.courseId = course.id;
        importResult.created.course = true;

        // Create course-level tests
        for (const testData of parsedCourse.tests) {
          const test = await tx.course_test.create({
            data: {
              course_id: course.id,
              name: testData.metadata.name,
              instructions: testData.metadata.instructions || null,
              duration_mins: testData.metadata.duration_mins || null,
              deadline: testData.metadata.deadline
                ? new Date(testData.metadata.deadline)
                : null,
              max_attempts: testData.metadata.max_attempts || 1,
              max_score: 0, // Will be calculated from questions
              format: testData.metadata.format || "",
              published: testData.metadata.published ?? true,
            },
          });

          importResult.created.tests++;

          // Create questions for this test
          let questionOrder = 1;
          for (const questionData of testData.questions) {
            const maxScore = questionData.marks || 1;
            await tx.course_question.create({
              data: {
                course_test_id: test.id,
                question: questionData.question,
                details: questionData.details || null,
                options: questionData.options
                  ? JSON.stringify(questionData.options)
                  : Prisma.JsonNull,
                answer: questionData.correct_answer || "",
                order: questionData.order || questionOrder++,
                marks: maxScore,
              },
            });
            importResult.created.questions++;
          }

          // Update test max_score
          const totalMarks = testData.questions.reduce(
            (sum, q) => sum + (q.marks || 1),
            0
          );
          await tx.course_test.update({
            where: { id: test.id },
            data: { max_score: totalMarks },
          });
        }

        // Create modules
        for (const moduleData of parsedCourse.modules) {
          const module = await tx.course_module.create({
            data: {
              course_id: course.id,
              name: moduleData.name,
              order: moduleData.metadata.order,
              description: moduleData.metadata.description || null,
              published: moduleData.metadata.published ?? true,
            },
          });

          importResult.created.modules++;

          // Create module-level tests
          for (const testData of moduleData.tests) {
            const test = await tx.course_test.create({
              data: {
                course_id: course.id,
                course_module_id: module.id,
                name: testData.metadata.name,
                instructions: testData.metadata.instructions || null,
                duration_mins: testData.metadata.duration_mins || null,
                deadline: testData.metadata.deadline
                  ? new Date(testData.metadata.deadline)
                  : null,
                max_attempts: testData.metadata.max_attempts || 1,
                max_score: 0,
                format: testData.metadata.format || "",
                published: testData.metadata.published ?? true,
              },
            });

            importResult.created.tests++;

            // Create questions for this test
            let questionOrder = 1;
            for (const questionData of testData.questions) {
              const maxScore = questionData.marks || 1;
              await tx.course_question.create({
                data: {
                  course_test_id: test.id,
                  question: questionData.question,
                  details: questionData.details || null,
                  options: questionData.options
                    ? JSON.stringify(questionData.options)
                    : Prisma.JsonNull,
                  answer: questionData.correct_answer || "",
                  order: questionData.order || questionOrder++,
                  marks: maxScore,
                },
              });
              importResult.created.questions++;
            }

            // Update test max_score
            const totalMarks = testData.questions.reduce(
              (sum, q) => sum + (q.marks || 1),
              0
            );
            await tx.course_test.update({
              where: { id: test.id },
              data: { max_score: totalMarks },
            });
          }

          // Create lessons
          for (const lessonData of moduleData.lessons) {
            const lesson = await tx.course_lesson.create({
              data: {
                course_module_id: module.id,
                name: lessonData.name,
                order: lessonData.metadata.order,
                description: lessonData.metadata.description || null,
                content: lessonData.content || "",
              },
            });

            importResult.created.lessons++;

            // Create practice questions for this lesson
            for (const practiceQuestion of lessonData.practiceQuestions) {
              await tx.practice_question.create({
                data: {
                  lesson_id: lesson.id,
                  question_text: practiceQuestion.question_text,
                  question_type: practiceQuestion.question_type || "multiple_choice",
                  options: practiceQuestion.options
                    ? JSON.stringify(practiceQuestion.options)
                    : Prisma.JsonNull,
                  correct_answer: practiceQuestion.correct_answer || null,
                  explanation: practiceQuestion.explanation,
                  difficulty_level: practiceQuestion.difficulty || "medium",
                  ai_generated: false,
                  generated_by_user: BigInt(user.id),
                },
              });
              importResult.created.practiceQuestions++;
            }

            // Create lesson-level tests
            for (const testData of lessonData.tests) {
              const test = await tx.course_test.create({
                data: {
                  course_id: course.id,
                  course_module_id: module.id,
                  course_lesson_id: lesson.id,
                  name: testData.metadata.name,
                  instructions: testData.metadata.instructions || null,
                  duration_mins: testData.metadata.duration_mins || null,
                  deadline: testData.metadata.deadline
                    ? new Date(testData.metadata.deadline)
                    : null,
                  max_attempts: testData.metadata.max_attempts || 1,
                  max_score: 0,
                  format: testData.metadata.format || "",
                  published: testData.metadata.published ?? true,
                },
              });

              importResult.created.tests++;

              // Create questions for this test
              let questionOrder = 1;
              for (const questionData of testData.questions) {
                const maxScore = questionData.marks || 1;
                await tx.course_question.create({
                  data: {
                    course_test_id: test.id,
                    question: questionData.question,
                    details: questionData.details || null,
                    options: questionData.options
                      ? JSON.stringify(questionData.options)
                      : Prisma.JsonNull,
                    answer: questionData.correct_answer || "",
                    order: questionData.order || questionOrder++,
                    marks: maxScore,
                  },
                });
                importResult.created.questions++;
              }

              // Update test max_score
              const totalMarks = testData.questions.reduce(
                (sum, q) => sum + (q.marks || 1),
                0
              );
              await tx.course_test.update({
                where: { id: test.id },
                data: { max_score: totalMarks },
              });
            }
          }
        }

        importResult.success = true;
        return importResult;
      } catch (error) {
        console.error("Error during course import:", error);
        throw error;
      }
    });

    return createSuccessResponse(result, user);
  } catch (error) {
    console.error("Error importing course:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to import course",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

