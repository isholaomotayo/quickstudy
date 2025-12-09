const bookshelf = require('../config/connection').Bookshelf;

const Faculty = bookshelf.Model.extend({
    tableName: 'faculty',
    hasTimestamps: true,

    institution() {
        return this.belongsTo('Institution')
    },
    
    departments() {
        return this.hasMany('Department')
    }
});

module.exports = bookshelf.model('Faculty', Faculty);
