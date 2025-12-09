// External Dependancies
const Bookshelf = require("../config/connection").Bookshelf;

const Affiliate = Bookshelf.Model.extend({
  tableName: "affiliate",
  hasTimestamps: true,
  hidden: ["affiliate_paid"],
  user() {
    return this.belongsTo("User");
  }
});

module.exports = Bookshelf.model("Affiliate", Affiliate);
