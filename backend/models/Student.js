// External Dependancies
const Bookshelf = require('../config/connection').Bookshelf;

const Student = Bookshelf.Model.extend({
  tableName: 'student',
  hasTimestamps: true,
  user() {
    return this.belongsTo('User');
  },
  programme() {
    return this.belongsTo('Programme');
  },
  semester() {
    return this.belongsTo('Semester', 'semester_admitted_id');
  },
  fees() {
    return this.hasMany('FeeStudent');
  },
  session() {
    return this.belongsTo('Session', 'session_admitted_id');
  },
  payments() {
    return this.hasMany('Payment');
  }
});

module.exports = Bookshelf.model('Student', Student);
