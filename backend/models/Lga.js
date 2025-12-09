
const Bookshelf = require('../config/connection').Bookshelf;

const Lga = Bookshelf.Model.extend({
  tableName: 'lga',
  state() {
    return this.belongsTo('State')
  } 
});

module.exports = Bookshelf.model('Lga', Lga);
