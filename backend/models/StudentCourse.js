// External Dependancies
const Bookshelf = require('../config/connection').Bookshelf;

const StudentCourse = Bookshelf.Model.extend({
  tableName: 'student_course',
  hasTimestamps: true,
  student() {
    return this.belongsTo('Student')
  },
  course() {
    return this.belongsTo('Course')
  },
  level() {
    return this.belongsTo('Level')
  },
  semester() {
    return this.belongsTo('Semester')
  },
  studentresults() {
    return this.hasMany('StudentResult')
}
});

module.exports = Bookshelf.model('StudentCourse', StudentCourse);
