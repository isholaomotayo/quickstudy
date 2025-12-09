const courseQuestionProperties = {
  id: { type: "integer", readOnly: true },
  course_test_id: { type: "integer" },
  question: { type: "string" },
  details: { type: "string" },
  options: {
    type: "object",
    nullable: true,
    properties: {
      A: {
        type: "object",
        properties: {
          text: { type: "string" },
          is_answer: { type: "boolean", default: false, nullable: true },
        },
      },
      B: {
        type: "object",
        properties: {
          text: { type: "string" },
          is_answer: { type: "boolean", default: false, nullable: true },
        },
      },
      C: {
        type: "object",
        properties: {
          text: { type: "string" },
          is_answer: { type: "boolean", default: false, nullable: true },
        },
      },
      D: {
        type: "object",
        properties: {
          text: { type: "string" },
          is_answer: { type: "boolean", default: false, nullable: true },
        },
      },
      E: {
        type: "object",
        properties: {
          text: { type: "string" },
          is_answer: { type: "boolean", default: false, nullable: true },
        },
      },
    },
  },
  order: { type: "integer" },
  marks: { type: "integer" },
  question_type: { type: "string", enum: ["single", "multiple"] },
  created_at: { type: "string", format: "date-time", readOnly: true },
  updated_at: { type: "string", format: "date-time", readOnly: true },
};

const swagger = {
  list: {
    description: "Get all course questions in the database",
    summary: "Get all course questions in the database",
    tags: ["coursequestion"],
    params: {},
    response: {
      200: {
        description: "Array containing all course questions",
        type: "array",
        items: { type: "object", properties: courseQuestionProperties },
      },
    },
  },
  get: {
    tags: ["coursequestion"],
    description: "Get a course question from the database",
    summary: "Get a course question from the database",

    params: { id: { type: "string" } },
    response: {
      200: {
        description: "A course Question",
        type: "object",
        properties: courseQuestionProperties,
      },
    },
  },
  add: {
    tags: ["coursequestion"],
    description: "Add a course Question to the database",
    summary: "Add a course Question to the database",

    params: {},
    body: {
      type: "object",
      required: ["course_test_id", "question", "marks"],
      properties: courseQuestionProperties,
    },
    response: {
      // 200: {
      //   description: "A course Question",
      //   type: "object",
      //   properties: courseQuestionFullProperties()
      // }
    },
  },
  update: {
    tags: ["coursequestion"],
    description: "Update a course Question in the database",
    summary: "Update a course Question in the database",

    params: { id: { type: "string" } },
    body: {
      type: "object",
      required: ["course_test_id", "question", "marks"],
      properties: courseQuestionProperties,
    },
    response: {
      // 200: {
      //   description: "A courseQuestion",
      //   type: "object",
      //   properties: courseQuestionFullProperties()
      // }
    },
  },
  delete: {
    tags: ["coursequestion"],
    description: "Delete a course Question from the database",
    summary: "Delete a course Question from the database",

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
