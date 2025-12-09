/**
 * CourseDiscussionComment Model
 */
const Bookshelf = require("../config/connection").Bookshelf;
const User = require("./User");

const CourseDiscussionComment = Bookshelf.Model.extend({
  tableName: "course_discussion_comment",
  hasTimestamps: true,
  user() {
    return this.belongsTo(User);
  },
  topic() {
    return this.belongsTo("CourseDiscussionTopic");
  },
  orderBy(column, order) {
    return this.query(qb => {
      qb.orderBy(column, order);
    });
  }
});

module.exports = Bookshelf.model(
  "CourseDiscussionComment",
  CourseDiscussionComment
);
