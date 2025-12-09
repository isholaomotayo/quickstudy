const courseLessonProperties = {
  id: { type: "integer", readOnly: true },
  course_module_id: { type: "integer" },
  name: { type: "string" },
  order: { type: "integer" },
  description: { type: "string" },
  created_at: { type: "string", format: "date-time", readOnly: true },
  updated_at: { type: "string", format: "date-time", readOnly: true },
  content: { type: "string" },
};

const swagger = {
  list: {
    description: "Get all course lessons in the database",
    summary: "Get all course lessons in the database",
    tags: ["courselesson"],
    params: {},
    response: {
      200: {
        description: "Array containing all course lessons",
        type: "array",
        items: { type: "object", properties: courseLessonProperties },
      },
    },
  },
  get: {
    tags: ["courselesson"],
    description: "Get a course lesson from the database",
    summary: "Get a course lesson from the database",

    params: { id: { type: "string" } },
    response: {
      200: {
        description: "A course lesson",
        type: "object",
        properties: courseLessonProperties,
      },
    },
  },
  add: {
    tags: ["courselesson"],
    description: "Add a course lesson to the database",
    summary: "Add a course lesson to the database",

    params: {},
    body: {
      type: "object",
      required: ["course_module_id", "name", "order"],
      properties: courseLessonProperties,
    },
    response: {
      200: {
        description: "A course lesson",
        type: "object",
        properties: courseLessonProperties,
      },
    },
  },
  update: {
    tags: ["courselesson"],
    description: "Update a course lesson in the database",
    summary: "Update a course lesson in the database",

    params: { id: { type: "string" } },
    body: {
      type: "object",
      required: ["course_module_id", "name", "order"],
      properties: courseLessonProperties,
    },
    response: {
      200: {
        description: "A course lesson",
        type: "object",
        properties: courseLessonProperties,
      },
    },
  },
  delete: {
    tags: ["courselesson"],
    description: "Delete a course lesson from the database",
    summary: "Delete a course lesson from the database",

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
