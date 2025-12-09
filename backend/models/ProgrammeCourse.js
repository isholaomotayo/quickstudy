// External Dependancies
const Bookshelf = require('../config/connection').Bookshelf;

const ProgrammeCourse = Bookshelf.Model.extend({
  tableName: 'programme_course',
  hasTimestamps: true,

  programme() {
    return this.belongsTo('Programme')
  },

  course() {
    return this.belongsTo('Course')
  },
  
  level() {
    return this.belongsTo('Level')
  }
});

module.exports = Bookshelf.model('ProgrammeCourse', ProgrammeCourse);
