const payment2Controller = require("../controllers/payment2Controller");
const payment2Doc = require("../documentation/payment2Doc");

const routes = [
  {
    method: "GET",
    url: "/api/payment2",
    handler: payment2Controller.list,
    schema: payment2Doc.list,
  },
  {
    method: "GET",
    url: "/api/payment2/payables",
    handler: payment2Controller.listPayables,
    schema: payment2Doc.listPayables,
  },
  {
    method: "POST",
    url: "/api/payment2/reconcile-all",
    handler: payment2Controller.reconcileAll,
    schema: {
      description: "Reconcile all payments",
      summary: "Reconcile all payments",
      tags: ["payment2"],
      body: {
        type: "object",
        additionalProperties: false,
      },
      response: {
        200: {
          description: "Reconciliation result",
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            summary: {
              type: "object",
              properties: {
                processedStudents: { type: "number" },
                reconciledPayments: { type: "number" },
                errors: { type: "number" },
                totalStudentsFound: { type: "number" },
                limitApplied: { type: "boolean" },
                errorDetails: {
                  type: "array",
                  items: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  },
  {
    method: "GET",
    url: "/api/payment2/:id",
    handler: payment2Controller.get,
    schema: payment2Doc.get,
  },
  {
    method: "POST",
    url: "/api/payment2",
    handler: payment2Controller.add,
    schema: payment2Doc.add,
  },
  // {
  //   method: 'GET',
  //   url: '/api/payment2/loadregnos',
  //   handler: payment2Controller.loadRegNos
  // },
  // {
  //   method: 'POST',
  //   url: '/api/payment2/confirm',
  //   handler: payment2Controller.confirm,
  //   schema: payment2Doc.confirm
  // },
  // {
  //   method: 'PUT',
  //   url: '/api/payment2/:id',
  //   handler: payment2Controller.update,
  //   schema: payment2Doc.update
  // },
  // {
  //   method: 'DELETE',
  //   url: '/api/payment2/:id',
  //   handler: payment2Controller.delete,
  //   schema: payment2Doc.delete
  // }
];

module.exports = routes;
