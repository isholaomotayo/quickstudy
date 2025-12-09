const bookshelf = require('../config/connection').Bookshelf;

const CourseLesson = bookshelf.Model.extend({
    tableName: 'course_lesson',
    hasTimestamps: true,

    course_module() {
        return this.belongsTo('CourseModule')
    },
    
    course_tests() {
        return this.hasMany('CourseTest')
    }
})

module.exports = bookshelf.model('CourseLesson', CourseLesson)
