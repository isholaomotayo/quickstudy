/**
 * Bun test setup file
 * Runs before all tests
 */

// Set environment variables for testing
if (typeof process !== "undefined" && process.env) {
  (process.env as any).NODE_ENV = "test";
  (process.env as any).API_URL = process.env.API_URL || "http://localhost:8080";
}

// Mock console methods to reduce noise during tests
const originalConsole = console;

global.console = {
  ...originalConsole,
  log: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
  // Keep error visible for debugging
  error: originalConsole.error,
};

// Global test utilities
export const testUtils = {
  /**
   * Create a mock FormData with course markdown
   */
  createImportFormData: (markdown: string, departmentId: string = "1") => {
    const formData = new FormData();
    formData.append("markdown", markdown);
    formData.append("department_id", departmentId);
    return formData;
  },

  /**
   * Create a mock file FormData
   */
  createFileFormData: (content: string, filename: string = "course.md") => {
    const formData = new FormData();
    const blob = new Blob([content], { type: "text/markdown" });
    formData.append("file", blob, filename);
    formData.append("department_id", "1");
    return formData;
  },

  /**
   * Read sample course markdown
   */
  readSampleCourse: () => {
    const { readFileSync } = require("fs");
    const { join } = require("path");
    const samplePath = join(process.cwd(), "docs/examples/sample-course.md");
    return readFileSync(samplePath, "utf-8");
  },
};

