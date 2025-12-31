/**
 * Type definitions for course markdown parsing and import/export
 */

export interface CourseMarkdownMetadata {
  code: string;
  name: string;
  description: string;
  units: number;
  department_id?: number;
  programme_id?: number;
  level_id?: number;
  semester_position?: number;
  published?: boolean;
}

export interface ModuleMarkdownMetadata {
  order: number;
  description?: string;
  published?: boolean;
}

export interface LessonMarkdownMetadata {
  order: number;
  description?: string;
}

export interface TestMarkdownMetadata {
  name: string;
  instructions?: string;
  duration_mins?: number;
  max_attempts?: number;
  deadline?: string;
  format?: string; // "quiz", "assignment", or ""
  published?: boolean;
}

export interface PracticeMarkdownMetadata {
  difficulty?: "easy" | "medium" | "hard";
  count?: number;
}

export interface ParsedQuestion {
  question: string;
  details?: string;
  options?: Record<string, { text: string; is_correct: boolean }>;
  correct_answer?: string;
  explanation?: string;
  marks?: number;
  order: number;
  difficulty?: "easy" | "medium" | "hard";
  question_type?: "multiple_choice" | "true_false";
}

export interface ParsedPracticeQuestion extends ParsedQuestion {
  question_text: string;
  difficulty: "easy" | "medium" | "hard";
  question_type: "multiple_choice" | "true_false";
  explanation: string;
}

export interface ParsedTest {
  metadata: TestMarkdownMetadata;
  questions: ParsedQuestion[];
  content?: string; // Any content after the test heading
}

export interface ParsedLesson {
  name: string;
  metadata: LessonMarkdownMetadata;
  content: string;
  tests: ParsedTest[];
  practiceQuestions: ParsedPracticeQuestion[];
}

export interface ParsedModule {
  name: string;
  metadata: ModuleMarkdownMetadata;
  lessons: ParsedLesson[];
  tests: ParsedTest[]; // Tests at module level
}

export interface ParsedCourse {
  metadata: CourseMarkdownMetadata;
  modules: ParsedModule[];
  tests: ParsedTest[]; // Tests at course level
}

export interface ValidationError {
  field: string;
  message: string;
  line?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ImportResult {
  success: boolean;
  courseId?: number;
  errors?: ValidationError[];
  warnings?: ValidationError[];
  created: {
    course: boolean;
    modules: number;
    lessons: number;
    tests: number;
    questions: number;
    practiceQuestions: number;
  };
}

export interface ExportOptions {
  includeUnpublished?: boolean;
  includePracticeQuestions?: boolean;
}


