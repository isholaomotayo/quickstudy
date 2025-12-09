const courseTestProperties = {
  id: { type: "integer", readOnly: true },
  course_id: { type: "integer" },
  course_module_id: { type: "integer" },
  course_lesson_id: { type: "integer" },
  name: { type: "string" },
  format: { type: "string" },
  instructions: { type: "string" },
  duration_mins: { type: "integer" },
  deadline: { type: "string", format: "date-time" },
  max_attempts: { type: "integer" },
  max_score: { type: "integer" },
  published: { type: "boolean", default: false },
  created_at: { type: "string", format: "date-time", readOnly: true },
  updated_at: { type: "string", format: "date-time", readOnly: true },
};

const swagger = {
  list: {
    description: "Get all course tests in the database",
    summary: "Get all course tests in the database",
    tags: ["coursetest"],
    params: {},
    response: {
      200: {
        description: "Array containing all course tests",
        type: "array",
        items: { type: "object", properties: courseTestProperties },
      },
    },
  },
  get: {
    tags: ["coursetest"],
    description: "Get a course Test from the database",
    summary: "Get a course Test from the database",

    params: { id: { type: "string" } },
    response: {
      200: {
        description: "A course Test with its questions",
        type: "object",
        properties: {
          ...courseTestProperties,
          course_questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer" },
                course_test_id: { type: "integer" },
                question: { type: "string" },
                details: { type: "string" },
                options: { 
                  type: "object", 
                  nullable: true,
                  additionalProperties: true 
                },
                answer: { type: "string" },
                order: { type: "integer" },
                marks: { type: "integer" },
                created_at: { type: "string", format: "date-time" },
                updated_at: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
    },
  },
  add: {
    tags: ["coursetest"],
    description: "Add a course Test to the database",
    summary: "Add a course Test to the database",

    params: {},
    body: {
      type: "object",
      required: ["name"],
    },
    response: {
      200: {
        description: "A course Test",
        type: "object",
        properties: courseTestProperties,
      },
    },
  },
  createBulkAssignment: {
    tags: ["coursetest"],
    description:
      "Create a course test with multiple questions in a single request",
    summary: "Create bulk assignment with questions",

    params: {},
    body: {
      type: "object",
      required: ["name", "questions"],
      properties: {
        name: { type: "string" },
        instructions: { type: "string" },
        deadline: { type: "string", format: "date-time" },
        max_attempts: { type: "integer" },
        max_score: { type: "integer" },
        format: { type: "string" },
        published: { type: "boolean" },
        course_id: { type: "integer" },
        course_module_id: { type: "integer" },
        course_lesson_id: { type: "integer" },
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question: { type: "string" },
              details: { type: "string" },
              marks: { type: "integer" },
              order: { type: "integer" },
              question_type: { type: "string" },
            },
          },
        },
      },
    },
    response: {
      200: {
        description: "A course test with its questions",
        type: "object",
        properties: {
          ...courseTestProperties,
          course_questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer" },
                course_test_id: { type: "integer" },
                question: { type: "string" },
                details: { type: "string" },
                options: { 
                  type: "object", 
                  nullable: true,
                  additionalProperties: true 
                },
                answer: { type: "string" },
                order: { type: "integer" },
                marks: { type: "integer" },
                created_at: { type: "string", format: "date-time" },
                updated_at: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
    },
  },
  update: {
    tags: ["coursetest"],
    description: "Update a course Test in the database",
    summary: "Update a course Test in the database",

    params: { id: { type: "string" } },
    body: {
      type: "object",
      required: ["name"],
    },
    response: {
      200: {
        description: "A course Test with its questions",
        type: "object",
        properties: {
          ...courseTestProperties,
          course_questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer" },
                course_test_id: { type: "integer" },
                question: { type: "string" },
                details: { type: "string" },
                options: { 
                  type: "object", 
                  nullable: true,
                  additionalProperties: true 
                },
                answer: { type: "string" },
                order: { type: "integer" },
                marks: { type: "integer" },
                created_at: { type: "string", format: "date-time" },
                updated_at: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
    },
  },
  delete: {
    tags: ["coursetest"],
    description: "Delete a course Test from the database",
    summary: "Delete a course Test from the database",

    params: { id: { type: "string" } },
    response: {
      200: {
        description: "",
        type: "object",
      },
    },
  },
};

module.exports = swagger;
