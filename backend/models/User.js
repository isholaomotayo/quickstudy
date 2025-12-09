//const knex = require('../config/connection').knex;

//const Bookshelf = require('bookshelf')(knex);
const Bookshelf = require("../config/connection").Bookshelf;

const User = Bookshelf.Model.extend({
  tableName: "user",
  hasTimestamps: true,
  hidden: ["password"],

  institution() {
    return this.belongsTo("Institution");
  },

  staff() {
    return this.hasOne("Staff");
  },

  student() {
    return this.hasOne("Student");
  },

  affiliate() {
    return this.hasOne("Affiliate");
  }
});

module.exports = Bookshelf.model("User", User);
