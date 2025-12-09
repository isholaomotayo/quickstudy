// External Dependancies
const Bookshelf = require("../config/connection").Bookshelf;

const FeeStudent = Bookshelf.Model.extend({
  tableName: "fee_student",
  hasTimestamps: true,

  student() {
    return this.belongsTo("Student");
  },

  semester() {
    return this.belongsTo("Semester");
  },

  feestudentpaymentfreq() {
    return this.hasMany("FeeStudentPaymentFrequency");
  },
  user() {
    return this.belongsTo("User").through("Student");
  }
});

module.exports = Bookshelf.model("FeeStudent", FeeStudent);
