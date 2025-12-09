//endpoints and routes for all affiliate
const affiliateProperties = {
  id: { type: "integer" },
  user_id: { type: "integer" },
  bank: { type: "string" },
  account_no: { type: "string" }
};

const swagger = {
  getAffiliates: {
    tags: ["Affiliate"],
    description: "Get all affiliates in the database",
    summary: "Get all affiliates in the database"
  },
  addAffiliate: {
    tags: ["Affiliate"],
    description: "Add new Affiliate to the database",
    summary: "Adds new Affiliate to the database",
    params: {},
    body: {},
    response: {
      200: {
        description: "New Affiliate",
        type: "object",
        properties: affiliateProperties
      }
    }
  },
  getAffiliateById: {
    tags: ["Affiliate"],
    description: "Retrieve an affiliate from the database using the id",
    summary: "Retrieve an affiliate from the database",
    params: { id: { type: "integer" } }
  },
  updateAffiliate: {
    tags: ["Affiliate"],
    description: "Updates an affiliate in the database",
    summary: "Updates an affiliate in the database",
    params: { id: { type: "integer" } },
    body: {
      type: "object",
      properties: affiliateProperties
    }
  },
  deleteAffiliate: {
    tags: ["Affiliate"],
    description: "Deletes an affiliate from the database using the id",
    summary: "Deletes an affiliate from the database",
    params: { id: { type: "integer" } }
  },
  getDashboard: {
    tags: ["Affiliate"],
    description: "Retrieve dashboard information",
    summary: "Retrieve dashboard information",
    query: { username: { type: "string" }, id: { type: "integer" } }
  },
  confirmPayment: {
    tags: ["Affiliate"],
    description: "Confirm affiliate referral payment",
    summary: "Confirm affiliate referral payment",
    body: {
      type: "object",
      description: "A confirmation value",
      properties: {
        affiliate_id: { type: "integer" },
        referral_id: { type: "integer" }
      }
    }
  },
  unconfirmPayment: {
    tags: ["Affiliate"],
    description: "Do not Confirm affiliate referral payment",
    summary: "Do not Confirm affiliate referral payment",
    body: {
      type: "object",
      description: "A confirmation value",
      properties: {
        affiliate_id: { type: "integer" },
        referral_id: { type: "integer" }
      }
    }
  }
};

module.exports = swagger;
