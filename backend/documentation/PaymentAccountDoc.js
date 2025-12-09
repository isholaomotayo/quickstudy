//endpoints and routes for all fee student
const paymentAccountProperties = {
  institution_id: { type: "integer" },
  merchant_id: { type: "integer" },
  terminal_id: { type: "integer" },
  sk: { type: "string" },
  pk: { type: "string" },
  tsk: { type: "string" },
  tpk: { type: "string" }
};

const swagger = {
  getPaymentAccounts: {
    tags: ["Payment Account"],
    description: "Get institution payment account details",
    summary: "Get institution payment account details"
  },
  getMyPaymentAccount: {
    tags: ["Payment Account"],
    description: "Get institution payment account details",
    summary: "Get institution payment account details"
  },
  addPaymentAccount: {
    tags: ["Payment Account"],
    description: "Add new Institution Payment Account",
    summary: "Adds new Institution Payment Account",
    params: {},
    body: {
      type: "object",
      required: ["institution_id", "sk", "pk", "tsk", "tpk"],
      properties: paymentAccountProperties
    }
  },
  updatePaymentAccount: {
    tags: ["Payment Account"],
    description: "Updates an institution's payment account details",
    summary: "Updates an institution's payment details",
    params: { id: { type: "integer" } },
    body: {
      type: "object",
      properties: paymentAccountProperties
    }
  },
  deletePaymentAccount: {
    tags: ["Payment Account"],
    description: "Deletes an institution's payment details",
    summary: "Deletes an institution's payment details",
    params: { id: { type: "integer" } }
  }
};

module.exports = swagger;
