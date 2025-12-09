//endpoints and routes for all staff
const userController = require("../controllers/userController");
const userDoc = require("../documentation/userDoc");

const routes = [
  {
    method: "GET",
    url: "/api/user",
    handler: userController.getUsers,
    schema: userDoc.getUsers
  },
  {
    method: "GET",
    url: "/api/user/:id",
    handler: userController.getUserById,
    schema: userDoc.getUserById
  },
  {
    method: "GET",
    url: "/api/user/username/:username",
    handler: userController.getUserByUsername,
    schema: userDoc.getUserByUsername
  },
  {
    method: "GET",
    url: "/api/user/check/username/:username",
    handler: userController.checkUserWithUsernameExists,
    schema: userDoc.checkUserWithUsernameExists
  },
  {
    method: "POST",
    url: "/api/user",
    handler: userController.addUser,
    schema: userDoc.addUser
  },
  {
    method: "PUT",
    url: "/api/user/:id",
    handler: userController.updateUser,
    schema: userDoc.updateUser
  },
  {
    method: "DELETE",
    url: "/api/user/:id",
    handler: userController.deleteUser,
    schema: userDoc.deleteUser
  },

  {
    method: "GET",
    url: "/api/user/applicant",
    handler: userController.getApplicants,
    schema: userDoc.getApplicants
  },
  {
    method: "GET",
    url: "/api/user/search",
    handler: userController.searchUser,
    schema: userDoc.searchUser
  }
];

module.exports = routes;
