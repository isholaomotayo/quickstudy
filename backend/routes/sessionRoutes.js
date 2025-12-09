//endpoints and routes for all sessions
const sessionController = require("../controllers/sessionController");
const sessionDoc = require("../documentation/sessionDoc");

const routes = [
  {
    method: "GET",
    url: "/api/session",
    handler: sessionController.getSessions,
    schema: sessionDoc.getSessions,
  },
  {
    method: "GET",
    url: "/api/session/current",
    handler: sessionController.getCurrentSession,
  },
  {
    method: "POST",
    url: "/api/session",
    handler: sessionController.addSession,
    schema: sessionDoc.addSession,
  },
  {
    method: "GET",
    url: "/api/session/:id",
    handler: sessionController.getSessionById,
    schema: sessionDoc.getSessionById,
  },
  {
    method: "PUT",
    url: "/api/session/:id",
    handler: sessionController.updateSession,
    schema: sessionDoc.updateSession,
  },
  {
    method: "DELETE",
    url: "/api/session/:id",
    handler: sessionController.deleteSession,
    schema: sessionDoc.deleteSession,
  },
];

module.exports = routes;
