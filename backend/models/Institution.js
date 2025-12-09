const bookshelf = require("../config/connection").Bookshelf;

const Institution = bookshelf.Model.extend({
  tableName: "institution",
  hasTimestamps: true,
  hidden: ["token"],

  faculties() {
    return this.hasMany("Faculty");
  },

  departments() {
    return this.hasMany("Department").through("Faculty");
  },

  users() {
    return this.hasMany("User");
  },
});

module.exports = bookshelf.model("Institution", Institution);
