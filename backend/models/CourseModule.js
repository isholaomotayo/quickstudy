const bookshelf = require('../config/connection').Bookshelf;

const CourseModule = bookshelf.Model.extend({
    tableName: 'course_module',
    hasTimestamps: true,

    course() {
        return this.belongsTo('Course')
    },
    
    course_lessons() {
        return this.hasMany('CourseLesson')
    }
});

module.exports = bookshelf.model('CourseModule', CourseModule);
