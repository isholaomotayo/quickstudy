
const Bookshelf = require('../config/connection').Bookshelf;

const Title = Bookshelf.Model.extend({
  tableName: 'title'
});

module.exports = Bookshelf.model('Title', Title);
