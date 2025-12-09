const bookshelf = require("../config/connection").Bookshelf;

const StudentTest = bookshelf.Model.extend({
  tableName: "student_test",
  hasTimestamps: true,

  // Parse JSON fields when reading from database
  parse: function (attrs) {
    if (attrs.questions_answers && typeof attrs.questions_answers === "string") {
      attrs.questions_answers = JSON.parse(attrs.questions_answers);
    }
    if (attrs.feedback && typeof attrs.feedback === "string") {
      attrs.feedback = JSON.parse(attrs.feedback);
    }
    return attrs;
  },

  // Stringify JSON fields when saving to database
  format: function (attrs) {
    if (attrs.questions_answers && typeof attrs.questions_answers === "object") {
      attrs.questions_answers = JSON.stringify(attrs.questions_answers);
    }
    if (attrs.feedback && typeof attrs.feedback === "object") {
      attrs.feedback = JSON.stringify(attrs.feedback);
    }
    return attrs;
  },

  user() {
    return this.belongsTo("User");
  },

  course_test() {
    return this.belongsTo("CourseTest");
  },

  marked_by() {
    return this.belongsTo("User");
  },
});

module.exports = bookshelf.model("StudentTest", StudentTest);
