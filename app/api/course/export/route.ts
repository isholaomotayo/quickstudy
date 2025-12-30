import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";
import { ExportOptions } from "@/lib/types/course-markdown";

/**
 * Generate markdown from course data
 */
function generateCourseMarkdown(
  course: any,
  options: ExportOptions = {}
): string {
  const includeUnpublished = options.includeUnpublished ?? false;
  const includePracticeQuestions = options.includePracticeQuestions ?? true;

  let markdown = `<!-- @course: ${JSON.stringify({
    code: course.code,
    name: course.name,
    description: course.description || "",
    units: course.units,
    department_id: course.department_id || undefined,
    programme_id: course.programme_id || undefined,
    level_id: course.level_id || undefined,
    semester_position: course.semester_position || undefined,
    published: course.published ?? true,
  })} -->\n\n`;

  // Export course-level tests
  if (course.course_test && course.course_test.length > 0) {
    for (const test of course.course_test) {
      if (!includeUnpublished && !test.published) continue;
      if (!test.course_module_id && !test.course_lesson_id) {
        markdown += generateTestMarkdown(test, "course");
      }
    }
  }

  // Export modules
  if (course.course_module && course.course_module.length > 0) {
    const sortedModules = [...course.course_module].sort(
      (a, b) => a.order - b.order
    );

    for (const module of sortedModules) {
      if (!includeUnpublished && !module.published) continue;

      markdown += `## Module: ${module.name}\n`;
      markdown += `<!-- @module: ${JSON.stringify({
        order: module.order,
        description: module.description || undefined,
        published: module.published ?? true,
      })} -->\n\n`;

      // Export module-level tests
      if (module.course_test && module.course_test.length > 0) {
        for (const test of module.course_test) {
          if (!includeUnpublished && !test.published) continue;
          if (!test.course_lesson_id) {
            markdown += generateTestMarkdown(test, "module");
          }
        }
      }

      // Export lessons
      if (module.course_lesson && module.course_lesson.length > 0) {
        const sortedLessons = [...module.course_lesson].sort(
          (a, b) => a.order - b.order
        );

        for (const lesson of sortedLessons) {
          markdown += `### Lesson: ${lesson.name}\n`;
          markdown += `<!-- @lesson: ${JSON.stringify({
            order: lesson.order,
            description: lesson.description || undefined,
          })} -->\n\n`;

          // Export lesson content
          if (lesson.content) {
            markdown += `${lesson.content}\n\n`;
          }

          // Export practice questions
          if (
            includePracticeQuestions &&
            lesson.practice_questions &&
            lesson.practice_questions.length > 0
          ) {
            markdown += `#### Practice Questions\n`;
            markdown += `<!-- @practice: {} -->\n\n`;

            for (const pq of lesson.practice_questions) {
              markdown += generateQuestionMarkdown(pq, true);
            }
            markdown += `\n`;
          }

          // Export lesson-level tests
          if (lesson.course_test && lesson.course_test.length > 0) {
            for (const test of lesson.course_test) {
              if (!includeUnpublished && !test.published) continue;
              markdown += generateTestMarkdown(test, "lesson");
            }
          }
        }
      }
    }
  }

  return markdown;
}

/**
 * Generate markdown for a test/assignment
 */
function generateTestMarkdown(test: any, level: "course" | "module" | "lesson"): string {
  const isAssignment = test.format === "assignment";
  const heading = isAssignment ? "Assignment" : "Test";
  
  let markdown = `#### ${heading}: ${test.name}\n`;
  markdown += `<!-- @test: ${JSON.stringify({
    name: test.name,
    instructions: test.instructions || undefined,
    duration_mins: test.duration_mins || undefined,
    max_attempts: test.max_attempts || undefined,
    deadline: test.deadline
      ? new Date(test.deadline).toISOString()
      : undefined,
    format: test.format || undefined,
    published: test.published ?? true,
  })} -->\n\n`;

  // Export questions
  if (test.course_question && test.course_question.length > 0) {
    const sortedQuestions = [...test.course_question].sort(
      (a, b) => a.order - b.order
    );

    for (const question of sortedQuestions) {
      markdown += generateQuestionMarkdown(question, false);
    }
  }

  markdown += `\n`;
  return markdown;
}

/**
 * Generate markdown for a question
 */
function generateQuestionMarkdown(
  question: any,
  isPractice: boolean
): string {
  let markdown = `**Q${question.order || 1}:** ${question.question || question.question_text}\n`;

  // Export options if available
  if (question.options) {
    let options: Record<string, { text: string; is_correct: boolean }>;
    try {
      options =
        typeof question.options === "string"
          ? JSON.parse(question.options)
          : question.options;
    } catch {
      options = {};
    }

    const optionKeys = Object.keys(options).sort();
    for (const key of optionKeys) {
      const option = options[key];
      const marker = option.is_correct ? "[x]" : "[ ]";
      markdown += `- ${marker} ${option.text}${option.is_correct ? " (correct)" : ""}\n`;
    }
  }

  // Export explanation
  if (question.explanation) {
    markdown += `\n**Explanation:** ${question.explanation}\n`;
  }

  // Export marks (for test questions)
  if (!isPractice && question.marks) {
    markdown += `**Marks:** ${question.marks}\n`;
  }

  // Export order
  markdown += `**Order:** ${question.order || 1}\n`;

  // Export difficulty and type (for practice questions)
  if (isPractice) {
    if (question.difficulty_level) {
      markdown += `**Difficulty:** ${question.difficulty_level}\n`;
    }
    if (question.question_type) {
      markdown += `**Type:** ${question.question_type}\n`;
    }
  }

  markdown += `\n`;
  return markdown;
}

/**
 * GET /api/course/export
 * Export a course to markdown format
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "lms.content.read")) {
      return createAuthErrorResponse(
        "Insufficient permissions to export courses",
        403
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("course_id");
    const includeUnpublished = searchParams.get("include_unpublished") === "true";
    const includePracticeQuestions =
      searchParams.get("include_practice_questions") !== "false";

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          error: "course_id parameter is required",
        },
        { status: 400 }
      );
    }

    // Fetch course with all relations
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
      include: {
        course_module: {
          where: includeUnpublished ? {} : { published: true },
          include: {
            course_lesson: {
              include: {
                practice_questions: includePracticeQuestions
                  ? {
                      orderBy: { created_at: "asc" },
                    }
                  : false,
                course_test: {
                  where: includeUnpublished ? {} : { published: true },
                  include: {
                    course_question: {
                      orderBy: { order: "asc" },
                    },
                  },
                },
              },
              orderBy: { order: "asc" },
            },
            course_test: {
              where: includeUnpublished ? {} : { published: true },
              include: {
                course_question: {
                  orderBy: { order: "asc" },
                },
              },
            },
          },
          orderBy: { order: "asc" },
        },
        course_test: {
          where: includeUnpublished ? {} : { published: true },
          include: {
            course_question: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: "Course not found",
        },
        { status: 404 }
      );
    }

    // Generate markdown
    const markdown = generateCourseMarkdown(course, {
      includeUnpublished,
      includePracticeQuestions,
    });

    // Return as file download
    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="course-${course.code}-${Date.now()}.md"`,
      },
    });
  } catch (error) {
    console.error("Error exporting course:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to export course",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

