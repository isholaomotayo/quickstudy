const bookshelf = require('../config/connection').Bookshelf;

const Course = bookshelf.Model.extend({
    tableName: 'course',
    hasTimestamps: true,

    programmes() {
        return this.belongsToMany('Programme').through('ProgrammeCourse')
    },
    
    course_modules() {
        return this.hasMany('CourseModule')
    },
    course_tests() {
        return this.hasMany('CourseTest')
    },
    level() {
        return this.belongsTo('Level')
    },
    department() {
        return this.belongsTo('Department');
    },
    
});

module.exports = bookshelf.model('Course', Course);
