const institutionController = require("../controllers/institutionController");
const institutionDoc = require("../documentation/institutionDoc");

const routes = [
  {
    method: "GET",
    url: "/api/institution",
    handler: institutionController.list,
    schema: institutionDoc.list,
  },
  {
    method: "GET",
    url: "/api/institution/:id",
    handler: institutionController.get,
    schema: institutionDoc.get,
  },
  {
    method: "POST",
    url: "/api/institution",
    handler: institutionController.add,
    schema: institutionDoc.add,
  },
  {
    method: "PUT",
    url: "/api/institution/:id",
    handler: institutionController.update,
    schema: institutionDoc.update,
  },
  {
    method: "DELETE",
    url: "/api/institution/:id",
    handler: institutionController.delete,
    schema: institutionDoc.delete,
  },
  {
    method: "POST",
    url: "/api/institution/params",
    handler: institutionController.getInstitutionByParams,
    schema: institutionDoc.getInstitutionByParams,
  },
  {
    method: "POST",
    url: "/api/calendar/structure",
    handler: institutionController.structureCalendar,
  },
];

module.exports = routes;
