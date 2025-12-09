//endpoints and routes for all fee
const feeProperties = {
  id: { type: "integer" },
  name: { type: "string" },
  description: { type: "string" },
  institution_id: { type: "integer" },
  amount: { type: "number" },
  frequency: { type: "integer" },
  optional: { type: "integer" },
  compulsory: { type: "integer" },
  session_id: { type: "integer" },
  monthly: { type: "integer" },
  monthly_parts: { type: "integer" },
  semesterly: { type: "integer" },
  semesterly_parts: { type: "integer" },
  sessionly: { type: "integer" },
  sessionly_parts: { type: "integer" },
  faculty_id: { type: "integer" },
  department_id: { type: "integer" },
  programme_id: { type: "integer" },
  level_id: { type: "integer" },
  active: { type: "boolean" }
};

const swagger = {
  getFees: {
    tags: ["Fee"],
    description: "Get all fee in the database",
    summary: "Get all fee in the database"
    // response: {
    //   200: {
    //     description: 'Array containing all grades',
    //     type: 'array',
    //     items: { type: 'object', properties: feeProperties }
    //   }
    // }
  },
  getFeesByParams: {
    tags: ["Fee"],
    description: "Gets all fee in the database using the params passed",
    summary: "Gets all fee in the database using the params passed"
  },
  addFee: {
    tags: ["Fee"],
    description: "Add new Fee to the database",
    summary: "Adds new Fee to the database",
    params: {},
    body: {
      type: "object",
      required: ["name"],
      properties: feeProperties
    },
    response: {
      200: {
        description: "New Fee",
        type: "object",
        properties: feeProperties
      }
    }
  },
  getFeeById: {
    tags: ["Fee"],
    description: "Retrieve a fee from the database using the id",
    summary: "Retrieve a fee from the database",
    params: { id: { type: "integer" } }
  },
  updateFee: {
    tags: ["Fee"],
    description: "Updates a fee in the database",
    summary: "Updates a fee in the database",
    params: { id: { type: "integer" } },
    body: {
      type: "object",
      properties: feeProperties
    }
  },
  deleteFee: {
    tags: ["Fee"],
    description: "Deletes a fee from the database using the id",
    summary: "Deletes a fee from the database",
    params: { id: { type: "integer" } },
    response: {
      204: {
        type: "string",
        description: "Deleted Fee"
      }
    }
  }
};

module.exports = swagger;
