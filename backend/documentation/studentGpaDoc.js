//endpoints for all studentGpa
const studentGpaProperties = {
  id: { type: "integer" },
  student_id: { type: "integer" },
  semester_id: { type: "integer" },

  level_id: { type: "integer" },
  classdegree_id: { type: "integer" },
  prev_tnu: { type: "number" },
  prev_tcp: { type: "number" },
  prev_gpa: { type: "number" },

  current_tnu: { type: "number" },
  current_tcp: { type: "number" },
  current_gpa: { type: "number" },

  cumulative_tnu: { type: "number" },
  cumulative_tcp: { type: "number" },
  cumulative_gpa: { type: "number" },
};

const swagger = {
  getStudentGpas: {
    tags: ["Student-Gpa"],
    description: "Get all StudentGpa in the database",
    summary: "Get all StudentGpa in the database",
  },
  addStudentGpa: {
    tags: ["Student-Gpa"],
    description: "Add new StudentGpa to the database",
    summary: "Adds new StudentGpa to the database",
    params: {},
    body: {
      type: "object",
      required: ["student_id", "semester_id"],
      properties: studentGpaProperties,
    },
  },
  getStudentGpaById: {
    tags: ["Student-Gpa"],
    description: "Retrieve a StudentGpa from the database using the id",
    summary: "Retrieve a StudentGpa from the database",
    params: { id: { type: "integer" } },
  },
  getStudentGpaByStudentId: {
    tags: ["Student-Gpa"],
    description: "Retrieve StudentGpas from the database using the student id",
    summary: "Retrieve StudentGpas from the database",
    params: { student_id: { type: "integer" } },
  },
  getStudentGpasBySearchParams: {
    tags: ["Student-Gpa"],
    description:
      "Retrieve StudentGpas from the database using the search parameters specified",
    summary: "Retrieve StudentGpas from the database",

    query: studentGpaProperties,
  },
  updateStudentGpa: {
    tags: ["Student-Gpa"],
    description: "Updates a StudentGpa in the database",
    summary: "Updates a StudentGpa in the database",
    params: { id: { type: "integer" } },
    body: {
      type: "object",
      properties: studentGpaProperties,
    },
  },
  deleteStudentGpa: {
    tags: ["Student-Gpa"],
    description: "Deletes a StudentGpa from the database using the id",
    summary: "Deletes a StudentGpa from the database",
    params: { id: { type: "integer" } },
  },
  calculateStudentGpa: {
    tags: ["Student-Gpa"],
    description: "Calculate and store GPA for a student in a specific semester",
    summary: "Calculate student GPA for a semester",
    body: {
      type: "object",
      required: ["student_id", "semester_id", "level_id"],
      properties: {
        student_id: { type: "integer" },
        semester_id: { type: "integer" },
        level_id: { type: "integer" },
      },
    },
  },
  calculateBatchGpa: {
    tags: ["Student-Gpa"],
    description: "Calculate GPA for multiple students in batch",
    summary: "Batch calculate student GPAs",
    body: {
      type: "object",
      required: ["student_ids", "semester_id", "level_id"],
      properties: {
        student_ids: {
          type: "array",
          items: { type: "integer" },
        },
        semester_id: { type: "integer" },
        level_id: { type: "integer" },
      },
    },
  },
  recalculateStudentGpa: {
    tags: ["Student-Gpa"],
    description: "Recalculate all GPAs for a specific student",
    summary: "Recalculate all student GPAs",
    params: { student_id: { type: "integer" } },
  },
};

module.exports = swagger;
