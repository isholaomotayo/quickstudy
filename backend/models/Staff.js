// External Dependancies
const Bookshelf = require("../config/connection").Bookshelf;

const Staff = Bookshelf.Model.extend({
  tableName: "staff",
  hasTimestamps: true,
  user() {
    return this.belongsTo("User");
  },
  department() {
    return this.belongsTo("Department", "department_id");
  },
});

module.exports = Bookshelf.model("Staff", Staff);
