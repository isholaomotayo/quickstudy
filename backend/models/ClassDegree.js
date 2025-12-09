// External Dependancies
const Bookshelf = require('../config/connection').Bookshelf;

const ClassDegree = Bookshelf.Model.extend({
  tableName: 'class_degree',
  hasTimestamps: false
});

module.exports = Bookshelf.model('ClassDegree', ClassDegree);
