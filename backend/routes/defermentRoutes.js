//endpoints and routes for all staff
const defer = require("../controllers/defermentController");
const deferDoc = require("../documentation/DefermentDocs");

const routes = [
  {
    method: "GET",
    url: "/api/deferment",
    handler: defer.getAllDeferredStudents,
    schema: deferDoc.getAllDeferredStudents
  },
  {
    method: "GET",
    url: "/api/deferment/:id",
    handler: defer.getDeferedStudentById,
    schema: deferDoc.getDeferedStudentById
  },
  {
    method: "PUT",
    url: "/api/deferment/deferProcessByStudent/:id",
    handler: defer.deferProcessByStudent,
    schema: deferDoc.deferStudent
  },
  {
    method: "PUT",
    url: "/api/deferment/deferProcessByAdmin/:id",
    handler: defer.deferProcessByAdmin,
    schema: deferDoc.deferStudent
  }
];

module.exports = routes;
