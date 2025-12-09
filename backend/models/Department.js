const bookshelf = require('../config/connection').Bookshelf;

const Department = bookshelf.Model.extend({
    tableName: 'department',
    hasTimestamps: true,

    faculty() {
        return this.belongsTo('Faculty')
    },
    
    programmes() {
        return this.hasMany('Programme')
    },

    courses() {
        return this.hasMany('Course').through('Programme')
    }
});

module.exports = bookshelf.model('Department', Department);
