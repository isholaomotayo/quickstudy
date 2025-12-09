const departmentProperties = {
  id: { type: "integer", readOnly: true },
  faculty_id: { type: "integer" },
  code: { type: "string" },
  name: { type: "string" },
  email: { type: "string" },
  phone: { type: "string" },
  description: { type: "string" },
  created_at: { type: "string", format: "date-time", readOnly: true },
  updated_at: { type: "string", format: "date-time", readOnly: true },
};

const swagger = {
  list: {
    description: "Get all departments in the database",
    summary: "Get all departments in the database",
    tags: ["department"],
    params: {},
    response: {
      200: {
        description: "Array containing all departments",
        type: "array",
        items: { type: "object", properties: departmentProperties },
      },
    },
  },
  get: {
    tags: ["department"],
    description: "Get a department from the database",
    summary: "Get a department from the database",

    params: { id: { type: "string" } },
    response: {
      // 200: {
      //   description: "A department",
      //   type: "object",
      //   properties: departmentProperties
      // }
    },
  },
  add: {
    tags: ["department"],
    description: "Add a department to the database",
    summary: "Add a department to the database",

    params: {},
    body: {
      type: "object",
      required: ["faculty_id", "code", "name"],
      properties: departmentProperties,
    },
    response: {
      200: {
        description: "A department",
        type: "object",
        properties: departmentProperties,
      },
    },
  },
  update: {
    tags: ["department"],
    description: "Update a department in the database",
    summary: "Update a department in the database",

    params: { id: { type: "string" } },
    body: {
      type: "object",
      properties: departmentProperties,
    },
  },
  delete: {
    tags: ["department"],
    description: "Delete a department from the database",
    summary: "Delete a department from the database",

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
