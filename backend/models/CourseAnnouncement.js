/**
 * CourseForum Model
 */
const Bookshelf = require("../config/connection").Bookshelf;

const CourseAnnouncement = Bookshelf.Model.extend({
  tableName: "course_announcement",
  hasTimestamps: true,
  onlineClass() {
    return this.belongsTo("Course");
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

module.exports = Bookshelf.model("CourseAnnouncement", CourseAnnouncement);
