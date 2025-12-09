
const Bookshelf = require('../config/connection').Bookshelf;

const Country = Bookshelf.Model.extend({
  tableName: 'country'
});

module.exports = Bookshelf.model('Country', Country);
