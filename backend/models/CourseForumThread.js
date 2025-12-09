/**
 * CourseForumThread Model
 */
const Bookshelf = require("../config/connection").Bookshelf;
const User = require("./User");

const CourseForumThread = Bookshelf.Model.extend({
  tableName: "course_forum_thread",
  hasTimestamps: true,
  user() {
    return this.belongsTo(User);
  },
  topic() {
    return this.belongsTo("CourseForumTopic");
  },
  orderBy(column, order) {
    return this.query(qb => {
      qb.orderBy(column, order);
    });
  }
});

module.exports = Bookshelf.model("CourseForumThread", CourseForumThread);
