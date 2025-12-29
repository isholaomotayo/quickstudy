import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";

/**
 * Calculate test score based on answers and questions
 */
function calculateTestScore(
  questionsAnswers: any[],
  questionsByID: Record<string, any>
): number {
  let totalScore = 0;

  for (const answer of questionsAnswers) {
    const question = questionsByID[answer.questionId];
    if (!question || !answer.selection) continue;

    const questionMarks = question.marks || 0;
    let isCorrect = true;

    // Check each option
    const options = question.options || {};
    for (const [optionKey, option] of Object.entries(options) as [
      string,
      any
    ][]) {
      const isSelected = answer.selection[optionKey]?.is_answer || false;
      const shouldBeSelected = option.is_correct || option.correct || false;

      if (isSelected !== shouldBeSelected) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      totalScore += questionMarks;
    }
  }

  return totalScore;
}

/**
 * POST /api/studenttest/finish
 * Submit/finish a test attempt
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Only students can finish tests
    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          error: "Only students can finish tests",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { student_test_id, questions_answers } = body;

    // Validate required fields
    if (!student_test_id) {
      return NextResponse.json(
        {
          success: false,
          error: "student_test_id is required",
        },
        { status: 400 }
      );
    }

    // Get the student test record
    const studentTest = await prisma.student_test.findFirst({
      where: {
        id: parseInt(student_test_id),
        submitted_at: null,
      },
    });

    if (!studentTest) {
      return NextResponse.json(
        {
          success: false,
          pageNotif: "invalid_test_submit_attempt",
        },
        { status: 404 }
      );
    }

    // Validate ownership
    if (Number(studentTest.user_id) !== parseInt(user.id)) {
      return NextResponse.json(
        {
          success: false,
          pageNotif: "test_wronguser_submit_attempt",
        },
        { status: 403 }
      );
    }

    // Check if already submitted
    if (studentTest.submitted_at) {
      return NextResponse.json(
        {
          success: false,
          pageNotif: "test_already_submitted",
        },
        { status: 400 }
      );
    }

    const currentDatetime = new Date();

    // Check if endtime exceeded (with 1 minute grace period)
    if (studentTest.endtime) {
      const maxEndTime = new Date(
        new Date(studentTest.endtime).getTime() + 60000
      );
      if (currentDatetime > maxEndTime) {
        return NextResponse.json(
          {
            success: false,
            pageNotif: "test_endtime_exeeded",
          },
          { status: 403 }
        );
      }
    }

    // Check if deadline exceeded
    if (
      studentTest.deadline &&
      currentDatetime > new Date(studentTest.deadline)
    ) {
      return NextResponse.json(
        {
          success: false,
          pageNotif: "test_late_submit_attempt",
        },
        { status: 403 }
      );
    }

    // Get all test questions
    const testQuestions = await prisma.course_question.findMany({
      where: { course_test_id: studentTest.course_test_id },
    });

    if (testQuestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          pageNotif: "test_no_questions",
        },
        { status: 400 }
      );
    }

    // Build questions lookup
    const questionsByID: Record<string, any> = {};
    testQuestions.forEach((question) => {
      questionsByID[question.id] = question;
    });

    // Process questions and answers
    const processedQuestionsAnswers = (questions_answers || [])
      .map((questionAnswer: any) => {
        const testQuestion = questionsByID[questionAnswer.questionId];
        if (!testQuestion) return null;

        // Build selection with both user's answer and option text
        let selection: any = {};

        if (
          questionAnswer.selection &&
          typeof questionAnswer.selection === "object"
        ) {
          const options = testQuestion.options || {};

          // For each option in the question, add both text and user's selection
          Object.entries(options).forEach(
            ([optionKey, option]: [string, any]) => {
              selection[optionKey] = {
                text: option.text || "",
                is_answer:
                  questionAnswer.selection[optionKey]?.is_answer || false,
                is_correct: option.is_correct || option.correct || false, // Store correct answer for review
              };
            }
          );
        } else if (questionAnswer.text_answer || questionAnswer.file_answer) {
          // For essay/assignment questions
          selection = {
            text_answer: questionAnswer.text_answer,
            file_answer: questionAnswer.file_answer,
          };
        }

        return {
          questionId: questionAnswer.questionId,
          questionOrder: testQuestion.order,
          questionMarks: testQuestion.marks,
          questionText: testQuestion.question,
          questionDetails: testQuestion.details,
          selection: selection,
        };
      })
      .filter(Boolean);

    // Calculate score if selections are provided (objective test)
    let score = 0;
    if (
      processedQuestionsAnswers.length > 0 &&
      processedQuestionsAnswers[0].selection &&
      typeof processedQuestionsAnswers[0].selection === "object" &&
      !processedQuestionsAnswers[0].selection.text_answer
    ) {
      score = calculateTestScore(questions_answers || [], questionsByID);
    }

    // Update the student test record
    const updatedStudentTest = await prisma.student_test.update({
      where: { id: parseInt(student_test_id) },
      data: {
        questions_answers: processedQuestionsAnswers as any,
        score,
        submitted_at: currentDatetime,
      },
      include: {
        course_test: {
          select: {
            id: true,
            name: true,
            course_id: true,
            max_score: true,
            format: true,
          },
        },
      },
    });

    return createSuccessResponse(updatedStudentTest, user);
  } catch (error) {
    console.error("Error finishing student test:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to finish test",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
