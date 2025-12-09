//endpoints and routes for all studentresult
const studentResultController = require("../controllers/studentResultController");
const studentResultDoc = require("../documentation/studentResultDoc");

const routes = [
  {
    method: "GET",
    url: "/api/studentresult",
    handler: studentResultController.getStudentResults,
    schema: studentResultDoc.getStudentResults,
  },
  {
    method: "POST",
    url: "/api/studentresult",
    handler: studentResultController.addStudentResult,
  },
  {
    method: "GET",
    url: "/api/studentresult/:student_id",
    handler: studentResultController.getStudentResultByStudentId,
    schema: studentResultDoc.getStudentResultByStudentId,
  },
  {
    method: "PUT",
    url: "/api/studentresult/:id",
    handler: studentResultController.updateStudentResult,
    schema: studentResultDoc.updateStudentResult,
  },
  {
    method: "DELETE",
    url: "/api/studentresult/:id",
    handler: studentResultController.deleteStudentResult,
    schema: studentResultDoc.deleteStudentResult,
  },
  {
    method: "GET",
    url: "/api/studentresult/template/:course_id",
    handler: studentResultController.generateResultTemplate,
  },
];

module.exports = routes;
