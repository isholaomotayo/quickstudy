const bookshelf = require('../config/connection').Bookshelf;

const CourseQuestion = bookshelf.Model.extend({
    tableName: 'course_question',
    hasTimestamps: true,

    course_test() {
        return this.belongsTo('CourseTest')
    }
});

module.exports = bookshelf.model('CourseQuestion', CourseQuestion);
