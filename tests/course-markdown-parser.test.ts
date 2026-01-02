/**
 * Course Markdown Parser Tests
 * Using Bun test runner
 */

import { describe, it, expect, beforeEach } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import {
  parseCourseMarkdown,
  validateParsedCourse,
} from "../lib/course-markdown-parser";
import { ParsedCourse } from "../lib/types/course-markdown";

describe("Course Markdown Parser", () => {
  let sampleMarkdown: string;

  beforeEach(() => {
    const samplePath = join(process.cwd(), "docs/examples/sample-course.md");
    sampleMarkdown = readFileSync(samplePath, "utf-8");
  });

  describe("parseCourseMarkdown", () => {
    it("should parse a complete course markdown file", () => {
      const parsed = parseCourseMarkdown(sampleMarkdown);

      expect(parsed).toBeDefined();
      expect(parsed.metadata).toBeDefined();
      expect(parsed.metadata.code).toBe("CS101");
      expect(parsed.metadata.name).toBe("Introduction to Computer Science");
      expect(parsed.metadata.units).toBe(3);
    });

    it("should parse course metadata correctly", () => {
      const markdown = `<!-- @course: {"code": "TEST101", "name": "Test Course", "description": "Test", "units": 3} -->`;
      const parsed = parseCourseMarkdown(markdown);

      expect(parsed.metadata.code).toBe("TEST101");
      expect(parsed.metadata.name).toBe("Test Course");
      expect(parsed.metadata.description).toBe("Test");
      expect(parsed.metadata.units).toBe(3);
    });

    it("should parse modules correctly", () => {
      const parsed = parseCourseMarkdown(sampleMarkdown);

      expect(parsed.modules.length).toBeGreaterThan(0);
      expect(parsed.modules[0]).toHaveProperty("name");
      expect(parsed.modules[0]).toHaveProperty("metadata");
      expect(parsed.modules[0].metadata).toHaveProperty("order");
    });

    it("should parse lessons within modules", () => {
      const parsed = parseCourseMarkdown(sampleMarkdown);

      const moduleWithLessons = parsed.modules.find((m) => m.lessons.length > 0);
      expect(moduleWithLessons).toBeDefined();

      if (moduleWithLessons) {
        expect(moduleWithLessons.lessons.length).toBeGreaterThan(0);
        expect(moduleWithLessons.lessons[0]).toHaveProperty("name");
        expect(moduleWithLessons.lessons[0]).toHaveProperty("metadata");
        expect(moduleWithLessons.lessons[0].metadata).toHaveProperty("order");
      }
    });

    it("should parse test questions correctly", () => {
      const testMarkdown = `
#### Test: Sample Quiz
<!-- @test: {"name": "Sample Quiz", "duration_mins": 30} -->

**Q1:** What is a variable?
- [ ] Option A
- [x] Option B (correct)
- [ ] Option C

**Explanation:** Variables store data.
**Marks:** 2
**Order:** 1
`;

      const parsed = parseCourseMarkdown(testMarkdown);

      expect(parsed.tests.length).toBeGreaterThan(0);
      const test = parsed.tests[0];
      expect(test.questions.length).toBeGreaterThan(0);

      const question = test.questions[0];
      expect(question.question).toContain("What is a variable");
      expect(question.correct_answer).toBe("B");
      expect(question.marks).toBe(2);
      expect(question.order).toBe(1);
    });

    it("should parse practice questions correctly", () => {
      const testMarkdown = `
<!-- @course: {"code": "TEST101", "name": "Test", "description": "Test", "units": 3} -->

## Module: Test Module
<!-- @module: {"order": 1} -->

### Lesson: Test Lesson
<!-- @lesson: {"order": 1} -->

Content here.

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

      const parsed = parseCourseMarkdown(testMarkdown);

      const module = parsed.modules[0];
      const lesson = module.lessons[0];

      expect(lesson.practiceQuestions.length).toBeGreaterThan(0);
      const pq = lesson.practiceQuestions[0];
      expect(pq.question_text).toContain("What is a variable");
      expect(pq.difficulty).toBe("easy");
      expect(pq.question_type).toBe("multiple_choice");
      expect(pq.explanation).toBeDefined();
    });

    it("should handle assignment format correctly", () => {
      const testMarkdown = `
#### Assignment: Sample Assignment
<!-- @test: {"name": "Sample Assignment", "format": "assignment", "deadline": "2024-12-31T23:59:59Z"} -->

**Q1:** Implement a function.
**Explanation:** Create a function.
**Marks:** 10
**Order:** 1
`;

      const parsed = parseCourseMarkdown(testMarkdown);

      expect(parsed.tests.length).toBeGreaterThan(0);
      const test = parsed.tests[0];
      expect(test.metadata.format).toBe("assignment");
      expect(test.metadata.deadline).toBe("2024-12-31T23:59:59Z");
    });

    it("should handle module and lesson ordering", () => {
      const testMarkdown = `
<!-- @course: {"code": "TEST101", "name": "Test", "description": "Test", "units": 3} -->

## Module: Module 1
<!-- @module: {"order": 1} -->

### Lesson: Lesson 1
<!-- @lesson: {"order": 1} -->
Content 1

## Module: Module 2
<!-- @module: {"order": 2} -->

### Lesson: Lesson 1
<!-- @lesson: {"order": 1} -->
Content 1
`;

      const parsed = parseCourseMarkdown(testMarkdown);

      expect(parsed.modules.length).toBe(2);
      expect(parsed.modules[0].metadata.order).toBe(1);
      expect(parsed.modules[1].metadata.order).toBe(2);
    });

    it("should handle invalid markdown gracefully", () => {
      const invalidMarkdown = `## Module: Test Module`;

      expect(() => {
        const parsed = parseCourseMarkdown(invalidMarkdown);
        // Should still parse but validation should fail
        expect(parsed.metadata.code).toBeUndefined();
      }).not.toThrow();
    });
  });

  describe("validateParsedCourse", () => {
    it("should validate a correct course", () => {
      const parsed = parseCourseMarkdown(sampleMarkdown);
      const validation = validateParsedCourse(parsed);

      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it("should detect missing course code", () => {
      const invalidCourse: ParsedCourse = {
        metadata: {
          name: "Test Course",
          description: "Test",
          units: 3,
        } as any,
        modules: [],
        tests: [],
      };

      const validation = validateParsedCourse(invalidCourse);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.field === "course.code")).toBe(
        true
      );
    });

    it("should detect missing course name", () => {
      const invalidCourse: ParsedCourse = {
        metadata: {
          code: "TEST101",
          description: "Test",
          units: 3,
        } as any,
        modules: [],
        tests: [],
      };

      const validation = validateParsedCourse(invalidCourse);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.field === "course.name")).toBe(
        true
      );
    });

    it("should detect duplicate module orders", () => {
      const invalidCourse: ParsedCourse = {
        metadata: {
          code: "TEST101",
          name: "Test Course",
          description: "Test",
          units: 3,
        } as any,
        modules: [
          {
            name: "Module 1",
            metadata: { order: 1 },
            lessons: [],
            tests: [],
          },
          {
            name: "Module 2",
            metadata: { order: 1 }, // Duplicate order
            lessons: [],
            tests: [],
          },
        ],
        tests: [],
      };

      const validation = validateParsedCourse(invalidCourse);

      expect(validation.valid).toBe(false);
      expect(
        validation.errors.some((e) => e.message.includes("Duplicate module order"))
      ).toBe(true);
    });

    it("should detect missing question correct answers", () => {
      const invalidCourse: ParsedCourse = {
        metadata: {
          code: "TEST101",
          name: "Test Course",
          description: "Test",
          units: 3,
        } as any,
        modules: [],
        tests: [
          {
            metadata: { name: "Test Quiz" },
            questions: [
              {
                question: "Test question",
                order: 1,
                marks: 1,
              } as any,
            ],
          },
        ],
      };

      const validation = validateParsedCourse(invalidCourse);

      expect(validation.valid).toBe(false);
      expect(
        validation.errors.some((e) =>
          e.message.includes("correct answer")
        )
      ).toBe(true);
    });

    it("should provide warnings for missing practice question explanations", () => {
      const course: ParsedCourse = {
        metadata: {
          code: "TEST101",
          name: "Test Course",
          description: "Test",
          units: 3,
        } as any,
        modules: [
          {
            name: "Module 1",
            metadata: { order: 1 },
            lessons: [
              {
                name: "Lesson 1",
                metadata: { order: 1 },
                content: "",
                tests: [],
                practiceQuestions: [
                  {
                    question_text: "Test question",
                    difficulty: "easy",
                    question_type: "multiple_choice",
                    explanation: "", // Empty explanation
                    order: 1,
                  } as any,
                ],
              },
            ],
            tests: [],
          },
        ],
        tests: [],
      };

      const validation = validateParsedCourse(course);

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(
        validation.warnings.some((w) =>
          w.message.includes("explanation")
        )
      ).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty markdown", () => {
      const parsed = parseCourseMarkdown("");
      expect(parsed.modules.length).toBe(0);
      expect(parsed.tests.length).toBe(0);
    });

    it("should handle markdown with only course metadata", () => {
      const markdown = `<!-- @course: {"code": "TEST101", "name": "Test", "description": "Test", "units": 3} -->`;
      const parsed = parseCourseMarkdown(markdown);

      expect(parsed.metadata.code).toBe("TEST101");
      expect(parsed.modules.length).toBe(0);
    });

    it("should handle questions without options", () => {
      const testMarkdown = `
#### Test: Open Question
<!-- @test: {"name": "Open Question"} -->

**Q1:** Write an essay about variables.

**Explanation:** This is an open-ended question.
**Marks:** 10
**Order:** 1
`;

      const parsed = parseCourseMarkdown(testMarkdown);
      const test = parsed.tests[0];
      const question = test.questions[0];

      expect(question.question).toBeDefined();
      expect(question.options).toBeUndefined();
    });

    it("should handle true/false questions", () => {
      const testMarkdown = `
#### Test: True/False
<!-- @test: {"name": "True/False Quiz"} -->

**Q1:** Variables can be reassigned.
- [x] True
- [ ] False

**Explanation:** Variables can be reassigned.
**Marks:** 1
**Order:** 1
`;

      const parsed = parseCourseMarkdown(testMarkdown);
      const test = parsed.tests[0];
      const question = test.questions[0];

      expect(question.options).toBeDefined();
      const options = question.options!;
      expect(Object.keys(options).length).toBe(2);
      expect(options["A"].is_correct).toBe(true);
    });
  });
});



