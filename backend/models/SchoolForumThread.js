/**
 * SchoolForumThread Model
 */
const Bookshelf = require("../config/connection").Bookshelf;

const SchoolForumThread = Bookshelf.Model.extend({
  tableName: "school_forum_thread",
  hasTimestamps: true,
  forumTopic() {
    return this.belongsTo("SchoolForumTopic");
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

module.exports = Bookshelf.model("SchoolForumThread", SchoolForumThread);
