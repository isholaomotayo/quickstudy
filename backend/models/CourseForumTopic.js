/**
 * CourseForum Model
 */
const Bookshelf = require("../config/connection").Bookshelf;

const CourseForumTopic = Bookshelf.Model.extend({
  tableName: "course_forum_topic",
  hasTimestamps: true,
  onlineClass() {
    return this.belongsTo("Course");
  },
  thread() {
    return this.hasMany("CourseForumThread");
  },
  user() {
    return this.belongsTo("User");
  },
  course() {
    return this.belongsTo("Course");
  },
  orderBy(column, order) {
    return this.query((qb) => {
      qb.orderBy(column, order);
    });
  },
});

module.exports = Bookshelf.model("CourseForumTopic", CourseForumTopic);
