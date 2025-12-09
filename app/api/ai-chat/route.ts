import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { HybridCompressor, CompressionUtils } from "@/lib/compression";
import {
  authenticateUserWithPermissions,
  isDevelopmentAuthBypassEnabled,
} from "@/lib/api-auth";
import {
  createGuardRails,
  checkQuestion,
  createCourseDocument,
} from "@/lib/guardrails";
import {
  validateRequest,
  DEFAULT_GUARDRAILS_CONFIG,
} from "@/lib/guardrails-config";

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

// AI SDK configuration for Groq
const GROQ_API_KEY = process.env.GROQ_KEY;
const MODEL_NAME = process.env.GROQ_MODEL_LEARNING || "llama-3.3-70b-versatile";

// Create Groq provider for AI SDK
const aiProvider = createGroq({
  apiKey: GROQ_API_KEY,
});

// Reduced history for faster processing
const MAX_HISTORY_ITEMS = 3; // Reduced from 10

// Compression configuration
const COMPRESSION_CONFIG = {
  enabled: true,
  maxPromptLength: 3000, // Compress if prompt exceeds this length
  targetCompressionRatio: 0.6, // Target 60% of original length
  enableLogging: process.env.NODE_ENV === "development",
};

// Initialize hybrid compressor
const hybridCompressor = new HybridCompressor();

// Helper function to strip HTML only (no compression)
const stripHtml = (html: string): string => {
  if (!html) return "";

  // Basic HTML stripping without truncation
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text;
};

// Full lesson context formatter (no compression)
const formatLessonContext = (lessonData: any): string => {
  if (typeof lessonData === "string") {
    return `Context: ${stripHtml(lessonData)}`;
  }

  let context = "";

  // Include full lesson content
  if (lessonData.currentLesson) {
    const lesson = lessonData.currentLesson;
    context += `Lesson: ${lesson.name || "Current"}\n`;

    // Include full content without compression
    if (lesson.content) {
      context += `Content: ${stripHtml(lesson.content)}\n`;
    }

    if (lesson.description) {
      context += `Description: ${stripHtml(lesson.description)}\n`;
    }
  }

  // Include full module context
  if (lessonData.currentModule) {
    const module = lessonData.currentModule;
    context += `Module: ${module.name}\n`;

    if (module.description) {
      context += `Module Description: ${stripHtml(module.description)}\n`;
    }
  }

  return context || "General tutoring session";
};

// Full conversation history builder (no compression)
const buildConversationHistory = (conversations: any[]): string => {
  if (!conversations || conversations.length === 0) return "";

  // Take last few exchanges without truncation
  const recent = conversations.slice(0, MAX_HISTORY_ITEMS);

  // Include full conversation history
  const fullHistory = recent
    .map((conv) => {
      const userQ = conv.user_prompt || "";
      const aiA = conv.ai_response || "";
      return `Q: ${userQ}\nA: ${aiA}`;
    })
    .join("\n\n");

  return fullHistory;
};

// Structured JSON prompt builder for better LLM understanding
const createStructuredPrompt = (
  lessonContext: string,
  history: string,
  userMessage: string,
  lessonName?: string
): string => {
  // Detect question type for better responses
  const lowerMessage = userMessage.toLowerCase();
  let questionType = "";
  let questionCategory = "general";

  if (lowerMessage.includes("what is") || lowerMessage.includes("what are")) {
    questionType =
      "Definition needed - explain clearly what this concept means and why it matters.";
    questionCategory = "definition";
  } else if (lowerMessage.includes("how")) {
    questionType =
      "Process explanation needed - break down the steps or mechanism.";
    questionCategory = "process";
  } else if (lowerMessage.includes("why")) {
    questionType = "Reasoning needed - explain the logic and importance.";
    questionCategory = "reasoning";
  } else if (lowerMessage.includes("example")) {
    questionType = "Examples needed - provide multiple concrete examples.";
    questionCategory = "examples";
  } else if (
    lowerMessage.includes("confused") ||
    lowerMessage.includes("don't understand")
  ) {
    questionType =
      "Student is confused - be extra patient, break it down simply, use analogies.";
    questionCategory = "clarification";
  } else if (
    lowerMessage.includes("solve") ||
    lowerMessage.includes("answer")
  ) {
    questionType =
      "Problem-solving needed - guide through the solution process.";
    questionCategory = "problem_solving";
  }

  // Create structured JSON prompt
  const structuredPrompt = {
    role: "educational_ai_assistant",
    system: {
      core_principles: [
        "Socratic Method First: Guide students to discover answers through targeted questions rather than providing direct solutions",
        "Adaptive Difficulty: Assess student comprehension and adjust explanation complexity accordingly",
        "Growth Mindset: Frame mistakes as learning opportunities with encouraging language",
      ],
      response_framework: {
        conceptual_questions: [
          "Acknowledge and validate the question",
          "Assess current understanding with clarifying questions",
          "Build understanding gradually using analogies and examples",
          "Check comprehension by asking them to explain back",
        ],
        problem_solving: [
          "Ask 'What have you tried so far?'",
          "Provide strategic hints without solving directly",
          "Guide self-correction with 'Take another look at...'",
          "Once solved, reinforce with similar practice",
        ],
      },
      feedback_guidelines: {
        correct_answers: [
          "Acknowledge specifically what was correct",
          "Extend learning with follow-up questions",
          "Connect to learning objectives",
        ],
        incorrect_answers: [
          "Never say 'that's wrong' directly",
          "Find partial correctness to build upon",
          "Redirect thinking with guiding questions",
          "Break down into smaller steps if needed",
        ],
      },
      constraints: [
        "Never provide direct answers to graded assessments",
        "Guide the process but require student work",
        "If asked to 'just give the answer,' redirect to learning",
        "End responses with understanding checks or next steps",
        "Maintain encouraging tone throughout",
        "Celebrate effort and progress, not just correct answers",
      ],
    },
    context: {
      lesson: {
        name: lessonName || "General tutoring session",
        content: lessonContext || "No specific lesson context available",
      },
      conversation_history: history || "No previous conversation history",
      question_analysis: {
        type: questionCategory,
        guidance: questionType || "General educational support needed",
      },
    },
    user_request: {
      original_message: userMessage,
      intent_preserved: true,
    },
  };

  return JSON.stringify(structuredPrompt, null, 2);
};

// Apply compression with custom configuration
const applyCompressionWithConfig = async (
  prompt: string,
  config: typeof COMPRESSION_CONFIG
): Promise<{
  compressedPrompt: string;
  wasCompressed: boolean;
  compressionStats?: any;
}> => {
  if (
    !config.enabled ||
    !CompressionUtils.shouldCompress(prompt, config.maxPromptLength)
  ) {
    return {
      compressedPrompt: prompt,
      wasCompressed: false,
    };
  }

  try {
    const compressionRatio = CompressionUtils.getOptimalCompressionRatio(
      prompt.length,
      config.maxPromptLength
    );

    const result = await hybridCompressor.compress(prompt, compressionRatio, {
      enableLogging: config.enableLogging,
    });

    if (config.enableLogging) {
      console.log(`📊 ${CompressionUtils.formatCompressionStats(result)}`);
    }

    return {
      compressedPrompt: result.compressed,
      wasCompressed: true,
      compressionStats: result,
    };
  } catch (error) {
    console.error("Compression failed, using original prompt:", error);
    return {
      compressedPrompt: prompt,
      wasCompressed: false,
    };
  }
};

export async function POST(request: NextRequest) {
  try {
    // 1. Request validation (skip in development if auth bypass is enabled)
    if (!isDevelopmentAuthBypassEnabled()) {
      const requestValidation = validateRequest(
        request,
        DEFAULT_GUARDRAILS_CONFIG
      );
      if (!requestValidation.isValid) {
        return NextResponse.json(
          { error: requestValidation.error },
          { status: requestValidation.statusCode || 403 }
        );
      }
    }

    // 2. Authentication
    const authResult = await authenticateUserWithPermissions();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 }
      );
    }

    const authenticatedUser = authResult.user!;

    const {
      messages,
      lessonData,
      userId,
      lessonId,
      moduleId,
      includeHistory = true,
      enableCompression = true,
      compressionRatio = 0.6,
      enableGuardrails = true,
      guardrailsConfig,
    } = await request.json();

    // 3. Validation
    if (!messages || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 4. Verify user ID matches authenticated user (skip in development mode if auth bypass is enabled)
    if (!isDevelopmentAuthBypassEnabled() && userId !== authenticatedUser.id) {
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 });
    }

    const contextId = lessonId || moduleId || "general";
    const contextType = lessonId ? "lesson" : moduleId ? "module" : "general";
    const userPrompt = messages[messages.length - 1]?.content || "";

    // 5. Guardrails validation (skip in development if auth bypass is enabled)
    if (enableGuardrails && !isDevelopmentAuthBypassEnabled()) {
      let activeGuardrailsConfig = guardrailsConfig;

      // Create guardrails config if not provided
      if (!activeGuardrailsConfig && lessonData?.currentLesson) {
        try {
          const courseDocument = createCourseDocument(
            lessonData.course || { name: "Course" },
            lessonData.currentLesson
          );
          activeGuardrailsConfig = createGuardRails(courseDocument, {
            strictMode: false,
            debugMode: false,
            thresholds: DEFAULT_GUARDRAILS_CONFIG.thresholds,
          });
        } catch (error) {
          console.warn("Failed to create guardrails config:", error);
        }
      }

      // Check with guardrails if config is available
      if (activeGuardrailsConfig) {
        const guardrailsResult = checkQuestion(
          userPrompt,
          activeGuardrailsConfig,
          lessonData?.currentLesson?.content || null
        );

        if (!guardrailsResult.allowed && guardrailsResult.response) {
          return NextResponse.json(
            {
              error: "guardrails_validation_failed",
              message: guardrailsResult.response,
              confidence: guardrailsResult.confidence,
              type: "guardrails",
              suggestions: guardrailsResult.debugInfo?.suggestions || [],
            },
            { status: 400 }
          );
        }
      }
    }

    // Get compressed history if needed
    let historyText = "";
    if (includeHistory && contextId !== "general") {
      try {
        const previousConvos = await prisma.ai_conversations.findMany({
          where: {
            user_id: userId.toString(),
            context_id: parseInt(contextId),
            context_type: contextType,
          },
          orderBy: { created_at: "desc" },
          take: MAX_HISTORY_ITEMS,
          select: {
            // Only select needed fields
            user_prompt: true,
            ai_response: true,
          },
        });

        historyText = buildConversationHistory(previousConvos);
      } catch (error) {
        console.error("History fetch error:", error);
        // Continue without history
      }
    }

    // Create compressed context
    const lessonContext = formatLessonContext(lessonData);

    // Extract lesson name for better context
    const lessonName =
      lessonData?.currentLesson?.name || lessonData?.currentModule?.name;

    // Build structured JSON prompt (system + context - this can be compressed)
    const structuredPrompt = createStructuredPrompt(
      lessonContext,
      historyText,
      userPrompt,
      lessonName
    );

    console.log(`Structured prompt size: ${structuredPrompt.length} chars`);
    console.log(`User prompt size: ${userPrompt.length} chars`);

    // Apply intelligent compression to structured prompt (system + context)
    const compressionConfig = {
      ...COMPRESSION_CONFIG,
      enabled: enableCompression && COMPRESSION_CONFIG.enabled,
      targetCompressionRatio: compressionRatio,
    };

    const {
      compressedPrompt: compressedStructuredPrompt,
      wasCompressed,
      compressionStats,
    } = await applyCompressionWithConfig(structuredPrompt, compressionConfig);

    if (wasCompressed) {
      console.log(
        `Compressed structured prompt size: ${compressedStructuredPrompt.length} chars`
      );
      if (compressionStats) {
        console.log(
          `Compression ratio: ${(
            compressionStats.compressionRatio * 100
          ).toFixed(1)}%`
        );
      }
    }

    // User prompt is NEVER compressed to preserve intent
    const finalUserPrompt = userPrompt;
    // Use AI SDK streamText for Groq with structured JSON prompt
    const result = await streamText({
      model: aiProvider(MODEL_NAME),
      system: compressedStructuredPrompt, // Use compressed structured JSON prompt
      messages: [
        {
          role: "user",
          content: finalUserPrompt, // Use uncompressed user prompt to preserve intent
        },
      ],
      temperature: 0.6,
      topP: 0.95,
      maxRetries: 1,
      onFinish: async (result) => {
        // Save conversation after streaming is complete
        if (contextId !== "general") {
          const saveConversation = async (retries = 3) => {
            for (let i = 0; i < retries; i++) {
              try {
                await prisma.ai_conversations.create({
                  data: {
                    user_id: userId.toString(),
                    context_id: parseInt(contextId),
                    context_type: contextType,
                    user_prompt: finalUserPrompt, // Save original uncompressed user prompt
                    ai_response: result.text,
                    lesson_data: { summary: lessonContext },
                  },
                });
                return;
              } catch (err) {
                console.error(`Save attempt ${i + 1} failed:`, err);
                if (i === retries - 1) return;
                await new Promise((resolve) =>
                  setTimeout(resolve, Math.pow(2, i) * 100)
                );
              }
            }
          };
          saveConversation().catch((err) =>
            console.error("Save conversation error:", err)
          );
        }
      },
    });

    // Convert AI SDK stream to the format expected by the frontend
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const delta of result.textStream) {
            const streamData = `0:${JSON.stringify(delta)}\n`;
            controller.enqueue(encoder.encode(streamData));
          }
        } catch (error) {
          console.error("Streaming error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable Nginx buffering
      },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      {
        error: "AI chat error",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}

// Optimized GET endpoint
export async function GET(request: NextRequest) {
  try {
    // 1. Request validation (skip in development if auth bypass is enabled)
    if (!isDevelopmentAuthBypassEnabled()) {
      const requestValidation = validateRequest(
        request,
        DEFAULT_GUARDRAILS_CONFIG
      );
      if (!requestValidation.isValid) {
        return NextResponse.json(
          { error: requestValidation.error },
          { status: requestValidation.statusCode || 403 }
        );
      }
    }

    // 2. Authentication
    const authResult = await authenticateUserWithPermissions();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 }
      );
    }

    const authenticatedUser = authResult.user!;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const lessonId = searchParams.get("lessonId");
    const moduleId = searchParams.get("moduleId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // 3. Verify user ID matches authenticated user (skip in development mode if auth bypass is enabled)
    if (!isDevelopmentAuthBypassEnabled() && userId !== authenticatedUser.id) {
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 });
    }

    const contextId = lessonId || moduleId;
    const contextType = lessonId ? "lesson" : "module";

    const where = contextId
      ? {
          user_id: userId.toString(),
          context_id: parseInt(contextId),
          context_type: contextType,
        }
      : { user_id: userId.toString() };

    const conversations = await prisma.ai_conversations.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: limit,
      select: {
        // Only select needed fields
        user_prompt: true,
        ai_response: true,
        created_at: true,
      },
    });

    const formatted = conversations.map((conv) => ({
      userPrompt: conv.user_prompt,
      aiResponse: conv.ai_response,
      timestamp: conv.created_at?.getTime() || Date.now(),
    }));

    // Reverse to show oldest first (chronological order)
    const chronologicalOrder = formatted.reverse();

    return NextResponse.json({
      conversations: chronologicalOrder,
      total: chronologicalOrder.length,
    });
  } catch (error) {
    console.error("Load error:", error);
    return NextResponse.json(
      { error: "Error loading conversations" },
      { status: 500 }
    );
  }
}

// Simplified DELETE endpoint
export async function DELETE(request: NextRequest) {
  try {
    // 1. Request validation (skip in development if auth bypass is enabled)
    if (!isDevelopmentAuthBypassEnabled()) {
      const requestValidation = validateRequest(
        request,
        DEFAULT_GUARDRAILS_CONFIG
      );
      if (!requestValidation.isValid) {
        return NextResponse.json(
          { error: requestValidation.error },
          { status: requestValidation.statusCode || 403 }
        );
      }
    }

    // 2. Authentication
    const authResult = await authenticateUserWithPermissions();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 }
      );
    }

    const authenticatedUser = authResult.user!;

    const { userId, lessonId, moduleId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // 3. Verify user ID matches authenticated user (skip in development mode if auth bypass is enabled)
    if (!isDevelopmentAuthBypassEnabled() && userId !== authenticatedUser.id) {
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 });
    }

    const contextId = lessonId || moduleId;
    const contextType = lessonId ? "lesson" : "module";

    const where = contextId
      ? {
          user_id: userId.toString(),
          context_id: parseInt(contextId),
          context_type: contextType,
        }
      : { user_id: userId.toString() };

    const deleteResult = await prisma.ai_conversations.deleteMany({ where });

    return NextResponse.json({
      message: "History cleared",
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Error clearing history" },
      { status: 500 }
    );
  }
}
