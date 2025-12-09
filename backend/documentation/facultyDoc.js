const facultyProperties = {
  id: { type: "integer", readOnly: true },
  institution_id: { type: "integer" },
  name: { type: "string" },
  email: { type: "string" },
  phone: { type: "string" },
  description: { type: "string" },
  created_at: { type: "string", format: "date-time", readOnly: true },
  updated_at: { type: "string", format: "date-time", readOnly: true },
};

const swagger = {
  list: {
    description: "Get all faculties in the database",
    summary: "Get all faculties in the database",
    tags: ["faculty"],
    params: {},
    response: {
      200: {
        description: "Array containing all faculties",
        type: "array",
        items: { type: "object", properties: facultyProperties },
      },
    },
  },
  get: {
    tags: ["faculty"],
    description: "Get a faculty from the database",
    summary: "Get a faculty from the database",

    params: { id: { type: "string" } },
    response: {
      // 200: {
      //   description: "A faculty",
      //   type: "object",
      //   properties: facultyProperties
      // }
    },
  },
  add: {
    tags: ["faculty"],
    description: "Add a faculty to the database",
    summary: "Add a faculty to the database",

    params: {},
    body: {
      type: "object",
      required: ["institution_id", "name"],
      properties: facultyProperties,
    },
    response: {
      200: {
        description: "A faculty",
        type: "object",
        properties: facultyProperties,
      },
    },
  },
  update: {
    tags: ["faculty"],
    description: "Update a faculty in the database",
    summary: "Update a faculty in the database",

    params: { id: { type: "string" } },
    body: {
      type: "object",
      required: ["institution_id", "name"],
      properties: facultyProperties,
    },
    response: {
      200: {
        description: "A faculty",
        type: "object",
        properties: facultyProperties,
      },
    },
  },
  delete: {
    tags: ["faculty"],
    description: "Delete a faculty from the database",
    summary: "Delete a faculty from the database",

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
