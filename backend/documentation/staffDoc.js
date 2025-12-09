//endpoints and routes for all staff
const staffProperties = {
  id: { type: "integer" },
  staff_no: { type: "string" },
  user_id: { type: "integer" },
  department_id: { type: "integer" },
  address: { type: "string" },
  gender: { type: "string" },
  level: { type: "string" },
  designation: { type: "string" },
  // User creation fields
  first_name: { type: "string" },
  last_name: { type: "string" },
  other_name: { type: "string" },
  phone: { type: "string" },
  email: { type: "string" },
  username: { type: "string" },
  password: { type: "string" },
  role: { type: "string" },
  institution_id: { type: "integer" },
};

const swagger = {
  getStaff: {
    tags: ["Staff"],
    description: "Get all staff in the database",
    summary: "Get all staff in the database",
  },
  addStaff: {
    tags: ["Staff"],
    description: "Add new Staff to the database",
    summary: "Adds new Staff to the database",
    params: {},
    body: {
      type: "object",
      //required: ['user_id', 'staff_no'],
      properties: staffProperties,
    },
    response: {
      200: {
        description: "New Staff",
        type: "object",
        properties: staffProperties,
      },
    },
  },
  getStaffById: {
    tags: ["Staff"],
    description: "Retrieve a staff from the database using the user id",
    summary: "Retrieve a staff from the database",
    params: { id: { type: "integer" } },
  },
  updateStaff: {
    tags: ["Staff"],
    description: "Updates a staff in the database",
    summary: "Updates a staff in the database",
    params: { id: { type: "integer" } },
    body: {
      type: "object",
      properties: staffProperties,
    },
  },
  deleteStaff: {
    tags: ["Staff"],
    description: "Deletes a staff from the database using the id",
    summary: "Deletes a staff from the database",
    params: { id: { type: "integer" } },
  },
};

module.exports = swagger;
