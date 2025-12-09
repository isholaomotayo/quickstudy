const courseProperties = {
  id: { type: "integer", readOnly: true },
  department_id: { type: "integer" },
  programme_id: { type: "integer" },
  code: { type: "string" },
  name: { type: "string" },
  level_id: { type: "integer" },
  units: { type: "integer" },
  semester_position: { type: "integer" },
  description: { type: "string" },
  published: { type: "boolean", default: false },
  created_at: { type: "string", format: "date-time", readOnly: true },
  updated_at: { type: "string", format: "date-time", readOnly: true },
};

const swagger = {
  list: {
    description: "Get all courses in the database",
    summary: "Get all courses in the database",
    tags: ["course"],
    params: {},
    response: {
      // 200: {
      //   description: "Array containing all courses",
      //   type: "array",
      //   items: { type: "object", properties: courseProperties }
      // }
    },
  },
  get: {
    tags: ["course"],
    description: "Get a course from the database",
    summary: "Get a course from the database",

    params: { id: { type: "integer" } },
  },
  add: {
    tags: ["course"],
    description: "Add a course to the database",
    summary: "Add a course to the database",

    params: {},
    body: {
      type: "object",
      required: ["code", "name", "level_id", "units"],
      properties: courseProperties,
    },
    // response: {
    //   200: {
    //     description: "A course",
    //     type: "object",
    //     properties: courseProperties
    //   }
    // }
  },
  update: {
    tags: ["course"],
    description: "Update a course in the database",
    summary: "Update a course in the database",

    params: { id: { type: "string" } },
    body: {
      type: "object",
      //required: ["programme_id", "code", "name", "level_id", "units"],
      properties: courseProperties,
    },
  },
  delete: {
    tags: ["course"],
    description: "Delete a course from the database",
    summary: "Delete a course from the database",

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
