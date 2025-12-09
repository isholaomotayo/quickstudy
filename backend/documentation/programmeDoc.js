const programmeProperties = {
  id: { type: "integer", readOnly: true },
  department_id: { type: "integer" },
  name: { type: "string" },
  years: { type: "integer" },
  prefix: { type: "string" },
  description: { type: "string" },
  created_at: { type: "string", format: "date-time", readOnly: true },
  updated_at: { type: "string", format: "date-time", readOnly: true },
};

const swagger = {
  list: {
    description: "Get all programmes in the database",
    summary: "Get all programmes in the database",
    tags: ["programme"],
    params: {},
    response: {
      200: {
        description: "Array containing all programmes",
        type: "array",
        items: { type: "object", properties: programmeProperties },
      },
    },
  },
  get: {
    tags: ["programme"],
    description: "Get a programme from the database",
    summary: "Get a programme from the database",

    params: { id: { type: "string" } },
    response: {
      // 200: {
      //   description: "A programme",
      //   type: "object",
      //   properties: programmeProperties
      // }
    },
  },
  add: {
    tags: ["programme"],
    description: "Add a programme to the database",
    summary: "Add a programme to the database",

    params: {},
    body: {
      type: "object",
      required: ["department_id", "name", "years"],
      properties: programmeProperties,
    },
    response: {
      200: {
        description: "A programme",
        type: "object",
        properties: programmeProperties,
      },
    },
  },
  update: {
    tags: ["programme"],
    description: "Update a programme in the database",
    summary: "Update a programme in the database",

    params: { id: { type: "string" } },
    body: {
      type: "object",
      required: ["department_id", "name", "years"],
      properties: programmeProperties,
    },
    response: {
      200: {
        description: "A programme",
        type: "object",
        properties: programmeProperties,
      },
    },
  },
  delete: {
    tags: ["programme"],
    description: "Delete a programme from the database",
    summary: "Delete a programme from the database",

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
