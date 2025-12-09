const questionAnswersFormat = {
  type: "array",
  items: {
    type: "object",
    properties: {
      questionId: { type: "integer" },
      questionOrder: { type: "integer", readOnly: true },
      questionText: { type: "string", readOnly: true },
      selection: {
        type: "object",
        properties: {
          A: {
            type: "object",
            properties: {
              is_answer: { type: "boolean" },
            },
          },
          B: {
            type: "object",
            properties: {
              is_answer: { type: "boolean" },
            },
          },
          C: {
            type: "object",
            properties: {
              is_answer: { type: "boolean", nullable: true },
            },
          },
          D: {
            type: "object",
            properties: {
              is_answer: { type: "boolean", nullable: true },
            },
          },
          E: {
            type: "object",
            properties: {
              is_answer: { type: "boolean", nullable: true },
            },
          },
        },
      },
    },
  },
};

const studentTestProperties = {
  id: { type: "integer", readOnly: true },
  user_id: { type: "integer", readOnly: true },
  course_test_id: { type: "integer" },
  test_name: { type: "string", readOnly: true },
  duration_mins: { type: "integer", readOnly: true },
  deadline: { type: "string", format: "date-time", readOnly: true },
  endtime: { type: "string", format: "date-time", readOnly: true },
  submitted_at: { type: "string", format: "date-time", readOnly: true },
  attempt_number: { type: "integer", readOnly: true },
  max_attempts: { type: "integer", readOnly: true },
  questions_answers: { ...questionAnswersFormat, nullable: true },
  score: { type: "integer", readOnly: true },
  max_score: { type: "integer", readOnly: true },
  feedback: {
    type: "array",
    items: {
      type: "object",
      properties: {
        questionId: { type: "integer" },
        feedback: { type: "string" },
      },
    },
    readOnly: true,
    nullable: true,
  },
  marked_by: { type: "integer", readOnly: true },
  marked_at: { type: "string", format: "date-time", readOnly: true },
  created_at: { type: "string", format: "date-time", readOnly: true },
  updated_at: { type: "string", format: "date-time", readOnly: true },
};

const startStudentTestProperties = {
  course_test_id: { type: "integer" },
};

const finishStudentTestProperties = {
  course_test_id: { type: "integer" },
  questions_answers: { ...questionAnswersFormat, nullable: true },
};

const markStudentTestProperties = {
  student_test_id: { type: "integer" },
  score: { type: "integer" },
  feedback: {
    type: "array",
    items: {
      type: "object",
      properties: {
        questionId: { type: "integer" },
        feedback: { type: "string" },
      },
    },
  },
};

const swagger = {
  list: {
    description: "Get all student tests in the database",
    summary: "Get all student tests in the database",
    tags: ["studenttest"],
    params: {},
    response: {
      // 200: {
      //   description: "Array containing all student tests",
      //   type: "array",
      //   items: { type: "object", properties: studentTestProperties }
      // }
    },
  },
  get: {
    tags: ["studenttest"],
    description: "Get a student Test from the database",
    summary: "Get a student Test from the database",

    params: { id: { type: "string" } },
    response: {
      200: {
        description: "A student Test",
        type: "object",
        properties: studentTestProperties,
      },
    },
  },
  add: {
    // Deprecated, will be removed soon: use start & finish instead
    tags: ["studenttest"],
    description: "Add a student Test to the database",
    summary: "Add a student Test to the database",

    params: {},
    body: {
      type: "object",
      required: ["course_test_id"],
      properties: studentTestProperties,
    },
    response: {
      // 200: {
      //   description: "A student Test",
      //   type: "object",
      //   properties: studentTestProperties
      // }
    },
  },
  start: {
    tags: ["studenttest"],
    description: "Start a student Test",
    summary:
      "Creates a student test record without submitted answers, with endtime property (i.e. submission time limit)",

    params: {},
    body: {
      type: "object",
      required: ["course_test_id"],
      properties: startStudentTestProperties,
    },
    response: {
      // 200: {
      //   description: "A student Test",
      //   type: "object",
      //   properties: studentTestProperties
      // }
    },
  },
  finish: {
    tags: ["studenttest"],
    description: "Submit a student Test",
    summary:
      "Adds answer selection to an already started student test, and set submited_at time",

    params: {},
    body: {
      type: "object",
      required: ["student_test_id"],
      properties: finishStudentTestProperties,
    },
    response: {
      // 200: {
      //   description: "A student Test",
      //   type: "object",
      //   properties: studentTestProperties
      // }
    },
  },
  mark: {
    tags: ["studenttest"],
    description: "Mark a student Test",
    summary:
      "Adds score to a submitted student test, and set marked_by, marked_at",

    params: {},
    body: {
      type: "object",
      required: ["student_test_id", "score"],
      properties: markStudentTestProperties,
    },
    response: {
      // 200: {
      //   description: "A student Test",
      //   type: "object",
      //   properties: studentTestProperties
      // }
    },
  },
  newRoute: {
    description: "Get student test unique name from database",
    summary: "Get student test unique name from database",
    tags: ["studenttest"],
  },
};

module.exports = swagger;
