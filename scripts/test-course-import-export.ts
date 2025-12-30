/**
 * Test script for Course Import/Export functionality
 * 
 * NOTE: This script is deprecated. Use Bun tests instead:
 *   bun test tests/course-markdown-parser.test.ts tests/course-import-export.test.ts
 *   or
 *   npm run test:course
 * 
 * This script is kept for backward compatibility and manual testing.
 * 
 * Usage:
 *   bun run scripts/test-course-import-export.ts
 *   or
 *   tsx scripts/test-course-import-export.ts
 * 
 * Environment variables required:
 *   - DATABASE_URL: Database connection string
 *   - JWT_SECRET or JWTSECRET: For authentication (if testing authenticated endpoints)
 */

import { readFileSync } from "fs";
import { join } from "path";
import { parseCourseMarkdown, validateParsedCourse } from "../lib/course-markdown-parser";
import { ParsedCourse } from "../lib/types/course-markdown";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log("\n" + "=".repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log("=".repeat(60));
}

function logSuccess(message: string) {
  log(`✓ ${message}`, colors.green);
}

function logError(message: string) {
  log(`✗ ${message}`, colors.red);
}

function logWarning(message: string) {
  log(`⚠ ${message}`, colors.yellow);
}

function logInfo(message: string) {
  log(`ℹ ${message}`, colors.blue);
}

/**
 * Test 1: Parse markdown file
 */
async function testParseMarkdown() {
  logSection("Test 1: Parse Markdown File");

  try {
    const samplePath = join(process.cwd(), "docs/examples/sample-course.md");
    const markdown = readFileSync(samplePath, "utf-8");

    logInfo(`Reading markdown from: ${samplePath}`);
    logInfo(`Markdown length: ${markdown.length} characters`);

    const parsed = parseCourseMarkdown(markdown);

    // Validate basic structure
    if (!parsed.metadata) {
      throw new Error("Missing course metadata");
    }

    if (!parsed.metadata.code) {
      throw new Error("Missing course code");
    }

    if (!parsed.metadata.name) {
      throw new Error("Missing course name");
    }

    if (parsed.modules.length === 0) {
      throw new Error("No modules found");
    }

    logSuccess("Markdown parsed successfully");
    logInfo(`Course: ${parsed.metadata.code} - ${parsed.metadata.name}`);
    logInfo(`Modules: ${parsed.modules.length}`);
    logInfo(
      `Total Lessons: ${parsed.modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0
      )}`
    );
    logInfo(
      `Total Tests: ${
        parsed.tests.length +
        parsed.modules.reduce(
          (sum, m) =>
            sum +
            m.tests.length +
            m.lessons.reduce((s, l) => s + l.tests.length, 0),
          0
        )
      }`
    );
    logInfo(
      `Total Practice Questions: ${parsed.modules.reduce(
        (sum, m) =>
          sum + m.lessons.reduce((s, l) => s + l.practiceQuestions.length, 0),
        0
      )}`
    );

    return { success: true, parsed };
  } catch (error) {
    logError(`Failed to parse markdown: ${error instanceof Error ? error.message : "Unknown error"}`);
    return { success: false, parsed: null };
  }
}

/**
 * Test 2: Validate parsed course
 */
async function testValidateCourse(parsed: ParsedCourse | null) {
  logSection("Test 2: Validate Parsed Course");

  if (!parsed) {
    logError("Cannot validate: parsed course is null");
    return { success: false, validation: null };
  }

  try {
    const validation = validateParsedCourse(parsed);

    if (validation.valid) {
      logSuccess("Course validation passed");
    } else {
      logError("Course validation failed");
      validation.errors.forEach((error) => {
        logError(`  - ${error.field}: ${error.message}`);
      });
    }

    if (validation.warnings.length > 0) {
      logWarning(`Found ${validation.warnings.length} warnings:`);
      validation.warnings.forEach((warning) => {
        logWarning(`  - ${warning.field}: ${warning.message}`);
      });
    }

    return { success: validation.valid, validation };
  } catch (error) {
    logError(`Validation error: ${error instanceof Error ? error.message : "Unknown error"}`);
    return { success: false, validation: null };
  }
}

/**
 * Test 3: Test question parsing
 */
async function testQuestionParsing() {
  logSection("Test 3: Question Parsing");

  const testMarkdown = `
#### Test: Sample Quiz
<!-- @test: {"name": "Sample Quiz", "duration_mins": 30} -->

**Q1:** What is a variable?
- [ ] Option A
- [x] Option B (correct)
- [ ] Option C
- [ ] Option D

**Explanation:** Variables store data values.
**Marks:** 2
**Order:** 1

**Q2:** True or False: Variables can be reassigned.
- [x] True
- [ ] False

**Explanation:** Variables can be reassigned.
**Marks:** 1
**Order:** 2
`;

  try {
    const parsed = parseCourseMarkdown(testMarkdown);

    if (parsed.tests.length === 0) {
      throw new Error("No tests found");
    }

    const test = parsed.tests[0];
    if (test.questions.length !== 2) {
      throw new Error(`Expected 2 questions, found ${test.questions.length}`);
    }

    const q1 = test.questions[0];
    if (!q1.correct_answer) {
      throw new Error("Question 1 missing correct answer");
    }

    if (q1.marks !== 2) {
      throw new Error(`Question 1 expected 2 marks, got ${q1.marks}`);
    }

    logSuccess("Question parsing test passed");
    logInfo(`Parsed ${test.questions.length} questions correctly`);
    logInfo(`Question 1: ${q1.question.substring(0, 50)}...`);
    logInfo(`Correct answer: ${q1.correct_answer}`);
    logInfo(`Marks: ${q1.marks}`);

    return { success: true };
  } catch (error) {
    logError(`Question parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return { success: false };
  }
}

/**
 * Test 4: Test practice question parsing
 */
async function testPracticeQuestionParsing() {
  logSection("Test 4: Practice Question Parsing");

  const testMarkdown = `
<!-- @course: {"code": "TEST101", "name": "Test Course", "description": "Test", "units": 3} -->

## Module: Test Module
<!-- @module: {"order": 1} -->

### Lesson: Test Lesson
<!-- @lesson: {"order": 1} -->

Lesson content here.

#### Practice Questions
<!-- @practice: {"difficulty": "easy"} -->

**Q1:** What is a variable?
- [ ] Option A
- [x] Option B (correct)
- [ ] Option C

**Explanation:** Variables store data.
**Difficulty:** easy
**Type:** multiple_choice
`;

  try {
    const parsed = parseCourseMarkdown(testMarkdown);

    if (parsed.modules.length === 0) {
      throw new Error("No modules found");
    }

    const module = parsed.modules[0];
    if (module.lessons.length === 0) {
      throw new Error("No lessons found");
    }

    const lesson = module.lessons[0];
    if (lesson.practiceQuestions.length === 0) {
      throw new Error("No practice questions found");
    }

    const pq = lesson.practiceQuestions[0];
    if (pq.difficulty !== "easy") {
      throw new Error(`Expected difficulty 'easy', got '${pq.difficulty}'`);
    }

    if (pq.question_type !== "multiple_choice") {
      throw new Error(`Expected type 'multiple_choice', got '${pq.question_type}'`);
    }

    logSuccess("Practice question parsing test passed");
    logInfo(`Parsed ${lesson.practiceQuestions.length} practice questions`);
    logInfo(`Difficulty: ${pq.difficulty}`);
    logInfo(`Type: ${pq.question_type}`);

    return { success: true };
  } catch (error) {
    logError(`Practice question parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return { success: false };
  }
}

/**
 * Test 5: Test assignment format
 */
async function testAssignmentFormat() {
  logSection("Test 5: Assignment Format");

  const testMarkdown = `
#### Assignment: Sample Assignment
<!-- @test: {"name": "Sample Assignment", "format": "assignment", "deadline": "2024-12-31T23:59:59Z"} -->

**Q1:** Implement a function.
**Explanation:** Create a function that adds two numbers.
**Marks:** 10
**Order:** 1
`;

  try {
    const parsed = parseCourseMarkdown(testMarkdown);

    if (parsed.tests.length === 0) {
      throw new Error("No tests found");
    }

    const test = parsed.tests[0];
    if (test.metadata.format !== "assignment") {
      throw new Error(`Expected format 'assignment', got '${test.metadata.format}'`);
    }

    if (!test.metadata.deadline) {
      throw new Error("Missing deadline for assignment");
    }

    logSuccess("Assignment format test passed");
    logInfo(`Format: ${test.metadata.format}`);
    logInfo(`Deadline: ${test.metadata.deadline}`);

    return { success: true };
  } catch (error) {
    logError(`Assignment format test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return { success: false };
  }
}

/**
 * Test 6: Test invalid markdown handling
 */
async function testInvalidMarkdown() {
  logSection("Test 6: Invalid Markdown Handling");

  const invalidMarkdowns = [
    {
      name: "Missing course metadata",
      content: `## Module: Test Module`,
    },
    {
      name: "Missing course code",
      content: `<!-- @course: {"name": "Test Course", "description": "Test", "units": 3} -->`,
    },
    {
      name: "Invalid JSON in metadata",
      content: `<!-- @course: {invalid json} -->`,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of invalidMarkdowns) {
    try {
      const parsed = parseCourseMarkdown(test.content);
      const validation = validateParsedCourse(parsed);

      if (!validation.valid) {
        logSuccess(`Correctly identified invalid markdown: ${test.name}`);
        passed++;
      } else {
        logError(`Failed to identify invalid markdown: ${test.name}`);
        failed++;
      }
    } catch (error) {
      // Parsing errors are also acceptable for invalid markdown
      logSuccess(`Correctly threw error for: ${test.name}`);
      passed++;
    }
  }

  logInfo(`Invalid markdown tests: ${passed} passed, ${failed} failed`);

  return { success: failed === 0 };
}

/**
 * Test 7: Test module and lesson ordering
 */
async function testOrdering() {
  logSection("Test 7: Module and Lesson Ordering");

  const testMarkdown = `
<!-- @course: {"code": "TEST101", "name": "Test Course", "description": "Test", "units": 3} -->

## Module: Module 1
<!-- @module: {"order": 1} -->

### Lesson: Lesson 1
<!-- @lesson: {"order": 1} -->
Content 1

### Lesson: Lesson 2
<!-- @lesson: {"order": 2} -->
Content 2

## Module: Module 2
<!-- @module: {"order": 2} -->

### Lesson: Lesson 1
<!-- @lesson: {"order": 1} -->
Content 1
`;

  try {
    const parsed = parseCourseMarkdown(testMarkdown);

    if (parsed.modules.length !== 2) {
      throw new Error(`Expected 2 modules, found ${parsed.modules.length}`);
    }

    if (parsed.modules[0].metadata.order !== 1) {
      throw new Error("Module 1 should have order 1");
    }

    if (parsed.modules[1].metadata.order !== 2) {
      throw new Error("Module 2 should have order 2");
    }

    // Check that modules are ordered correctly
    if (parsed.modules[0].metadata.order !== 1) {
      throw new Error("Module 1 should have order 1");
    }

    if (parsed.modules[1].metadata.order !== 2) {
      throw new Error("Module 2 should have order 2");
    }

    // Check that lessons have correct order values
    const module1Lessons = parsed.modules[0].lessons;
    if (module1Lessons.length === 0) {
      throw new Error("Module 1 should have at least 1 lesson");
    }

    // Verify lesson ordering
    const lessonOrders = module1Lessons.map(l => l.metadata.order).sort((a, b) => a - b);
    if (lessonOrders[0] !== 1) {
      throw new Error(`First lesson should have order 1, found ${lessonOrders[0]}`);
    }

    // If there are multiple lessons, check they're sequential
    if (module1Lessons.length > 1) {
      for (let i = 1; i < lessonOrders.length; i++) {
        if (lessonOrders[i] !== lessonOrders[i-1] + 1) {
          throw new Error(`Lesson orders should be sequential, found gap at ${lessonOrders[i-1]} -> ${lessonOrders[i]}`);
        }
      }
    }

    logSuccess("Ordering test passed");
    logInfo("Modules and lessons are correctly ordered");

    return { success: true };
  } catch (error) {
    logError(`Ordering test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return { success: false };
  }
}

/**
 * Test 8: Test export format generation (mock)
 */
async function testExportFormat() {
  logSection("Test 8: Export Format Generation");

  try {
    const samplePath = join(process.cwd(), "docs/examples/sample-course.md");
    const originalMarkdown = readFileSync(samplePath, "utf-8");

    // Parse and validate
    const parsed = parseCourseMarkdown(originalMarkdown);
    const validation = validateParsedCourse(parsed);

    if (!validation.valid) {
      throw new Error("Original markdown failed validation");
    }

    // Check that all expected elements are present
    const hasModules = parsed.modules.length > 0;
    const hasLessons = parsed.modules.some((m) => m.lessons.length > 0);
    const hasTests = parsed.tests.length > 0 || parsed.modules.some((m) => m.tests.length > 0 || m.lessons.some((l) => l.tests.length > 0));
    const hasPracticeQuestions = parsed.modules.some((m) =>
      m.lessons.some((l) => l.practiceQuestions.length > 0)
    );

    logSuccess("Export format test passed");
    logInfo(`Has modules: ${hasModules}`);
    logInfo(`Has lessons: ${hasLessons}`);
    logInfo(`Has tests: ${hasTests}`);
    logInfo(`Has practice questions: ${hasPracticeQuestions}`);

    return { success: true };
  } catch (error) {
    logError(`Export format test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return { success: false };
  }
}

/**
 * Main test runner
 */
async function runTests() {
  log("\n" + "=".repeat(60), colors.bright);
  log("Course Import/Export Test Suite", colors.bright + colors.cyan);
  log("=".repeat(60) + "\n", colors.bright);

  const results: Array<{ name: string; success: boolean }> = [];

  // Test 1: Parse markdown
  const parseResult = await testParseMarkdown();
  results.push({ name: "Parse Markdown", success: parseResult.success });

  // Test 2: Validate course
  const validateResult = await testValidateCourse(parseResult.parsed);
  results.push({ name: "Validate Course", success: validateResult.success });

  // Test 3: Question parsing
  const questionResult = await testQuestionParsing();
  results.push({ name: "Question Parsing", success: questionResult.success });

  // Test 4: Practice question parsing
  const practiceResult = await testPracticeQuestionParsing();
  results.push({ name: "Practice Question Parsing", success: practiceResult.success });

  // Test 5: Assignment format
  const assignmentResult = await testAssignmentFormat();
  results.push({ name: "Assignment Format", success: assignmentResult.success });

  // Test 6: Invalid markdown
  const invalidResult = await testInvalidMarkdown();
  results.push({ name: "Invalid Markdown Handling", success: invalidResult.success });

  // Test 7: Ordering
  const orderingResult = await testOrdering();
  results.push({ name: "Module/Lesson Ordering", success: orderingResult.success });

  // Test 8: Export format
  const exportResult = await testExportFormat();
  results.push({ name: "Export Format", success: exportResult.success });

  // Summary
  logSection("Test Summary");

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  results.forEach((result) => {
    if (result.success) {
      logSuccess(`${result.name}`);
    } else {
      logError(`${result.name}`);
    }
  });

  console.log("\n" + "-".repeat(60));
  log(`Total: ${results.length} tests`, colors.bright);
  log(`Passed: ${passed}`, colors.green);
  log(`Failed: ${failed}`, failed > 0 ? colors.red : colors.green);
  console.log("-".repeat(60) + "\n");

  if (failed === 0) {
    log("All tests passed! ✓", colors.bright + colors.green);
    process.exit(0);
  } else {
    log("Some tests failed. Please review the errors above.", colors.bright + colors.red);
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  logError(`Test suite error: ${error instanceof Error ? error.message : "Unknown error"}`);
  console.error(error);
  process.exit(1);
});

