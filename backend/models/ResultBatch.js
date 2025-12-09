// External Dependancies
const Bookshelf = require('../config/connection').Bookshelf;

const ResultBatch = Bookshelf.Model.extend({
  tableName: 'result_batch',
  hasTimestamps: true,
  course() {
    return this.belongsTo('Course')
  },
  semester() {
    return this.belongsTo('Semester')
  }
});

module.exports = Bookshelf.model('ResultBatch', ResultBatch);
