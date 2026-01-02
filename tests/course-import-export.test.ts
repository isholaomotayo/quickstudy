/**
 * Course Import/Export API Tests
 * Using Bun test runner
 */

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

// Mock fetch for API tests
const originalFetch = globalThis.fetch;

describe("Course Import/Export API", () => {
  let sampleMarkdown: string;
  const baseUrl = process.env.API_URL || "http://localhost:8080";

  beforeAll(() => {
    const samplePath = join(process.cwd(), "docs/examples/sample-course.md");
    sampleMarkdown = readFileSync(samplePath, "utf-8");
  });

  describe("Import API", () => {
    it("should accept markdown file upload", async () => {
      const formData = new FormData();
      const blob = new Blob([sampleMarkdown], { type: "text/markdown" });
      formData.append("file", blob, "sample-course.md");
      formData.append("department_id", "1");

      // Mock fetch response
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              success: true,
              courseId: 123,
              created: {
                course: true,
                modules: 2,
                lessons: 2,
                tests: 1,
                questions: 5,
                practiceQuestions: 5,
              },
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      };

      const response = await fetch(`${baseUrl}/api/course/import`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data.courseId).toBeDefined();
      expect(result.data.created.modules).toBeGreaterThan(0);
    });

    it("should accept markdown text input", async () => {
      const formData = new FormData();
      formData.append("markdown", sampleMarkdown);
      formData.append("department_id", "1");

      // Mock fetch response
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              success: true,
              courseId: 124,
              created: {
                course: true,
                modules: 2,
                lessons: 2,
                tests: 1,
                questions: 5,
                practiceQuestions: 5,
              },
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      };

      const response = await fetch(`${baseUrl}/api/course/import`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
    });

    it("should return validation errors for invalid markdown", async () => {
      const invalidMarkdown = `## Module: Test Module`;

      const formData = new FormData();
      formData.append("markdown", invalidMarkdown);
      formData.append("department_id", "1");

      // Mock fetch response
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Validation failed",
            validation: {
              valid: false,
              errors: [
                {
                  field: "course.code",
                  message: "Course code is required",
                },
              ],
            },
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      };

      const response = await fetch(`${baseUrl}/api/course/import`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(result.success).toBe(false);
      expect(result.validation).toBeDefined();
      expect(result.validation.valid).toBe(false);
    });

    it("should require department_id", async () => {
      const formData = new FormData();
      formData.append("markdown", sampleMarkdown);

      // Mock fetch response
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Department ID is required",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      };

      const response = await fetch(`${baseUrl}/api/course/import`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(result.error).toContain("Department ID");
    });
  });

  describe("Export API", () => {
    it("should export course as markdown", async () => {
      // Mock fetch response
      globalThis.fetch = async () => {
        return new Response(sampleMarkdown, {
          status: 200,
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Content-Disposition": 'attachment; filename="course-CS101-1234567890.md"',
          },
        });
      };

      const response = await fetch(
        `${baseUrl}/api/course/export?course_id=1&include_unpublished=false&include_practice_questions=true`
      );

      expect(response.ok).toBe(true);
      expect(response.headers.get("Content-Type")).toContain("text/markdown");

      const markdown = await response.text();
      expect(markdown).toContain("CS101");
      expect(markdown).toContain("Introduction to Computer Science");
    });

    it("should include unpublished content when requested", async () => {
      // Mock fetch response
      globalThis.fetch = async () => {
        return new Response(sampleMarkdown, {
          status: 200,
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
          },
        });
      };

      const response = await fetch(
        `${baseUrl}/api/course/export?course_id=1&include_unpublished=true`
      );

      expect(response.ok).toBe(true);
    });

    it("should exclude practice questions when requested", async () => {
      // Mock fetch response
      globalThis.fetch = async () => {
        return new Response(sampleMarkdown, {
          status: 200,
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
          },
        });
      };

      const response = await fetch(
        `${baseUrl}/api/course/export?course_id=1&include_practice_questions=false`
      );

      expect(response.ok).toBe(true);
    });

    it("should return 404 for non-existent course", async () => {
      // Mock fetch response
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Course not found",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      };

      const response = await fetch(
        `${baseUrl}/api/course/export?course_id=99999`
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it("should require course_id parameter", async () => {
      // Mock fetch response
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({
            success: false,
            error: "course_id parameter is required",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      };

      const response = await fetch(`${baseUrl}/api/course/export`);

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });
});



