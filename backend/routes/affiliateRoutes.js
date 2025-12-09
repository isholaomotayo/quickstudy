//endpoints and routes for all affiliate
const affiliateController = require("../controllers/affiliateController");
const affiliateDoc = require("../documentation/affiliateDoc");

const routes = [
  {
    method: "GET",
    url: "/api/affiliate",
    handler: affiliateController.getAffiliates,
    schema: affiliateDoc.getAffiliates
  },
  {
    method: "POST",
    url: "/api/affiliate",
    handler: affiliateController.addAffiliate,
    schema: affiliateDoc.addAffiliate
  },
  {
    method: "GET",
    url: "/api/affiliate/:id",
    handler: affiliateController.getAffiliateById,
    schema: affiliateDoc.getAffiliateById
  },
  {
    method: "GET",
    url: "/api/affiliate/dashboard",
    handler: affiliateController.dashboard,
    schema: affiliateDoc.getDashboard
  },
  {
    method: "PUT",
    url: "/api/affiliate/:id",
    handler: affiliateController.updateAffiliate,
    schema: affiliateDoc.updateAffiliate
  },
  {
    method: "DELETE",
    url: "/api/affiliate/:id",
    handler: affiliateController.deleteAffiliate,
    schema: affiliateDoc.deleteAffiliate
  },
  {
    method: "PUT",
    url: "/api/affiliate/confirmpayment",
    handler: affiliateController.confirmPayment,
    schema: affiliateDoc.confirmPayment
  },
  {
    method: "PUT",
    url: "/api/affiliate/unconfirmpayment",
    handler: affiliateController.unconfirmPayment,
    schema: affiliateDoc.unconfirmPayment
  }
];

module.exports = routes;
