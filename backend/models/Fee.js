const Bookshelf = require('../config/connection').Bookshelf;

const Fee = Bookshelf.Model.extend({
  tableName: 'fee',

  session() {
    return this.belongsTo('Session');
  }
});

module.exports = Bookshelf.model('Fee', Fee);
