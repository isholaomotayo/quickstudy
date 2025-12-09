
const Bookshelf = require('../config/connection').Bookshelf;

const Semester = Bookshelf.Model.extend({
  tableName: 'semester',
  hasTimestamps: true,
  session() {
    return this.belongsTo('Session')
  } 
});

module.exports = Bookshelf.model('Semester', Semester);
