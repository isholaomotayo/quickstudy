//endpoints and routes for all student
const studentController = require("../controllers/studentController");
const studentDoc = require("../documentation/studentDoc");

const routes = [
  {
    method: "GET",
    url: "/api/student",
    handler: studentController.getStudents,
    schema: studentDoc.getStudents,
  },
  {
    method: "POST",
    url: "/api/student",
    handler: studentController.addStudent,
    schema: studentDoc.addStudent,
  },
  {
    method: "GET",
    url: "/api/student/:id",
    handler: studentController.getStudentById,
    schema: studentDoc.getStudentById,
  },
  {
    method: "GET",
    url: "/api/student/userid/:user_id",
    handler: studentController.getStudentByUserId,
    schema: studentDoc.getStudentByUserId,
  },
  {
    method: "GET",
    url: "/api/student/userid/:user_id/minimal",
    handler: studentController.getStudentByUserIdMinimal,
    schema: studentDoc.getStudentByUserId,
  },
  {
    method: "PUT",
    url: "/api/student/:id",
    handler: studentController.updateStudent,
    schema: studentDoc.updateStudent,
  },
  {
    method: "DELETE",
    url: "/api/student/:id",
    handler: studentController.deleteStudent,
    schema: studentDoc.deleteStudent,
  },
  {
    method: "GET",
    url: "/api/student/dashboard",
    handler: studentController.getStudentDashboard,
    schema: studentDoc.getStudentDashboard,
  },
  {
    method: "GET",
    url: "/api/student/search",
    handler: studentController.searchStudent,
    schema: studentDoc.searchStudent,
  },
  {
    method: "GET",
    url: "/api/student/level/calculate",
    handler: studentController.calculateStudentLevel,
    schema: studentDoc.calculateStudentLevel,
  },
];

module.exports = routes;
