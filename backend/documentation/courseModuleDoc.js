const courseModuleProperties = {
  id: { type: "integer", readOnly: true },
  course_id: { type: "integer" },
  name: { type: "string" },
  order: { type: "integer" },
  description: { type: "string" },
  published: { type: "boolean", default: false },
  created_at: { type: "string", format: "date-time", readOnly: true },
  updated_at: { type: "string", format: "date-time", readOnly: true },
};

const swagger = {
  list: {
    description: "Get all course modules in the database",
    summary: "Get all course modules in the database",
    tags: ["coursemodule"],
    params: {},
    response: {
      200: {
        description: "Array containing all course modules",
        type: "array",
        items: { type: "object", properties: courseModuleProperties },
      },
    },
  },
  get: {
    tags: ["coursemodule"],
    description: "Get a course module from the database",
    summary: "Get a course module from the database",

    params: { id: { type: "string" } },
    response: {
      // 200: {
      //   description: "A course module",
      //   type: "object",
      //   properties: courseModuleProperties
      // }
    },
  },
  add: {
    tags: ["coursemodule"],
    description: "Add a course module to the database",
    summary: "Add a course module to the database",

    params: {},
    body: {
      type: "object",
      required: ["course_id", "name", "order"],
      properties: courseModuleProperties,
    },
    response: {
      200: {
        description: "A course module",
        type: "object",
        properties: courseModuleProperties,
      },
    },
  },
  update: {
    tags: ["coursemodule"],
    description: "Update a course module in the database",
    summary: "Update a course module in the database",

    params: { id: { type: "string" } },
    body: {
      type: "object",
      required: ["course_id", "name", "order"],
      properties: courseModuleProperties,
    },
    response: {
      200: {
        description: "A courseModule",
        type: "object",
        properties: courseModuleProperties,
      },
    },
  },
  delete: {
    tags: ["coursemodule"],
    description: "Delete a course module from the database",
    summary: "Delete a course module from the database",

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
