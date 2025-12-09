const bookshelf = require("../config/connection").Bookshelf;

const PaymentAccount = bookshelf.Model.extend({
  tableName: "payment_account",
  hasTimestamps: true,
  hidden: ["secret_key", "test_secret_key"],

  institution() {
    return this.belongsTo("Institution");
  }
});

module.exports = bookshelf.model("PaymentAccount", PaymentAccount);
