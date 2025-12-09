//endpoints and routes for all student
const studentProperties = {
  id: { type: "integer" },
  reg_no: { type: "string" },
  user_id: { type: "integer" },
  programme_id: { type: "integer" },
  semester_admitted_id: { type: "integer" },
  session_admitted_id: { type: "integer" },
  entry_level_id: { type: "integer" },
  admission_status: { type: "string" },
  address: { type: "string" },
  gender: { type: "string" },
  ref_fname: { type: "string" },
  ref_lname: { type: "string" },
  ref_phone: { type: "string" },
  ref_address: { type: "string" },

  admitted: { type: "boolean" }
};

const swagger = {
  getAllDeferredStudents: {
    tags: ["Deferred Students"],
    description: "Get all Deferred Students in the database",
    summary: "Get all Deferred Students in the database"
  },
  getDeferedStudentById: {
    tags: ["Deferred Students"],
    description:
      "Retrieve a Deferred Student from the database using the user id",
    summary: "Retrieve a Deferred Student from the database",
    params: { id: { type: "integer" } }
  },
  deferStudent: {
    tags: ["Deferred Students"],
    description: "Updates a student Admission Status",
    summary: "Updates a student Admission Status",
    params: { id: { type: "integer" } },
    body: {
      type: "object",
      properties: studentProperties
    }
  },
  resumeStudent: {
    tags: ["Resume Student"],
    description: "Resume a student Admission Status",
    summary: "Resume a student Admission Status",
    params: { id: { type: "integer" } },
    body: {
      type: "object",
      properties: studentProperties
    }
  }
};

module.exports = swagger;
