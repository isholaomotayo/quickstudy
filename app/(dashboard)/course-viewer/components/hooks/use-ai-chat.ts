import { useState, useCallback, useEffect } from "react";
import { checkQuestion, type GuardRailsConfig } from "@/lib/guardrails";
import { useChatHistory } from "@/hooks/use-chat-history";
import { useGuardrailsPreload } from "@/hooks/use-guardrails-preload";

// Basic validation function for when guardrails config is not available
const basicQuestionValidation = (
  questionText: string
): { isValid: boolean; message?: string } => {
  const text = questionText.toLowerCase().trim();

  // Check minimum length
  if (text.length < 3) {
    return {
      isValid: false,
      message: "Please ask a more detailed question about the course content.",
    };
  }

  // Check if it's actually a question
  const questionWords = [
    "what",
    "how",
    "why",
    "when",
    "where",
    "which",
    "who",
    "can",
    "could",
    "would",
    "should",
    "is",
    "are",
    "do",
    "does",
    "did",
    "explain",
    "tell",
    "help",
  ];
  const hasQuestionWord = questionWords.some(
    (word) => text.startsWith(word) || text.includes(` ${word} `)
  );
  const hasQuestionMark = text.includes("?");

  if (!hasQuestionWord && !hasQuestionMark) {
    return {
      isValid: false,
      message:
        "Please phrase your input as a question. Try starting with words like 'What', 'How', 'Why', or 'Can you explain'.",
    };
  }

  // Basic off-topic detection
  const offTopicPatterns = [
    /personal|private|relationship|dating|love|family/,
    /politics|political|election|vote/,
    /religion|god|prayer|church/,
    /sports|football|basketball|game/,
    /weather|temperature|rain|sunny/,
    /food|recipe|cooking|restaurant/,
    /travel|vacation|trip|hotel/,
    /shopping|buy|purchase|price/,
  ];

  const isOffTopic = offTopicPatterns.some((pattern) => pattern.test(text));
  if (isOffTopic) {
    return {
      isValid: false,
      message:
        "This question seems off-topic. Please ask about course-related content, lessons, or assignments.",
    };
  }

  return { isValid: true };
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

interface UseChatOptions {
  courseData: any;
  currentLesson: any;
  student?: {
    id: number | string;
    name?: string;
    role?: string;
  };
  currentModuleId?: number;
  currentLessonId?: number;
  preloadedConversations?: any[];
  onFinish?: (message: any) => void;
  onError?: (error: Error) => void;
  enableGuardrails?: boolean;
  guardrailsConfig?: GuardRailsConfig | undefined;
}

export function useAIChat({
  courseData,
  currentLesson,
  student,
  currentModuleId,
  currentLessonId,
  preloadedConversations,
  onFinish,
  onError,
  enableGuardrails = true,
  guardrailsConfig,
}: UseChatOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use SWR-based chat history hook
  const {
    messages: cachedMessages,
    isHistoryLoading,
    historyError,
    addOptimisticMessage,
    updateLatestAiResponse,
    clearCachedHistory,
    preloadHistory,
  } = useChatHistory(
    student?.id || null,
    currentLessonId || null,
    currentModuleId || null,
    {
      enabled: !!student?.id && !!(currentLessonId || currentModuleId),
      revalidateOnFocus: false,
    }
  );

  // Use cached messages as the primary source
  const messages = cachedMessages;

  // Get preloaded guardrails configuration
  const { getCachedGuardrails } = useGuardrailsPreload();

  const constructLessonData = useCallback(() => {
    const allLessonsInModule = courseData?.course_lesson || []; // Changed from course_lessons to match API response
    const lessonData = currentLessonId
      ? allLessonsInModule.find((l: any) => l.id === currentLessonId)
      : currentLesson;

    return {
      course: {
        id: courseData?.course_id,
        name: "Course",
      },
      currentModule: {
        id: courseData?.id,
        name: courseData?.name,
        order: courseData?.order,
        description: courseData?.description,
        totalLessons: allLessonsInModule.length,
        published: courseData?.published,
      },
      currentLesson: lessonData
        ? {
            id: lessonData.id,
            name: lessonData.name,
            order: lessonData.order,
            description: lessonData.description,
            content: lessonData.content,
            moduleName: courseData?.name,
            moduleOrder: courseData?.order,
          }
        : null,
      allLessonsInModule: allLessonsInModule.map((lesson: any) => ({
        id: lesson.id,
        name: lesson.name,
        order: lesson.order,
        description: lesson.description,
        content: lesson.id === currentLessonId ? lesson.content : undefined,
      })),
      current_activity: {
        type: "lesson_study",
        progress: calculateProgress(),
        totalLessonsInModule: allLessonsInModule.length,
        currentLessonPosition: currentLesson
          ? allLessonsInModule.findIndex(
              (l: any) => l.id === currentLesson.id
            ) + 1
          : 0,
      },
    };
  }, [courseData, currentLesson, currentLessonId]);

  const calculateProgress = useCallback(() => {
    const allLessonsInModule = courseData?.course_lesson || []; // Changed from course_lessons to match API response
    if (!allLessonsInModule.length) return 0;
    const lessonData = currentLessonId
      ? allLessonsInModule.find((l: any) => l.id === currentLessonId)
      : currentLesson;
    if (!lessonData) return 0;
    const lessonIndex = allLessonsInModule.findIndex(
      (l: any) => l.id === lessonData.id
    );
    const progress = ((lessonIndex + 1) / allLessonsInModule.length) * 100;
    return Math.round(progress);
  }, [courseData, currentLesson, currentLessonId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !student?.id) return;

      // Get preloaded guardrails configuration
      let activeGuardrailsConfig = guardrailsConfig;
      if (enableGuardrails && !activeGuardrailsConfig) {
        activeGuardrailsConfig = getCachedGuardrails(courseData, currentLesson);
      }

      // Check with guardrails if enabled
      if (enableGuardrails) {
        if (activeGuardrailsConfig) {
          // Use full guardrails validation
          const guardrailsResult = checkQuestion(
            content,
            activeGuardrailsConfig,
            currentLesson?.content || null
          );

          if (!guardrailsResult.allowed && guardrailsResult.response) {
            // Add guardrails response as assistant message
            const guardrailsMessage: Message = {
              id: Date.now().toString(),
              role: "assistant",
              content: guardrailsResult.response,
              timestamp: Date.now(),
            };

            addOptimisticMessage(guardrailsMessage);
            return; // Don't proceed with AI request
          }
        } else {
          // Fallback: Basic validation when guardrails config is not available
          console.warn(
            "Guardrails config not available, using basic validation"
          );
          const basicValidation = basicQuestionValidation(content);
          if (!basicValidation.isValid) {
            const guardrailsMessage: Message = {
              id: Date.now().toString(),
              role: "assistant",
              content:
                basicValidation.message ||
                "Please ask a question related to the course content.",
              timestamp: Date.now(),
            };

            addOptimisticMessage(guardrailsMessage);
            return; // Don't proceed with AI request
          }
        }
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: Date.now(),
      };

      // Add optimistic user message
      addOptimisticMessage(userMessage);
      setIsLoading(true);
      setError(null);

      console.log("Sending message to AI:", content);

      try {
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            lessonData: constructLessonData(),
            userId: student.id.toString(),
            lessonId: currentLessonId || null,
            moduleId: currentModuleId || null,
            includeHistory: true,
          }),
        });

        if (!response.ok) {
          // Try to parse error response for guardrails messages
          try {
            const errorData = await response.json();
            if (errorData.type === "guardrails" && errorData.message) {
              // Create a guardrails error with the specific message
              const guardrailsError = new Error(errorData.message);
              (guardrailsError as any).type = "guardrails";
              (guardrailsError as any).suggestions =
                errorData.suggestions || [];
              (guardrailsError as any).confidence = errorData.confidence;
              throw guardrailsError;
            }
          } catch (parseError) {
            // If parsing fails, fall back to generic error
          }
          throw new Error(`AI request failed: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        console.log("Starting to read streaming response...");

        const decoder = new TextDecoder();
        let assistantContent = "";
        let assistantMessageId = (Date.now() + 1).toString();
        let hasStartedStreaming = false;

        setIsStreaming(true);
        console.log("Starting streaming response...");

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log("Streaming finished");
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            console.log("Received chunk:", chunk);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("0:")) {
                // Parse the streaming data
                try {
                  const jsonStr = line.slice(2);
                  const parsed = JSON.parse(jsonStr);
                  if (parsed && typeof parsed === "string") {
                    assistantContent += parsed;

                    // Only add the assistant message when we have actual content
                    if (!hasStartedStreaming && assistantContent.trim()) {
                      const assistantMessage: Message = {
                        id: assistantMessageId,
                        role: "assistant",
                        content: assistantContent,
                        timestamp: Date.now(),
                      };
                      addOptimisticMessage(assistantMessage);
                      hasStartedStreaming = true;
                      console.log(
                        "Added assistant message with initial content"
                      );
                    } else if (hasStartedStreaming) {
                      updateLatestAiResponse(assistantContent);
                    }
                  }
                } catch (e) {
                  // Skip invalid JSON
                  console.log("JSON parse error for line:", line, e);
                }
              } else if (line.trim()) {
                // Handle any other streaming formats
                try {
                  const data = JSON.parse(line);
                  if (data.response) {
                    assistantContent += data.response;

                    // Only add the assistant message when we have actual content
                    if (!hasStartedStreaming && assistantContent.trim()) {
                      const assistantMessage: Message = {
                        id: assistantMessageId,
                        role: "assistant",
                        content: assistantContent,
                        timestamp: Date.now(),
                      };
                      addOptimisticMessage(assistantMessage);
                      hasStartedStreaming = true;
                      console.log(
                        "Added assistant message with initial content"
                      );
                    } else if (hasStartedStreaming) {
                      updateLatestAiResponse(assistantContent);
                    }
                  }
                } catch (e) {
                  // Not JSON, might be plain text
                  console.log("Streaming line:", line);
                }
              }
            }
          }
        } catch (streamError) {
          console.error("Streaming error:", streamError);
          // If streaming failed and we never started, clean up any empty messages
          if (!hasStartedStreaming) {
            console.log(
              "Streaming failed before content was received, no message added"
            );
          }
        } finally {
          setIsStreaming(false);
        }

        // Only call onFinish if we actually received content
        if (onFinish && assistantContent && assistantContent.trim()) {
          onFinish(assistantContent);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        if (onError) {
          onError(error);
        }
        console.error("AI Chat error:", error);
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    },
    [
      messages,
      constructLessonData,
      student?.id,
      currentLessonId,
      currentModuleId,
      onFinish,
      onError,
      enableGuardrails,
      guardrailsConfig,
      courseData,
      currentLesson,
      getCachedGuardrails,
    ]
  );

  const clearHistory = useCallback(async () => {
    if (!student?.id) return;

    const contextId = currentLessonId || currentModuleId;
    if (!contextId) return;

    console.log("Clearing conversation history for:", {
      userId: student.id,
      lessonId: currentLessonId,
      moduleId: currentModuleId,
    });

    try {
      await clearCachedHistory();
      setError(null);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  }, [student?.id, currentLessonId, currentModuleId, clearCachedHistory]);

  // Preload chat history when lesson changes
  useEffect(() => {
    if (student?.id && (currentLessonId || currentModuleId)) {
      preloadHistory(
        student.id,
        currentLessonId || undefined,
        currentModuleId || undefined
      );
    }
  }, [student?.id, currentLessonId, currentModuleId, preloadHistory]);

  const stop = useCallback(() => {
    setIsLoading(false);
    setIsStreaming(false);
  }, []);

  const reload = useCallback(() => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.role === "user");
      if (lastUserMessage) {
        // Remove the last assistant message if it exists
        // Note: With SWR, we can't directly manipulate messages array
        // The reload functionality would need to be reimplemented with SWR
        sendMessage(lastUserMessage.content);
      }
    }
  }, [messages, sendMessage]);

  return {
    messages,
    input: "",
    handleInputChange: () => {},
    handleSubmit: () => {},
    isLoading: isLoading || isHistoryLoading,
    isStreaming,
    error: error || historyError,
    reload,
    stop,
    sendMessage,
    clearHistory,
    loadConversationHistory: () => {}, // No longer needed with SWR
    setMessages: () => {}, // No longer needed with SWR
    // New properties
    isHistoryLoading,
    preloadHistory,
  };
}
