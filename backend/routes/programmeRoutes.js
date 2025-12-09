const programmeController = require("../controllers/programmeController");
const programmeDoc = require("../documentation/programmeDoc");

const routes = [
  {
    method: "GET",
    url: "/api/programme",
    handler: programmeController.list,
    schema: programmeDoc.list
  },
  {
    method: "GET",
    url: "/api/programme/:id",
    handler: programmeController.get,
    schema: programmeDoc.get
  },
  {
    method: "POST",
    url: "/api/programme",
    handler: programmeController.add,
    schema: programmeDoc.add
  },
  {
    method: "PUT",
    url: "/api/programme/:id",
    handler: programmeController.update,
    schema: programmeDoc.update
  },
  {
    method: "DELETE",
    url: "/api/programme/:id",
    handler: programmeController.delete,
    schema: programmeDoc.delete
  }
];

module.exports = routes;
