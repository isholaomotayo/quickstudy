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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const difficultyLevel = searchParams.get("difficultyLevel");
    const questionType = searchParams.get("questionType");

    if (!lessonId) {
      return NextResponse.json(
        { error: "Missing required parameter: lessonId" },
        { status: 400 }
      );
    }

    const where: any = {
      lesson_id: parseInt(lessonId),
    };

    if (difficultyLevel) {
      where.difficulty_level = difficultyLevel;
    }

    if (questionType) {
      where.question_type = questionType;
    }

    const questions = await prisma.practice_question.findMany({
      where,
      orderBy: [
        { difficulty_level: "asc" },
        { created_at: "desc" }
      ],
      take: Math.min(limit, 100),
      include: {
        generated_by: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          }
        }
      }
    });

    // Convert all questions with BigInt handling
    const serializedQuestions = questions.map(q => ({
      ...q,
      generated_by_user: q.generated_by_user.toString(),
      generated_by: {
        ...q.generated_by,
        id: q.generated_by.id.toString(),
      }
    }));

    // Group questions by type and difficulty
    const groupedQuestions = serializedQuestions.reduce((acc, question) => {
      const key = `${question.question_type}_${question.difficulty_level}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(question);
      return acc;
    }, {} as Record<string, any[]>);

    // Get summary statistics
    const summary = {
      total: questions.length,
      byType: {
        multiple_choice: questions.filter(q => q.question_type === "multiple_choice").length,
        true_false: questions.filter(q => q.question_type === "true_false").length,
        short_answer: questions.filter(q => q.question_type === "short_answer").length,
      },
      byDifficulty: {
        easy: questions.filter(q => q.difficulty_level === "easy").length,
        medium: questions.filter(q => q.difficulty_level === "medium").length,
        hard: questions.filter(q => q.difficulty_level === "hard").length,
      }
    };

    return NextResponse.json({
      questions: serializedQuestions,
      groupedQuestions,
      summary,
      total: questions.length,
    });

  } catch (error) {
    console.error("Error fetching practice questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch practice questions" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("questionId");
    const lessonId = searchParams.get("lessonId");
    const userId = searchParams.get("userId");

    if (questionId) {
      // Delete a specific question
      await prisma.practice_question.delete({
        where: { id: parseInt(questionId) }
      });

      return NextResponse.json({
        message: "Question deleted successfully"
      });
    } else if (lessonId && userId) {
      // Delete all questions for a lesson by a specific user
      const result = await prisma.practice_question.deleteMany({
        where: {
          lesson_id: parseInt(lessonId),
          generated_by_user: BigInt(userId)
        }
      });

      return NextResponse.json({
        message: `Deleted ${result.count} questions`
      });
    } else {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error deleting practice questions:", error);
    return NextResponse.json(
      { error: "Failed to delete practice questions" },
      { status: 500 }
    );
  }
}