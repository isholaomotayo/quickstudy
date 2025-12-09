const bookshelf = require('../config/connection').Bookshelf;

const Programme = bookshelf.Model.extend({
    tableName: 'programme',
    hasTimestamps: true,

    department() {
        return this.belongsTo('Department')
    },
    
    programme_courses() {
        return this.belongsToMany('Course').through('ProgrammeCourse')
    },
    
    courses() {
        return this.hasMany('Course')
    }
});

module.exports = bookshelf.model('Programme', Programme);
