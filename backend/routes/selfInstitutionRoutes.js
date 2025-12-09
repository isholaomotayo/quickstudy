const selfInstitutionController = require("../controllers/selfInstitutionController");
const selfInstitutionDoc = require("../documentation/selfInstitutionDoc");

const routes = [
  {
    method: "POST",
    url: "/api/selfInstitution/new",
    handler: selfInstitutionController.createInstitution,
    schema: selfInstitutionDoc.createInstitution,
  },
  {
    method: "PUT",
    url: "/api/selfInstitution/update",
    handler: selfInstitutionController.updateInstitution,
    schema: selfInstitutionDoc.updateInstitution,
  },
  {
    method: "POST",
    url: "/api/selfInstitution/newUser",
    handler: selfInstitutionController.addUser,
    schema: selfInstitutionDoc.addUser,
  },
  {
    method: "POST",
    url: "/api/selfInstitution/resendEmail",
    handler: selfInstitutionController.resendEmail,
    schema: selfInstitutionDoc.resendEMail,
  },
];

module.exports = routes;
