// External Dependancies
const Bookshelf = require('../config/connection').Bookshelf;

const StaffCourse = Bookshelf.Model.extend({
  tableName: 'staff_course',
  hasTimestamps: true,
  staff() {
    return this.belongsTo('Staff');
  },
  course() {
    return this.belongsTo('Course');
  }
});

module.exports = Bookshelf.model('StaffCourse', StaffCourse);
