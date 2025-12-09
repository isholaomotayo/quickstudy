//endpoints and routes for all student
const supportController = require("../controllers/supportController");
const supportDoc = require("../documentation/supportDocs");

const routes = [
  {
    method: "POST",
    url: "/api/support",
    handler: supportController.supportController,
    schema: supportDoc.supportDoc,
  },
];

module.exports = routes;
