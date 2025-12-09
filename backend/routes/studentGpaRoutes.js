//endpoints and routes for all studentgpa
const studentGpaController = require("../controllers/studentGpaController");

const studentGpaDoc = require("../documentation/studentGpaDoc");

const routes = [
  {
    method: "GET",
    url: "/api/studentgpa",
    handler: studentGpaController.getStudentGpas,
    schema: studentGpaDoc.getStudentGpas,
  },
  {
    method: "POST",
    url: "/api/studentgpa",
    handler: studentGpaController.addStudentGpa,
    schema: studentGpaDoc.addStudentGpa,
  },
  {
    method: "GET",
    url: "/api/studentgpa/:id",
    handler: studentGpaController.getStudentGpaById,
    schema: studentGpaDoc.getStudentGpaById,
  },
  {
    method: "GET",
    url: "/api/studentgpa/studentid/:student_id",
    handler: studentGpaController.getStudentGpaByStudentId,
    schema: studentGpaDoc.getStudentGpaByStudentId,
  },
  {
    method: "GET",
    url: "/api/studentgpa/search",
    handler: studentGpaController.getStudentGpasBySearchParams,
    schema: studentGpaDoc.getStudentGpasBySearchParams,
  },
  {
    method: "PUT",
    url: "/api/studentgpa/:id",
    handler: studentGpaController.updateStudentGpa,
    schema: studentGpaDoc.updateStudentGpa,
  },
  {
    method: "DELETE",
    url: "/api/studentgpa/:id",
    handler: studentGpaController.deleteStudentGpa,
    schema: studentGpaDoc.deleteStudentGpa,
  },
  {
    method: "POST",
    url: "/api/studentgpa/calculate",
    handler: studentGpaController.calculateStudentGpa,
  },
  {
    method: "POST",
    url: "/api/studentgpa/calculate-batch",
    handler: studentGpaController.calculateBatchGpa,
  },
  {
    method: "POST",
    url: "/api/studentgpa/batch",
    handler: studentGpaController.calculateBatchGpa,
    schema: {
      body: {
        type: "object",
        required: ["student_ids", "semester_id", "level_id"],
        properties: {
          student_ids: { type: "array", items: { type: "integer" } },
          semester_id: { type: "integer" },
          level_id: { type: "integer" },
        },
      },
    },
  },
];

module.exports = routes;
