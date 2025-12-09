const courseTestController = require("../controllers/courseTestController");
const courseTestDoc = require("../documentation/courseTestDoc");

const routes = [
  {
    method: "GET",
    url: "/api/coursetest",
    handler: courseTestController.list,
    schema: courseTestDoc.list,
  },
  {
    method: "GET",
    url: "/api/coursetest/:id",
    handler: courseTestController.get,
    schema: courseTestDoc.get,
  },
  {
    method: "POST",
    url: "/api/coursetest",
    handler: courseTestController.add,
    schema: courseTestDoc.add,
  },
  {
    method: "POST",
    url: "/api/coursetest/bulk-assignment",
    handler: courseTestController.createBulkAssignment,
    schema: courseTestDoc.createBulkAssignment,
  },
  {
    method: "PUT",
    url: "/api/coursetest/:id",
    handler: courseTestController.update,
    schema: courseTestDoc.update,
  },
  {
    method: "DELETE",
    url: "/api/coursetest/:id",
    handler: courseTestController.delete,
    schema: courseTestDoc.delete,
  },
];

module.exports = routes;
