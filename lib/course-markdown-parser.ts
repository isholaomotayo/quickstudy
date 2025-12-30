/**
 * Course Markdown Parser
 * 
 * Parses structured markdown documents into course data structures
 */

import {
  ParsedCourse,
  ParsedModule,
  ParsedLesson,
  ParsedTest,
  ParsedQuestion,
  ParsedPracticeQuestion,
  CourseMarkdownMetadata,
  ModuleMarkdownMetadata,
  LessonMarkdownMetadata,
  TestMarkdownMetadata,
  PracticeMarkdownMetadata,
  ValidationResult,
  ValidationError,
} from "./types/course-markdown";

/**
 * Extract JSON metadata from HTML comment
 */
function extractMetadata<T>(comment: string): T | null {
  const match = comment.match(/<!--\s*@\w+:\s*({.*?})\s*-->/s);
  if (!match) return null;
  
  try {
    return JSON.parse(match[1]) as T;
  } catch (error) {
    return null;
  }
}

/**
 * Extract text content from markdown, removing metadata comments
 */
function extractContent(text: string): string {
  return text
    .replace(/<!--\s*@\w+:\s*{.*?}\s*-->/gs, "")
    .trim();
}

/**
 * Parse a question from markdown text
 */
function parseQuestion(
  questionText: string,
  isPractice: boolean = false
): ParsedQuestion | ParsedPracticeQuestion | null {
  const lines = questionText.trim().split("\n");
  if (lines.length === 0) return null;

  // Extract question number and text
  const questionMatch = lines[0].match(/\*\*Q\d+:\*\*\s*(.+)/);
  if (!questionMatch) return null;

  const question = questionMatch[1].trim();
  let details = "";
  let options: Record<string, { text: string; is_correct: boolean }> = {};
  let correctAnswer: string | undefined;
  let explanation = "";
  let marks = 1;
  let order = 1;
  let difficulty: "easy" | "medium" | "hard" = "medium";
  let questionType: "multiple_choice" | "true_false" = "multiple_choice";

  let currentSection = "question";
  let optionKey = "A";

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for options (checkbox format)
    if (line.match(/^-\s*\[([ x])\]\s*(.+)/)) {
      const match = line.match(/^-\s*\[([ x])\]\s*(.+)/);
      if (match) {
        const isCorrect = match[1] === "x";
        const optionText = match[2].replace(/\(correct\)/gi, "").trim();
        options[optionKey] = { text: optionText, is_correct: isCorrect };
        if (isCorrect) {
          correctAnswer = optionKey;
        }
        optionKey = String.fromCharCode(optionKey.charCodeAt(0) + 1);
      }
      continue;
    }

    // Check for explanation
    if (line.startsWith("**Explanation:**")) {
      explanation = line.replace("**Explanation:**", "").trim();
      currentSection = "explanation";
      continue;
    }

    // Check for marks
    if (line.startsWith("**Marks:**")) {
      const marksMatch = line.match(/\*\*Marks:\*\*\s*(\d+)/);
      if (marksMatch) {
        marks = parseInt(marksMatch[1], 10);
      }
      continue;
    }

    // Check for order
    if (line.startsWith("**Order:**")) {
      const orderMatch = line.match(/\*\*Order:\*\*\s*(\d+)/);
      if (orderMatch) {
        order = parseInt(orderMatch[1], 10);
      }
      continue;
    }

    // Check for difficulty (practice questions)
    if (line.startsWith("**Difficulty:**")) {
      const diffMatch = line.match(/\*\*Difficulty:\*\*\s*(easy|medium|hard)/i);
      if (diffMatch) {
        difficulty = diffMatch[1].toLowerCase() as "easy" | "medium" | "hard";
      }
      continue;
    }

    // Check for type (practice questions)
    if (line.startsWith("**Type:**")) {
      const typeMatch = line.match(/\*\*Type:\*\*\s*(multiple_choice|true_false)/i);
      if (typeMatch) {
        questionType = typeMatch[1].toLowerCase() as "multiple_choice" | "true_false";
      }
      continue;
    }

    // Continue explanation if we're in explanation section
    if (currentSection === "explanation" && line) {
      explanation += (explanation ? " " : "") + line;
    }

    // Continue details if we're in question section
    if (currentSection === "question" && line && !line.startsWith("**")) {
      details += (details ? " " : "") + line;
    }
  }

  // Determine question type from options if not specified
  if (Object.keys(options).length === 2 && !questionType) {
    questionType = "true_false";
  }

  const baseQuestion: ParsedQuestion = {
    question,
    details: details || undefined,
    options: Object.keys(options).length > 0 ? options : undefined,
    correct_answer: correctAnswer,
    explanation: explanation || undefined,
    marks,
    order,
  };

  if (isPractice) {
    return {
      ...baseQuestion,
      question_text: question,
      difficulty,
      question_type: questionType,
      explanation: explanation || "No explanation provided",
    } as ParsedPracticeQuestion;
  }

  return baseQuestion;
}

/**
 * Parse questions from a section
 */
function parseQuestions(
  content: string,
  isPractice: boolean = false
): (ParsedQuestion | ParsedPracticeQuestion)[] {
  const questions: (ParsedQuestion | ParsedPracticeQuestion)[] = [];

  // Split by question markers
  const questionBlocks = content.split(/\*\*Q\d+:\*\*/);
  questionBlocks.shift(); // Remove content before first question

  for (const block of questionBlocks) {
    const question = parseQuestion(`**Q1:**${block}`, isPractice);
    if (question) {
      questions.push(question);
    }
  }

  return questions;
}

/**
 * Parse course markdown into structured data
 */
export function parseCourseMarkdown(markdown: string): ParsedCourse {
  const lines = markdown.split("\n");
  let currentModule: ParsedModule | null = null;
  let currentLesson: ParsedLesson | null = null;
  let currentTest: ParsedTest | null = null;
  let currentSection: "module" | "lesson" | "test" | "practice" | null = null;

  const course: ParsedCourse = {
    metadata: {} as CourseMarkdownMetadata,
    modules: [],
    tests: [],
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Check for course metadata
    if (line.includes("<!-- @course:")) {
      const metadata = extractMetadata<CourseMarkdownMetadata>(line);
      if (metadata) {
        course.metadata = metadata;
      }
      i++;
      continue;
    }

    // Check for module heading
    if (line.match(/^##\s+Module:\s*(.+)/)) {
      const match = line.match(/^##\s+Module:\s*(.+)/);
      if (match) {
        // Save previous module if exists
        if (currentModule) {
          course.modules.push(currentModule);
        }

        currentModule = {
          name: match[1].trim(),
          metadata: {} as ModuleMarkdownMetadata,
          lessons: [],
          tests: [],
        };
        currentLesson = null;
        currentTest = null;
        currentSection = "module";
      }
      i++;
      continue;
    }

    // Check for module metadata
    if (line.includes("<!-- @module:") && currentModule) {
      const metadata = extractMetadata<ModuleMarkdownMetadata>(line);
      if (metadata) {
        currentModule.metadata = metadata;
      }
      i++;
      continue;
    }

    // Check for lesson heading
    if (line.match(/^###\s+Lesson:\s*(.+)/)) {
      const match = line.match(/^###\s+Lesson:\s*(.+)/);
      if (match && currentModule) {
        // Save previous lesson if exists
        if (currentLesson) {
          currentModule.lessons.push(currentLesson);
        }

        currentLesson = {
          name: match[1].trim(),
          metadata: {} as LessonMarkdownMetadata,
          content: "",
          tests: [],
          practiceQuestions: [],
        };
        currentTest = null;
        currentSection = "lesson";
      }
      i++;
      continue;
    }

    // Check for lesson metadata
    if (line.includes("<!-- @lesson:") && currentLesson) {
      const metadata = extractMetadata<LessonMarkdownMetadata>(line);
      if (metadata) {
        currentLesson.metadata = metadata;
      }
      i++;
      continue;
    }

    // Check for test/assignment heading
    if (line.match(/^####\s+(Test|Assignment):\s*(.+)/)) {
      const match = line.match(/^####\s+(Test|Assignment):\s*(.+)/);
      if (match) {
        // Save previous test if exists
        if (currentTest) {
          if (currentLesson) {
            currentLesson.tests.push(currentTest);
          } else if (currentModule) {
            currentModule.tests.push(currentTest);
          } else {
            course.tests.push(currentTest);
          }
        }

        currentTest = {
          metadata: {
            name: match[2].trim(),
            format: match[1].toLowerCase() === "assignment" ? "assignment" : "",
          } as TestMarkdownMetadata,
          questions: [],
          content: "",
        };
        currentSection = "test";
      }
      i++;
      continue;
    }

    // Check for test metadata
    if (line.includes("<!-- @test:") && currentTest) {
      const metadata = extractMetadata<TestMarkdownMetadata>(line);
      if (metadata) {
        currentTest.metadata = { ...currentTest.metadata, ...metadata };
      }
      i++;
      continue;
    }

    // Check for practice questions heading
    if (line.match(/^####\s+Practice\s+Questions/i)) {
      currentSection = "practice";
      i++;
      continue;
    }

    // Check for practice metadata
    if (line.includes("<!-- @practice:") && currentLesson) {
      // Metadata is optional for practice questions
      i++;
      continue;
    }

    // Collect content
    if (currentSection === "lesson" && currentLesson) {
      // Collect lesson content until we hit a test or practice section
      if (!line.match(/^####\s+(Test|Assignment|Practice)/)) {
        currentLesson.content += (currentLesson.content ? "\n" : "") + line;
      }
    } else if (currentSection === "test" && currentTest) {
      // Collect test content (questions)
      if (!line.match(/^####\s+(Test|Assignment|Practice|Lesson|Module)/)) {
        currentTest.content += (currentTest.content ? "\n" : "") + line;
      }
    } else if (currentSection === "practice" && currentLesson) {
      // Collect practice questions - store in a separate field temporarily
      if (!line.match(/^####\s+(Test|Assignment|Lesson|Module)/)) {
        if (!(currentLesson as any).practiceContent) {
          (currentLesson as any).practiceContent = "";
        }
        (currentLesson as any).practiceContent +=
          ((currentLesson as any).practiceContent ? "\n" : "") + line;
      } else {
        // Hit a new section, stop collecting practice questions
        currentSection = null;
      }
    }

    i++;
  }

  // Save final items
  if (currentTest) {
    if (currentLesson) {
      currentLesson.tests.push(currentTest);
    } else if (currentModule) {
      currentModule.tests.push(currentTest);
    } else {
      course.tests.push(currentTest);
    }
  }

  if (currentLesson && currentModule) {
    currentModule.lessons.push(currentLesson);
  }

  if (currentModule) {
    course.modules.push(currentModule);
  }

  // Parse questions from test content
  for (const test of course.tests) {
    if (test.content) {
      test.questions = parseQuestions(test.content, false) as ParsedQuestion[];
    }
  }

  for (const module of course.modules) {
    for (const test of module.tests) {
      if (test.content) {
        test.questions = parseQuestions(test.content, false) as ParsedQuestion[];
      }
    }

    for (const lesson of module.lessons) {
      for (const test of lesson.tests) {
        if (test.content) {
          test.questions = parseQuestions(test.content, false) as ParsedQuestion[];
        }
      }

      // Parse practice questions from lesson
      // Check if we collected practice content separately
      if ((lesson as any).practiceContent) {
        lesson.practiceQuestions = parseQuestions(
          (lesson as any).practiceContent,
          true
        ) as ParsedPracticeQuestion[];
        delete (lesson as any).practiceContent;
      } else {
        // Fallback: Look for practice questions section in lesson content
        const practiceMatch = lesson.content.match(
          /####\s+Practice\s+Questions\s*\n(.*?)(?=\n####|\n###|$)/is
        );
        if (practiceMatch) {
          const practiceContent = practiceMatch[1];
          lesson.practiceQuestions = parseQuestions(
            practiceContent,
            true
          ) as ParsedPracticeQuestion[];
          // Remove practice questions from lesson content
          lesson.content = lesson.content.replace(
            /####\s+Practice\s+Questions\s*\n.*?(?=\n####|\n###|$)/is,
            ""
          );
        }
      }
    }
  }

  return course;
}

/**
 * Validate parsed course data
 */
export function validateParsedCourse(course: ParsedCourse): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate course metadata
  if (!course.metadata.code) {
    errors.push({ field: "course.code", message: "Course code is required" });
  }
  if (!course.metadata.name) {
    errors.push({ field: "course.name", message: "Course name is required" });
  }
  if (!course.metadata.description) {
    errors.push({ field: "course.description", message: "Course description is required" });
  }
  if (!course.metadata.units || course.metadata.units < 1) {
    errors.push({ field: "course.units", message: "Course units must be at least 1" });
  }

  // Validate modules
  if (course.modules.length === 0) {
    warnings.push({ field: "modules", message: "No modules found in course" });
  }

  const moduleOrders = new Set<number>();
  for (let i = 0; i < course.modules.length; i++) {
    const module = course.modules[i];
    if (!module.metadata.order) {
      errors.push({
        field: `module[${i}].order`,
        message: `Module "${module.name}" is missing order`,
      });
    } else if (moduleOrders.has(module.metadata.order)) {
      errors.push({
        field: `module[${i}].order`,
        message: `Duplicate module order: ${module.metadata.order}`,
      });
    } else {
      moduleOrders.add(module.metadata.order);
    }
  }

  // Validate lessons
  const lessonOrders = new Map<string, Set<number>>();
  for (let i = 0; i < course.modules.length; i++) {
    const module = course.modules[i];
    const orders = new Set<number>();

    for (let j = 0; j < module.lessons.length; j++) {
      const lesson = module.lessons[j];
      if (!lesson.metadata.order) {
        errors.push({
          field: `module[${i}].lesson[${j}].order`,
          message: `Lesson "${lesson.name}" is missing order`,
        });
      } else if (orders.has(lesson.metadata.order)) {
        errors.push({
          field: `module[${i}].lesson[${j}].order`,
          message: `Duplicate lesson order: ${lesson.metadata.order} in module "${module.name}"`,
        });
      } else {
        orders.add(lesson.metadata.order);
      }
    }

    lessonOrders.set(module.name, orders);
  }

  // Validate tests
  for (let i = 0; i < course.tests.length; i++) {
    const test = course.tests[i];
    if (!test.metadata.name) {
      errors.push({
        field: `test[${i}].name`,
        message: "Test name is required",
      });
    }
    for (let j = 0; j < test.questions.length; j++) {
      const question = test.questions[j];
      if (!question.question) {
        errors.push({
          field: `test[${i}].question[${j}].question`,
          message: "Question text is required",
        });
      }
      if (!question.correct_answer && !question.options) {
        errors.push({
          field: `test[${i}].question[${j}]`,
          message: "Question must have at least one correct answer",
        });
      }
      if (!question.marks || question.marks < 1) {
        warnings.push({
          field: `test[${i}].question[${j}].marks`,
          message: "Question marks should be at least 1",
        });
      }
    }
  }

  // Validate practice questions
  for (let i = 0; i < course.modules.length; i++) {
    const module = course.modules[i];
    for (let j = 0; j < module.lessons.length; j++) {
      const lesson = module.lessons[j];
      for (let k = 0; k < lesson.practiceQuestions.length; k++) {
        const question = lesson.practiceQuestions[k];
        if (!question.question_text) {
          errors.push({
            field: `module[${i}].lesson[${j}].practice[${k}].question_text`,
            message: "Practice question text is required",
          });
        }
        if (!question.explanation) {
          warnings.push({
            field: `module[${i}].lesson[${j}].practice[${k}].explanation`,
            message: "Practice question should have an explanation",
          });
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

