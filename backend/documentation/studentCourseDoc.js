//endpoints and routes for all studentcourse
const studentcourseProperties = {
  id: { type: "integer" },
  student_id: { type: "integer" },
  course_id: { type: "integer" },
  semester_id: { type: "integer" },
  level_id: { type: "integer" },
  units: { type: "integer" },

  course_ids: {
    type: "array",
    items: { type: "integer" }
  }
};

const swagger = {
  getStudentCourses: {
    tags: ["Student-Course"],
    description: "Get all studentcourse in the database",
    summary: "Get all studentcourse in the database"
  },
  addStudentCourse: {
    tags: ["Student-Course"],
    description: "Add new Studentcourse to the database",
    summary: "Adds new Studentcourse to the database",
    params: {},
    body: {
      type: "object",
      required: ["student_id", "course_id", "semester_id"],
      properties: studentcourseProperties
    }
  },
  getStudentCourseById: {
    tags: ["Student-Course"],
    description: "Retrieve a studentcourse from the database using the id",
    summary: "Retrieve a Studentcourse from the database",
    params: { id: { type: "integer" } }
  },
  updateStudentCourse: {
    tags: ["Student-Course"],
    description: "Updates a studentcourse in the database",
    summary: "Updates a studentcourse in the database",
    params: { id: { type: "integer" } },
    body: {
      type: "object",
      properties: studentcourseProperties
    }
  },
  deleteStudentCourse: {
    tags: ["Student-Course"],
    description: "Deletes a studentcourse from the database using the id",
    summary: "Deletes a studentcourse from the database",
    params: { id: { type: "integer" } }
  },
  getStudentCourseByStudentId: {
    tags: ["Student-Course"],
    description:
      "Retrieve studentcourses from the database using the student id",
    summary: "Retrieve studentcourses from the database",
    params: { student_id: { type: "integer" } }
  },
  getStudentCourseBySearchParams: {
    tags: ["Student-Course"],
    description:
      "Retrieve Studentcourses from the database using the search params",
    summary: "Retrieve Studentcourses from the database",
    query: {
      type: "object",
      properties: studentcourseProperties
    }
  },
  bulkAddStudentCourse: {
    tags: ["Student-Course"],
    description: "Bulk add new Studentcourse to the database",
    summary: "Bulk Adds new Studentcourse to the database",
    params: {},
    body: {
      type: "array",
      required: ["student_id", "course_id", "semester_id"],
      items: { properties: studentcourseProperties }
    }
  }
};

module.exports = swagger;
