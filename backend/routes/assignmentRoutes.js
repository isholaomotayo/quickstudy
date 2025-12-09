const assignmentController = require("../controllers/assignmentController");

const routes = [
  {
    method: "GET",
    url: "/api/assignment/submissions",
    handler: assignmentController.getAssignmentSubmissions
  },
  {
    method: "POST",
    url: "/api/assignment/submit",
    handler: assignmentController.submitAssignment
  },
  {
    method: "PUT",
    url: "/api/assignment/grade/:submission_id",
    handler: assignmentController.gradeAssignment
  },
  {
    method: "GET",
    url: "/api/assignment/stats",
    handler: assignmentController.getAssignmentStats
  },
  {
    method: "POST",
    url: "/api/assignment/upload-files",
    handler: assignmentController.uploadAssignmentFiles
  }
];

module.exports = routes;
