//endpoints and routes for all student
const studentProperties = {
  id: { type: "integer" },
  reg_no: { type: "string" },
  user_id: { type: "integer" },
  programme_id: { type: "integer" },
  semester_admitted_id: { type: "integer" },
  session_admitted_id: { type: "integer" },
  entry_level_id: { type: "integer" },
  address: { type: "string" },
  gender: { type: "string" },
  ref_fname: { type: "string" },
  ref_lname: { type: "string" },
  ref_phone: { type: "string" },
  ref_address: { type: "string" },

  admitted: { type: "boolean" }
};

const rejectApplicantProperties = {
  user_id: { type: "integer" },
  reason: { type: "string" }
};

const swagger = {
  getStudents: {
    tags: ["Student"],
    description: "Get all student in the database",
    summary: "Get all student in the database"
  },
  addStudent: {
    tags: ["Student"],
    description: "Add new Student to the database",
    summary: "Adds new Student to the database",
    params: {},
    body: {
      type: "object",
      required: ["user_id"],
      properties: studentProperties
    },
    response: {
      200: {
        description: "New Student",
        type: "object",
        properties: studentProperties
      }
    }
  },
  getStudentById: {
    tags: ["Student"],
    description: "Retrieve a student from the database using the id",
    summary: "Retrieve a student from the database",
    params: { id: { type: "integer" } }
  },

  getStudentByUserId: {
    tags: ["Student"],
    description: "Retrieve a student from the database using the id",
    summary: "Retrieve a student from the database",
    params: { user_id: { type: "integer" } }
  },
  updateStudent: {
    tags: ["Student"],
    description: "Updates a student in the database",
    summary: "Updates a student in the database",
    params: { id: { type: "integer" } },
    body: {
      type: "object",
      properties: studentProperties
    }
  },
  deleteStudent: {
    tags: ["Student"],
    description: "Deletes a student from the database using the id",
    summary: "Deletes a student from the database",
    params: { id: { type: "integer" } }
  },
  rejectApplicant: {
    tags: ["Student"],
    description: "Reject an applicant from the platform",
    summary: "Reject an applicant",
    params: { id: { type: "integer" } },
    body: {
      type: "object",
      properties: rejectApplicantProperties
    }
  },
  getStudentDashboard: {
    tags: ["Student"],
    description: `Get a student's dashboard items`,
    summary: [`Get a student's dashboard items`]
  },
  searchStudent: {
    tags: ["Student"],
    description: "Search for a student by username, email or reg_no",
    summary: "Search for a student by username, email or reg_no",
    query: { searchValue: { type: "string" } }
  },
  calculateStudentLevel: {
    tags: ["Student"],
    description: "Calculate a student's current level using centralized logic",
    summary: "Calculate student current level",
    query: {
      student_id: { type: "integer" },
      semester_admitted_id: { type: "integer" },
      entry_level_id: { type: "integer" }
    },
    response: {
      200: {
        description: "Level calculation result",
        type: "object",
        properties: {
          levelId: { type: "integer", description: "Current level ID" },
          levelDisplay: { type: "integer", description: "Level display format (100, 200, etc.)" },
          currentSemesterId: { type: "integer", description: "Current semester ID" },
          semesterName: { type: "string", description: "Current semester name" },
          error: { type: "string", description: "Error message if any" }
        }
      }
    }
  }
};

module.exports = swagger;
