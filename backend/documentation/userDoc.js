//endpoints and routes for all staff
const userProperties = {
  id: { type: "integer" },
  institution_id: { type: "integer" },
  username: { type: "string" },
  password: { type: "string" },
  first_name: { type: "string" },
  last_name: { type: "string" },
  other_name: { type: "string" },
  email: { type: "string" },
  phone: { type: "string" },
  active: { type: "integer" },
  admin: { type: "integer" },
  reset_code: { type: "string" },
  avatar: { type: "string" },
  personal_info: { type: "string" },
  registration_source: { type: "string" },
  enable_contact_me: { type: "integer" },
  role: { type: "string" },
  student: { type: "object" },
  staff: { type: "object" }
};

const staffProperties = {
  id: { type: "integer" },
  staff_no: { type: "string" },
  user_id: { type: "integer" },
  dept_id: { type: "integer" },
  address: { type: "string" },
  gender: { type: "string" },
  level: { type: "string" },
  designation: { type: "string" }
};

const studentProperties = {
  id: { type: "integer" },
  reg_no: { type: "string" },
  user_id: { type: "integer" },
  programme_id: { type: "integer" },
  semester_admitted_id: { type: "integer" },
  entry_level_id: { type: "integer" },
  address: { type: "string" },
  gender: { type: "string" },
  ref_fname: { type: "string" },
  ref_lname: { type: "string" },
  ref_phone: { type: "string" },
  ref_address: { type: "string" }
};
const swagger = {
  //endpoints for all users
  getUsers: {
    tags: ["User"],
    description: "Get all users in the database",
    summary: "Get all users in the database"
  },

  getApplicants: {
    tags: ["User"],
    description: "Get all users in the database",
    summary: "Get all users in the database"
  },
  getUserById: {
    tags: ["User"],
    description: "Retrieve a user from the database using the id",
    summary: "Retrieve a user from the database",
    params: { id: { type: "integer" } },
    response: {
      200: {
        type: "object",
        description: "A User",

        properties: {
          ...userProperties,
          ...studentProperties,
          ...staffProperties
        }
      }
    }
  },
  getUserByUsername: {
    tags: ["User"],
    description: "Retrieve a user from the database using the username",
    summary: "Retrieve a user from the database",
    params: { username: { type: "string" } },
    response: {
      200: {
        type: "object",
        description: "A User",

        properties: userProperties
      }
    }
  },
  checkUserWithUsernameExists: {
    tags: ["User"],
    description: "Check if user with the username exists",
    summary: "Return 1 if exists, else 0",
    params: { username: { type: "string" } },
    response: {
      200: {
        type: "integer"
      }
    }
  },
  addUser: {
    tags: ["User"],
    description: "Adds a new user to the database",
    summary: "Adds a new user to the database",
    params: {},
    body: {
      type: "object",
      required: [
        "username",
        "password",
        "first_name",
        "last_name",
        "email",
        "phone"
      ],
      properties: userProperties
    }
  },
  updateUser: {
    tags: ["User"],
    description: "Updates a user in the database",
    summary: "Updates a user in the database",
    params: { id: { type: "integer" } },
    body: {
      type: "object",
      properties: userProperties
    }
  },
  deleteUser: {
    tags: ["User"],
    description: "Deletes a user from the database using the id",
    summary: "Deletes a user from the database",
    params: { id: { type: "integer" } }
  },
  searchUser: {
    tags: ["User"],
    description: "Search for a user by email, username or role",
    summary: "Search for a user by email, username or role",
    query: { searchValue: { type: "string" } }
  }
};

module.exports = swagger;
