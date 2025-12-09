import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { HybridCompressor } from "@/lib/compression";

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

// Request deduplication cache to prevent multiple simultaneous requests
const ongoingRequests = new Map<string, Promise<any>>();

// AI SDK configuration for Groq
const GROQ_API_KEY = process.env.GROQ_KEY;
const MODEL_NAME = process.env.GROQ_MODEL || "deepseek-r1-distill-llama-70b";

// Create Groq provider for AI SDK
const aiProvider = createGroq({
  apiKey: GROQ_API_KEY,
});

interface GenerateQuestionsRequest {
  lessonId: number;
  questionCount?: number;
  difficultyLevel?: "easy" | "medium" | "hard";
  questionTypes?: ("multiple_choice" | "true_false")[];
  userId: string;
}

interface GeneratedQuestion {
  question_text: string;
  question_type: "multiple_choice" | "true_false";
  options?: Record<string, { text: string; is_correct: boolean }>;
  correct_answer: string;
  explanation: string;
  difficulty_level: "easy" | "medium" | "hard";
}

// Helper function to strip HTML content
const stripHtml = (html: string): string => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// Initialize compression utilities
const compressor = new HybridCompressor();

// Build comprehensive lesson context
const buildLessonContext = (lesson: any): string => {
  let context = "";

  if (lesson.name) {
    context += `LESSON: ${lesson.name}\n`;
  }

  if (lesson.description) {
    context += `DESCRIPTION: ${stripHtml(lesson.description)}\n`;
  }

  if (lesson.content) {
    const cleanContent = stripHtml(lesson.content);
    // Use compression for long content
    const processedContent =
      cleanContent.length > 2000
        ? compressor.compress(cleanContent)
        : cleanContent;
    context += `CONTENT:\n${processedContent}\n`;
  }

  // Include module context if available
  if (lesson.course_module) {
    context += `\nMODULE: ${lesson.course_module.name}\n`;
    if (lesson.course_module.description) {
      context += `MODULE DESCRIPTION: ${stripHtml(
        lesson.course_module.description
      )}\n`;
    }

    // Include course context
    if (lesson.course_module.course) {
      context += `COURSE: ${lesson.course_module.course.name}\n`;
    }
  }

  return context;
};

// Enhanced question generation prompt with educational principles
const createQuestionGenerationPrompt = (
  lessonContext: string,
  questionCount: number,
  difficultyLevel: string,
  questionTypes: string[]
): string => {
  const typeDescriptions: Record<string, string> = {
    multiple_choice: "multiple choice questions with 4 options (A, B, C, D)",
    true_false:
      "true/false questions using the same MCQ format with options A: True, B: False",
  };

  const difficultyGuidance: Record<string, string> = {
    easy: "Focus on basic recall, definitions, and simple concepts from the lesson",
    medium: "Test understanding, application, and connections between concepts",
    hard: "Require analysis, synthesis, critical thinking, and deeper insights",
  };

  const questionTypesList = questionTypes
    .map((t) => typeDescriptions[t])
    .join(", ");

  return `Generate ${questionCount} ${difficultyLevel} practice questions from this lesson content. Return only valid JSON.

${lessonContext}

Return exactly this JSON format with NO other text:

[
  {
    "question_text": "Question based on lesson content",
    "question_type": "${questionTypes[0]}",
    "options": {
      "A": {"text": "True", "is_correct": true},
      "B": {"text": "False", "is_correct": false}
    },
    "correct_answer": "A",
    "explanation": "Why this answer is correct",
    "difficulty_level": "${difficultyLevel}"
  }
]

For multiple choice questions, use 4 options (A, B, C, D).
For true/false questions, use only 2 options: A: True, B: False.`;
};

// Extract JSON from mixed response (handles thinking tags + JSON)
const parseAIResponse = (response: string): GeneratedQuestion[] => {
  try {
    console.log("Raw response type:", typeof response);
    console.log("Raw response sample:", response.substring(0, 200) + "...");

    // Ensure we have a string
    let cleanResponse = String(response).trim();

    // Remove thinking tags first - handle both <think> and <think> without closing tag
    if (cleanResponse.includes("<think>")) {
      // Remove complete thinking blocks
      cleanResponse = cleanResponse.replace(/<think>[\s\S]*?<\/think>/g, "");
      // Remove any remaining thinking content that might not have closing tag
      cleanResponse = cleanResponse.replace(/<think>[\s\S]*$/g, "");
    }

    // Remove any text before the JSON array - look for the actual JSON structure
    const jsonStart = cleanResponse.indexOf("[{");
    const jsonEnd = cleanResponse.lastIndexOf("}]");

    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("No JSON structure found. Looking for [ and ]...");
      const bracketStart = cleanResponse.indexOf("[");
      const bracketEnd = cleanResponse.lastIndexOf("]");

      if (bracketStart === -1 || bracketEnd === -1) {
        throw new Error("No JSON array brackets found in response");
      }

      cleanResponse = cleanResponse.substring(bracketStart, bracketEnd + 1);
    } else {
      cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 2);
    }

    // Clean up any remaining non-JSON content
    cleanResponse = cleanResponse.trim();

    console.log("Extracted JSON:", cleanResponse.substring(0, 300) + "...");

    const parsedQuestions = JSON.parse(cleanResponse) as GeneratedQuestion[];

    if (!Array.isArray(parsedQuestions)) {
      throw new Error("Parsed result is not an array");
    }

    console.log(`Successfully parsed ${parsedQuestions.length} questions`);

    // Basic validation
    return parsedQuestions.map((q, index) => {
      if (!q.question_text || !q.question_type || !q.explanation) {
        throw new Error(`Question ${index + 1} is missing required fields`);
      }

      if (
        (q.question_type === "multiple_choice" ||
          q.question_type === "true_false") &&
        !q.options
      ) {
        throw new Error(
          `Question ${index + 1} is ${q.question_type} but has no options`
        );
      }

      // Validate true/false questions have exactly 2 options
      if (q.question_type === "true_false" && q.options) {
        const optionKeys = Object.keys(q.options);
        if (optionKeys.length !== 2) {
          throw new Error(
            `Question ${
              index + 1
            } is true/false but doesn't have exactly 2 options`
          );
        }
        // Check that options are True/False
        const optionTexts = Object.values(q.options).map((opt) =>
          opt.text.toLowerCase()
        );
        if (!optionTexts.includes("true") || !optionTexts.includes("false")) {
          throw new Error(
            `Question ${
              index + 1
            } is true/false but options don't contain True and False`
          );
        }
      }

      return q;
    });
  } catch (error) {
    console.error("Error parsing AI response:", error);
    console.error("Full response for debugging:", response);
    throw new Error(`Failed to parse AI-generated questions: ${error.message}`);
  }
};

// Removed complex parsing - keeping it simple

export async function POST(request: NextRequest) {
  try {
    const body: GenerateQuestionsRequest = await request.json();
    const {
      lessonId,
      questionCount = 5,
      difficultyLevel = "medium",
      questionTypes = ["multiple_choice"],
      userId,
    } = body;

    console.log(
      `[${new Date().toISOString()}] Question generation request: lesson=${lessonId}, user=${userId}, count=${questionCount}`
    );

    // Validation
    if (!lessonId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: lessonId and userId" },
        { status: 400 }
      );
    }

    if (questionCount < 1 || questionCount > 20) {
      return NextResponse.json(
        { error: "Question count must be between 1 and 20" },
        { status: 400 }
      );
    }

    // Create a unique request key for deduplication
    const requestKey = `${lessonId}-${userId}-${questionCount}-${difficultyLevel}-${questionTypes
      .sort()
      .join(",")}`;

    // Check if there's already an ongoing request for this combination
    if (ongoingRequests.has(requestKey)) {
      console.log(
        `Request deduplication: waiting for ongoing request for key: ${requestKey}`
      );
      try {
        const result = await ongoingRequests.get(requestKey);
        return NextResponse.json(result);
      } catch (error) {
        // If the ongoing request failed, remove it and continue with new request
        ongoingRequests.delete(requestKey);
      }
    }

    // Create the main processing promise
    const processRequest = async () => {
      // Fetch lesson content
      const lesson = await prisma.course_lesson.findUnique({
        where: { id: lessonId },
        include: {
          course_module: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!lesson) {
        throw new Error("Lesson not found");
      }

      // Check if user has existing questions for this lesson (optional caching)
      const existingQuestions = await prisma.practice_question.findMany({
        where: {
          lesson_id: lessonId,
          difficulty_level: difficultyLevel,
          question_type: { in: questionTypes },
        },
        take: questionCount,
      });

      // If we have enough cached questions, return them
      if (existingQuestions.length >= questionCount) {
        const shuffledQuestions = existingQuestions
          .sort(() => Math.random() - 0.5)
          .slice(0, questionCount);

        return {
          questions: shuffledQuestions.map((q) => ({
            ...q,
            generated_by_user: q.generated_by_user.toString(), // Convert BigInt to string
          })),
          cached: true,
          message: "Retrieved cached questions",
        };
      }

      // Build comprehensive lesson context
      const lessonContext = buildLessonContext(lesson);

      if (!lesson.content || stripHtml(lesson.content).length < 50) {
        throw new Error(
          "Lesson content is too short to generate meaningful questions. Please ensure the lesson has substantial content before generating practice questions."
        );
      }

      // Create the enhanced generation prompt
      const prompt = createQuestionGenerationPrompt(
        lessonContext,
        questionCount,
        difficultyLevel,
        questionTypes
      );

      console.log("Generating questions for lesson:", lesson.name);
      console.log("Lesson context length:", lessonContext.length);

      // Generate questions using AI with enhanced settings
      console.log("Starting AI question generation...");

      const result = await generateText({
        model: aiProvider(MODEL_NAME),
        prompt,
        temperature: 0.2, // Even lower temperature for more consistent JSON
        maxRetries: 3,
      });

      const fullResponse = result.text;
      console.log("AI Response received, length:", fullResponse.length);

      // Parse the AI response - no fallback, show real errors
      let generatedQuestions: GeneratedQuestion[];
      try {
        generatedQuestions = parseAIResponse(fullResponse);
        console.log(
          `Successfully parsed ${generatedQuestions.length} questions`
        );
      } catch (parseError) {
        console.error("AI question generation failed:", parseError);
        console.error("Full AI response:", fullResponse);

        throw new Error(`AI response parsing failed: ${parseError.message}`);
      }

      if (generatedQuestions.length === 0) {
        throw new Error(
          "AI generated empty question set. This may indicate insufficient lesson content or AI model issues."
        );
      }

      // Clean up any potentially incomplete records from failed attempts
      try {
        await prisma.practice_question.deleteMany({
          where: {
            lesson_id: lessonId,
            generated_by_user: BigInt(userId),
            question_text: {
              equals: "",
            },
          },
        });
      } catch (cleanupError) {
        console.log("No cleanup needed or cleanup failed:", cleanupError);
      }

      // Save questions to database
      const savedQuestions = await Promise.all(
        generatedQuestions.map(async (question, index) => {
          try {
            return await prisma.practice_question.create({
              data: {
                lesson_id: lessonId,
                question_text: question.question_text,
                question_type: question.question_type,
                options: question.options || undefined,
                correct_answer: question.correct_answer,
                explanation: question.explanation,
                difficulty_level: question.difficulty_level,
                generated_by_user: BigInt(userId),
                ai_generated: true,
              },
            });
          } catch (dbError) {
            console.error(`Error saving question ${index + 1}:`, dbError);
            // Return the generated question even if saving fails
            return {
              id: Date.now() + Math.random() + index, // Temporary ID
              ...question,
              lesson_id: lessonId,
              generated_by_user: BigInt(userId),
              ai_generated: true,
              generated_at: new Date(),
              created_at: new Date(),
              updated_at: new Date(),
            };
          }
        })
      );

      return {
        questions: savedQuestions.map((q) => ({
          ...q,
          generated_by_user: q.generated_by_user.toString(), // Convert BigInt to string for JSON
        })),
        cached: false,
        message: `Generated ${savedQuestions.length} new questions`,
      };
    };

    // Add the promise to ongoing requests and clean up when done
    const requestPromise = processRequest();
    ongoingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return NextResponse.json(result);
    } finally {
      // Always clean up the request from the map
      ongoingRequests.delete(requestKey);
    }
  } catch (error) {
    console.error("Practice questions generation error:", error);

    // Handle specific error types with appropriate status codes
    if (error instanceof Error) {
      if (error.message.includes("Lesson not found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (
        error.message.includes("too short") ||
        error.message.includes("AI response parsing failed") ||
        error.message.includes("empty question set")
      ) {
        return NextResponse.json(
          {
            error: "Failed to generate questions from lesson content",
            details: error.message,
          },
          { status: 422 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to generate practice questions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const userId = searchParams.get("userId");
    const difficultyLevel = searchParams.get("difficultyLevel");
    const questionType = searchParams.get("questionType");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!lessonId || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters: lessonId and userId" },
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
      orderBy: { created_at: "desc" },
      take: Math.min(limit, 50),
    });

    return NextResponse.json({
      questions: questions.map((q) => ({
        ...q,
        generated_by_user: q.generated_by_user.toString(),
      })),
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
