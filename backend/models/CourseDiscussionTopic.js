/**
 * CourseForum Model
 */
const Bookshelf = require("../config/connection").Bookshelf;

const CourseDiscussionTopic = Bookshelf.Model.extend({
  tableName: "course_discussion_topic",
  hasTimestamps: true,
  course() {
    return this.belongsTo("Course");
  },
  comment() {
    return this.hasMany("CourseDiscussionComment");
  },
  user() {
    return this.belongsTo("User");
  },
  orderBy(column, order) {
    return this.query(qb => {
      qb.orderBy(column, order);
    });
  }
});

module.exports = Bookshelf.model(
  "CourseDiscussionTopic",
  CourseDiscussionTopic
);
