// External Dependancies
const Bookshelf = require('../config/connection').Bookshelf;

const StudentResult = Bookshelf.Model.extend({
  tableName: 'student_result',
  hasTimestamps: true,
  studentcourse() {
    return this.belongsTo('StudentCourse')
  },
  grade() {
    return this.belongsTo('Grade')
  }  
});

module.exports = Bookshelf.model('StudentResult', StudentResult);
