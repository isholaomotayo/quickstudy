const authController = require("../controllers/authController");
const authDoc = require("../documentation/authDoc");

const routes = [
  {
    method: "POST",
    url: "/api/login",
    handler: authController.login,
    schema: authDoc.login
  },
  {
    method: "POST",
    url: "/api/codelogin",
    handler: authController.codeLogin,
    schema: authDoc.codeLogin
  },
  {
    method: "GET",
    url: "/api/verify",
    handler: authController.verify,
    schema: authDoc.verify
  },
  {
    method: "POST",
    url: "/api/changePassword/:id",
    handler: authController.changePassword,
    schema: authDoc.changePassword
  },
  {
    method: "POST",
    url: "/api/startPasswordReset",
    handler: authController.startPasswordReset,
    schema: authDoc.startPasswordReset
  },
  {
    method: "POST",
    url: "/api/resetPassword",
    handler: authController.resetPassword,
    schema: authDoc.resetPassword
  }
];

module.exports = routes;
