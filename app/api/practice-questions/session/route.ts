import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Create a singleton Prisma client for serverless environments
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

interface CreateSessionRequest {
  userId: string;
  lessonId: number;
  questionsData: any[]; // Questions used in the session
}

interface CompleteSessionRequest {
  sessionId: number;
  userAnswers: Record<number, any>; // questionId -> userAnswer mapping
  sessionDurationMins?: number;
}

// POST: Create a new practice session
export async function POST(request: NextRequest) {
  try {
    const body: CreateSessionRequest = await request.json();
    const { userId, lessonId, questionsData } = body;

    // Validation
    if (!userId || !lessonId || !questionsData || questionsData.length === 0) {
      return NextResponse.json(
        {
          error: "Missing required fields: userId, lessonId, and questionsData",
        },
        { status: 400 }
      );
    }

    // Verify lesson exists
    const lesson = await prisma.course_lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Create new practice session
    const session = await prisma.practice_session.create({
      data: {
        user_id: BigInt(userId),
        lesson_id: lessonId,
        questions_data: questionsData,
        total_questions: questionsData.length,
        score: 0,
      },
    });

    return NextResponse.json({
      session: {
        ...session,
        user_id: session.user_id.toString(), // Convert BigInt to string
      },
      message: "Practice session created successfully",
    });
  } catch (error) {
    console.error("Error creating practice session:", error);
    return NextResponse.json(
      {
        error: "Failed to create practice session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT: Complete a practice session with user answers
export async function PUT(request: NextRequest) {
  try {
    const body: CompleteSessionRequest = await request.json();
    const { sessionId, userAnswers, sessionDurationMins } = body;

    // Validation
    if (!sessionId || !userAnswers) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId and userAnswers" },
        { status: 400 }
      );
    }

    // Fetch the session with questions
    const session = await prisma.practice_session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Practice session not found" },
        { status: 404 }
      );
    }

    if (session.completed_at) {
      return NextResponse.json(
        { error: "Practice session already completed" },
        { status: 400 }
      );
    }

    // Calculate score based on correct answers
    const questionsData = session.questions_data as any[];
    let correctAnswers = 0;
    const detailedResults: Array<{
      questionId: any;
      questionText: any;
      userAnswer: any;
      correctAnswer: any;
      isCorrect: boolean;
      explanation: any;
      questionType: any;
    }> = [];

    for (const question of questionsData) {
      const userAnswer = userAnswers[question.id];
      const isCorrect = checkAnswer(question, userAnswer);

      if (isCorrect) {
        correctAnswers++;
      }

      detailedResults.push({
        questionId: question.id,
        questionText: question.question_text,
        userAnswer,
        correctAnswer: question.correct_answer,
        isCorrect,
        explanation: question.explanation,
        questionType: question.question_type,
      });
    }

    const score = correctAnswers;
    const percentage = Math.round((score / questionsData.length) * 100);

    // Update session with completion data
    const updatedSession = await prisma.practice_session.update({
      where: { id: sessionId },
      data: {
        user_answers: userAnswers,
        score,
        completed_at: new Date(),
        session_duration_mins: sessionDurationMins,
      },
    });

    return NextResponse.json({
      session: {
        ...updatedSession,
        user_id: updatedSession.user_id.toString(),
      },
      results: {
        score,
        totalQuestions: questionsData.length,
        percentage,
        correctAnswers,
        incorrectAnswers: questionsData.length - correctAnswers,
        detailedResults,
      },
      message: "Practice session completed successfully",
    });
  } catch (error) {
    console.error("Error completing practice session:", error);
    return NextResponse.json(
      {
        error: "Failed to complete practice session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET: Fetch practice sessions for a user/lesson
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const lessonId = searchParams.get("lessonId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 }
      );
    }

    const where: any = {
      user_id: BigInt(userId),
    };

    if (lessonId) {
      where.lesson_id = parseInt(lessonId);
    }

    const sessions = await prisma.practice_session.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: Math.min(limit, 50),
      include: {
        course_lesson: {
          select: {
            id: true,
            name: true,
            course_module: {
              select: {
                name: true,
                course: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      sessions: sessions.map((session) => ({
        ...session,
        user_id: session.user_id.toString(),
      })),
      total: sessions.length,
    });
  } catch (error) {
    console.error("Error fetching practice sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch practice sessions" },
      { status: 500 }
    );
  }
}

// Helper function to check if an answer is correct
function checkAnswer(question: any, userAnswer: any): boolean {
  const questionType = question.question_type;
  const correctAnswer = question.correct_answer;

  switch (questionType) {
    case "multiple_choice":
      // For multiple choice, compare the selected option key
      return userAnswer === correctAnswer;

    case "true_false":
      // For true/false, compare the selected option key (A or B)
      return userAnswer === correctAnswer;

    default:
      return false;
  }
}
