
const Bookshelf = require('../config/connection').Bookshelf;

const Grade = Bookshelf.Model.extend({
  tableName: 'grade'
});

module.exports = Bookshelf.model('Grade', Grade);
