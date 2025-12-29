// import { NextApiRequest, NextApiResponse } from 'next';
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "deepseek-r1-distill-llama-70b";

// Maximum conversation history to include for context
const MAX_HISTORY_ITEMS = 10;

// Comprehensive LMS Assistant System Prompt
const SYSTEM_PROMPT = `You are an expert educational AI assistant integrated into a Learning Management System. Your primary mission is to facilitate deep understanding and mastery of subject material through adaptive, personalized support that promotes active learning and critical thinking.

## Core Principles

1. **Socratic Method First**: Guide students to discover answers through targeted questions rather than providing direct solutions. Only provide direct answers after appropriate struggle or when explicitly requested.

2. **Adaptive Difficulty**: Assess student comprehension from their questions and adjust explanation complexity accordingly. Provide scaffolding for struggling students, challenges for advanced learners.

3. **Growth Mindset**: Frame mistakes as learning opportunities. Use encouraging language that promotes persistence.

## Response Framework

### For Conceptual Questions:
1. Acknowledge and validate the question
2. Assess current understanding with clarifying questions
3. Build understanding gradually using analogies and examples
4. Check comprehension by asking them to explain back

### For Problem-Solving Help:
1. Ask "What have you tried so far?"
2. Provide strategic hints without solving directly
3. Guide self-correction: "Take another look at..."
4. Once solved, reinforce with similar practice

## Feedback Guidelines

### Correct Answers:
- Acknowledge specifically what was correct
- Extend learning with follow-up questions
- Connect to learning objectives

### Incorrect Answers:
- Never say "that's wrong" directly
- Find partial correctness to build upon
- Redirect thinking with guiding questions
- Break down into smaller steps if needed

## Important Rules:
- Never provide direct answers to graded assessments
- Guide the process but require student work
- If asked to "just give the answer," redirect to learning
- End responses with understanding checks or next steps
- Maintain encouraging tone throughout
- Celebrate effort and progress, not just correct answers`;

// Helper function to strip HTML tags and extract text content
const stripHtml = (html) => {
  if (!html) return "";
  // Remove HTML tags but preserve line breaks
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<li>/gi, "\n• ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&rsquo;/g, "'")
    .replace(/&ndash;/g, "-")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// Format lesson context for the prompt - handles both custom format and actual course data
const formatLessonContext = (lessonData) => {
  if (typeof lessonData === "string") {
    return lessonData;
  }

  let context = "LESSON CONTEXT:\n";

  // Handle actual course/module/lesson structure from your LMS
  if (lessonData.course) {
    const course = lessonData.course;
    context += `\n**COURSE INFORMATION:**`;
    context += `\nCourse Code: ${course.code || "Not specified"}`;
    context += `\nCourse Name: ${course.name || "Not specified"}`;
    context += `\nLevel: ${course.level?.name || "Not specified"}`;
    context += `\nDepartment: ${course.department?.name || "Not specified"}`;
    context += `\nUnits: ${course.units || "Not specified"}`;
    if (course.description) {
      context += `\nCourse Description: ${course.description}`;
    }
  }

  // Handle current module
  if (lessonData.currentModule) {
    const module = lessonData.currentModule;
    context += `\n\n**CURRENT MODULE:**`;
    context += `\nModule Name: ${module.name}`;
    context += `\nModule Order: ${module.order}`;
    if (module.description) {
      context += `\nModule Description: ${stripHtml(
        module.description
      ).substring(0, 500)}...`;
    }
  }

  // Handle current lesson
  if (lessonData.currentLesson) {
    const lesson = lessonData.currentLesson;
    context += `\n\n**CURRENT LESSON:**`;
    context += `\nLesson Name: ${lesson.name}`;
    context += `\nLesson Order: ${lesson.order}`;
    if (lesson.description) {
      context += `\nLesson Description: ${stripHtml(lesson.description)}`;
    }

    // Extract key concepts from lesson content if available
    if (lesson.content) {
      const textContent = stripHtml(lesson.content);
      // Take first 2000 characters of content as context
      context += `\n\nLesson Content Summary:\n${textContent.substring(
        0,
        2000
      )}`;

      // Try to extract learning objectives or key points from the content
      const lines = textContent.split("\n");
      const keyPoints = lines
        .filter(
          (line) =>
            line.includes("➢") ||
            line.includes("•") ||
            line.match(/^\d+\./) ||
            line.toLowerCase().includes("objective") ||
            line.toLowerCase().includes("important")
        )
        .slice(0, 10);

      if (keyPoints.length > 0) {
        context += `\n\nKey Points from Lesson:\n${keyPoints.join("\n")}`;
      }
    }
  }

  // Handle related lessons in the same module for context
  if (lessonData.relatedLessons && lessonData.relatedLessons.length > 0) {
    context += `\n\n**RELATED LESSONS IN MODULE:**`;
    lessonData.relatedLessons.forEach((lesson) => {
      context += `\n- ${lesson.name} (Order: ${lesson.order})`;
    });
  }

  // Handle custom lesson format (for backward compatibility)
  if (lessonData.lesson) {
    const lesson = lessonData.lesson;
    context += `\n\n**LESSON DETAILS:**`;
    context += `\nSubject: ${lesson.subject || "Not specified"}`;
    context += `\nTitle: ${lesson.title || "Not specified"}`;
    context += `\nGrade Level: ${lesson.grade_level || "Not specified"}`;

    if (lesson.learning_objectives?.length) {
      context += `\nLearning Objectives:\n${lesson.learning_objectives
        .map((obj) => `- ${obj}`)
        .join("\n")}`;
    }

    if (lesson.key_concepts?.length) {
      context += `\nKey Concepts: ${lesson.key_concepts.join(", ")}`;
    }

    if (lesson.vocabulary?.length) {
      context += `\nVocabulary Terms:\n${lesson.vocabulary
        .map((v) => `- ${v.term}: ${v.definition}`)
        .join("\n")}`;
    }
  }

  // Student profile
  if (lessonData.student) {
    const student = lessonData.student;
    context += `\n\n**STUDENT PROFILE:**`;
    context += `\nName: ${student.name || "Student"}`;
    context += `\nGrade: ${student.grade || "Not specified"}`;
    context += `\nPerformance Level: ${
      student.performance_level || "at_grade"
    }`;
    context += `\nLearning Style: ${student.learning_style || "visual"}`;

    if (student.areas_of_difficulty?.length) {
      context += `\nAreas Needing Support: ${student.areas_of_difficulty.join(
        ", "
      )}`;
    }

    if (student.accommodation_needs?.length) {
      context += `\nAccommodation Needs: ${student.accommodation_needs.join(
        ", "
      )}`;
    }
  }

  // Current activity tracking
  if (lessonData.current_activity) {
    const activity = lessonData.current_activity;
    context += `\n\n**CURRENT ACTIVITY:**`;
    context += `\nType: ${activity.type || "practice"}`;
    context += `\nProgress: ${activity.progress || 0}%`;
    if (activity.attempts) context += `\nAttempts: ${activity.attempts}`;
    if (activity.time_spent)
      context += `\nTime Spent: ${activity.time_spent} minutes`;
  }

  return context;
};

// Build conversation history for context
const buildConversationHistory = (conversations) => {
  if (!conversations || conversations.length === 0) return [];

  // Take only the most recent conversations
  const recentConvos = conversations.slice(0, MAX_HISTORY_ITEMS);

  const history = [];
  recentConvos.reverse().forEach((conv) => {
    history.push({ role: "user", content: conv.user_prompt });
    history.push({ role: "assistant", content: conv.ai_response });
  });

  return history;
};

// Create the full prompt with context
const createPromptWithContext = (
  lessonData,
  userPrompt,
  conversationHistory = []
) => {
  const formattedLesson = formatLessonContext(lessonData);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: formattedLesson },
  ];

  // Add conversation history if exists
  if (conversationHistory.length > 0) {
    messages.push({
      role: "system",
      content: "PREVIOUS CONVERSATION IN THIS LESSON:",
    });
    messages.push(...conversationHistory);
  }

  // Add current user prompt
  messages.push({ role: "user", content: userPrompt });

  return messages;
};

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const {
        lessonData,
        userPrompt,
        userId,
        lessonId,
        moduleId,
        includeHistory = true,
        progress,
        completedLessons,
      } = req.body;

      // Validation
      if (!lessonData || !userPrompt || !userId || !(lessonId || moduleId)) {
        return res.status(400).json({
          error: "Missing required fields",
          required: [
            "lessonData",
            "userPrompt",
            "userId",
            "lessonId or moduleId",
          ],
        });
      }

      const contextId = lessonId || moduleId;
      const contextType = lessonId ? "lesson" : "module";

      // Merge progress and completedLessons into lessonData for context
      let lessonDataWithProgress = lessonData;
      if (typeof lessonData === "object") {
        lessonDataWithProgress = {
          ...lessonData,
          progress: progress !== undefined ? progress : lessonData.progress,
          completedLessons:
            completedLessons !== undefined
              ? completedLessons
              : lessonData.completedLessons,
        };
      }
      try {
        let conversationHistory = [];

        // Fetch previous conversations if needed
        if (includeHistory && contextId) {
          const previousConvos = await prisma.ai_conversations.findMany({
            where: {
              user_id: userId.toString(),
              context_id: parseInt(contextId),
              context_type: contextType,
            },
            orderBy: {
              created_at: "desc",
            },
            take: MAX_HISTORY_ITEMS,
          });

          conversationHistory = buildConversationHistory(previousConvos);
        }

        // Create messages array with full context
        const messages = createPromptWithContext(
          lessonDataWithProgress,
          userPrompt,
          conversationHistory
        );

        // Call Groq API
        const response = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: messages,
            temperature: 0.6,
            max_completion_tokens: 4096,
            top_p: 0.95,
            stream: true,
            stop: null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Groq API error:", errorData);
          throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse =
          data.choices?.[0]?.message?.content ||
          "I apologize, but I couldn't generate a response. Please try again.";

        // Save conversation to PostgreSQL
        await prisma.ai_conversations.create({
          data: {
            user_id: userId.toString(),
            context_id: parseInt(contextId),
            context_type: contextType,
            user_prompt: userPrompt,
            ai_response: aiResponse,
            lesson_data:
              typeof lessonDataWithProgress === "object"
                ? lessonDataWithProgress
                : { content: lessonDataWithProgress },
          },
        });

        return res.status(200).json({
          aiResponse,
          conversationId: `${userId}_${contextId}_${Date.now()}`,
        });
      } catch (error) {
        console.error("AI assistant error:", error);
        return res.status(500).json({
          error: "AI assistant error",
          details: error.message,
        });
      }
    } else if (req.method === "GET") {
      // Fetch previous conversations for user/context
      const { userId, lessonId, moduleId, limit = 20 } = req.query;

      if (!userId || !(lessonId || moduleId)) {
        return res.status(400).json({
          error: "Missing required fields",
          required: ["userId", "lessonId or moduleId"],
        });
      }

      const contextId = lessonId || moduleId;
      const contextType = lessonId ? "lesson" : "module";

      try {
        console.log(
          `Loading conversations for user: ${userId}, context: ${contextId}, type: ${contextType}`
        );

        const conversations = await prisma.ai_conversations.findMany({
          where: {
            user_id: userId.toString(),
            context_id: parseInt(contextId),
            context_type: contextType,
          },
          orderBy: {
            created_at: "desc",
          },
          take: parseInt(limit),
        });

        console.log(`Found ${conversations.length} conversations`);

        // Format for frontend compatibility
        const formatted = conversations.map((conv) => ({
          userPrompt: conv.user_prompt,
          aiResponse: conv.ai_response,
          timestamp: new Date(conv.created_at).getTime(),
          lessonData: conv.lesson_data,
        }));

        console.log(`Returning ${formatted.length} formatted conversations`);

        return res.status(200).json({
          conversations: formatted,
          total: formatted.length,
        });
      } catch (error) {
        console.error("Error loading conversations:", error);
        return res.status(500).json({
          error: "Error loading conversations",
          details: error.message,
        });
      }
    } else if (req.method === "DELETE") {
      // Clear conversation history for a specific context
      const { userId, lessonId, moduleId } = req.body;

      if (!userId || !(lessonId || moduleId)) {
        return res.status(400).json({
          error: "Missing required fields",
          required: ["userId", "lessonId or moduleId"],
        });
      }

      const contextId = lessonId || moduleId;
      const contextType = lessonId ? "lesson" : "module";

      try {
        const deleteResult = await prisma.ai_conversations.deleteMany({
          where: {
            user_id: userId.toString(),
            context_id: parseInt(contextId),
            context_type: contextType,
          },
        });

        return res.status(200).json({
          message: "Conversation history cleared",
          contextId,
          deletedCount: deleteResult.count,
        });
      } catch (error) {
        console.error("Error clearing conversations:", error);
        return res.status(500).json({
          error: "Error clearing conversations",
          details: error.message,
        });
      }
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Prevent static generation
export function getServerSideProps() {
  return { props: {} };
}
