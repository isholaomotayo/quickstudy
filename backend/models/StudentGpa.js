// External Dependancies
const Bookshelf = require("../config/connection").Bookshelf;

const StudentGpa = Bookshelf.Model.extend({
  tableName: "student_gpa",
  hasTimestamps: true,
  student() {
    return this.belongsTo("Student");
  },
  level() {
    return this.belongsTo("Level");
  },
  semester() {
    return this.belongsTo("Semester");
  },
  classdegree() {
    return this.belongsTo("ClassDegree");
  },
});

module.exports = Bookshelf.model("StudentGpa", StudentGpa);
