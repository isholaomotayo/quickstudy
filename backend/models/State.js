
const Bookshelf = require('../config/connection').Bookshelf;

const State = Bookshelf.Model.extend({
  tableName: 'state',
  country() {
    return this.belongsTo('Country')
  } 
});

module.exports = Bookshelf.model('State', State);
