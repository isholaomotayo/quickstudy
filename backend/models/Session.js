
const Bookshelf = require('../config/connection').Bookshelf;

const Session = Bookshelf.Model.extend({
  tableName: 'session',

  semesters() {
    return this.hasMany('Semester')
}
});

module.exports = Bookshelf.model('Session', Session);
