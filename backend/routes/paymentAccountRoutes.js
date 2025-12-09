const PaymentAccountController = require("../controllers/paymentAccountController");

const PaymentAccountDocs = require("../documentation/PaymentAccountDoc");

const routes = [
  {
    method: "GET",
    url: "/api/paymentaccount/list",
    handler: PaymentAccountController.list,
    schema: PaymentAccountDocs.getPaymentAccounts
  },
  {
    method: "POST",
    url: "/api/paymentaccount",
    handler: PaymentAccountController.add,
    schema: PaymentAccountDocs.addPaymentAccount
  },
  {
    method: "GET",
    url: "/api/paymentaccount",
    handler: PaymentAccountController.get,
    schema: PaymentAccountDocs.getMyPaymentAccount
  },
  {
    method: "PUT",
    url: "/api/paymentaccount/:id",
    handler: PaymentAccountController.update,
    schema: PaymentAccountDocs.updatePaymentAccount
  },
  {
    method: "DELETE",
    url: "/api/paymentaccount/:id",
    handler: PaymentAccountController.delete,
    schema: PaymentAccountDocs.deletePaymentAccount
  }
];

module.exports = routes;
