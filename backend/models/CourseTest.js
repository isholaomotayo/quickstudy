const bookshelf = require('../config/connection').Bookshelf;

const CourseTest = bookshelf.Model.extend({
    tableName: 'course_test',
    hasTimestamps: true,

    lesson() {
        return this.belongsTo('course_lesson')
    },

    course_module() {
        return this.belongsTo('CourseModule').through('CourseLesson')
    },
    
    department() {
        return this.belongsTo('Department').through('Course')
    },
    
    course_questions() {
        return this.hasMany('CourseQuestion')
    },

    student_tests() {
        return this.hasMany('StudentTest')
    }
});

module.exports = bookshelf.model('CourseTest', CourseTest);
