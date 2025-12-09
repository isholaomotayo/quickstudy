const studentDoc = require("../documentation/studentDoc");
const rejectApplicantController = require("../controllers/rejectApplicantController");

const routes = [
  {
    method: "POST",
    url: "/api/reject/:id",
    handler: rejectApplicantController.rejectApplicant,
    schema: studentDoc.rejectApplicant
  }
];

module.exports = routes;
