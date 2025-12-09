//endpoints and routes for profile management
const profileController = require("../controllers/profileController");
const profileDoc = require("../documentation/profileDoc");

const routes = [
  {
    method: "GET",
    url: "/api/profile/:id",
    handler: profileController.getProfile,
    schema: profileDoc.getProfile
  },
  {
    method: "GET", 
    url: "/api/profile",
    handler: profileController.getProfile,
    schema: profileDoc.getProfile
  },
  {
    method: "PUT",
    url: "/api/profile/:id", 
    handler: profileController.updateProfile,
    schema: profileDoc.updateProfile
  },
  {
    method: "PUT",
    url: "/api/profile",
    handler: profileController.updateProfile,
    schema: profileDoc.updateProfile
  }
];

module.exports = routes;