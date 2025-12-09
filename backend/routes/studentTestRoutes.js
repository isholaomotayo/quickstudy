const studentTestController = require("../controllers/studentTestController");
const studentTestDoc = require("../documentation/studentTestDoc");

const routes = [
  {
    method: "GET",
    url: "/api/studenttest",
    handler: studentTestController.list,
    schema: studentTestDoc.list,
  },
  {
    method: "GET",
    url: "/api/studenttest/new",
    handler: studentTestController.newStudentTestController,
    schema: studentTestDoc.newRoute,
  },
  {
    method: "POST",
    url: "/api/studenttest/start",
    handler: studentTestController.start,
    schema: studentTestDoc.start,
  },
  {
    method: "POST",
    url: "/api/studenttest/finish",
    handler: studentTestController.finish,
    schema: studentTestDoc.finish,
  },
  {
    method: "POST",
    url: "/api/studenttest/mark",
    handler: studentTestController.mark,
    schema: studentTestDoc.mark,
  },
  {
    method: "POST",
    url: "/api/studenttest/uploadresults",
    handler: studentTestController.uploadTestResults,
  },
  // {
  //   method: "POST",
  //   url: "/api/studenttest",
  //   handler: studentTestController.add,
  //   schema: studentTestDoc.add
  // },
  {
    method: "GET",
    url: "/api/studenttest/:id",
    handler: studentTestController.get,
    schema: studentTestDoc.get,
  },
];

module.exports = routes;
