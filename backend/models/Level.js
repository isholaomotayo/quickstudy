const bookshelf = require('../config/connection').Bookshelf;

const Level = bookshelf.Model.extend({
    tableName: 'level'
});

module.exports = bookshelf.model('Level', Level);
