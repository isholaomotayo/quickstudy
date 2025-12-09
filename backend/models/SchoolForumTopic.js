/**
 * Forumtopic Model
 */
const Bookshelf = require("../config/connection").Bookshelf;

const User = require("./User");

const SchoolForumTopic = Bookshelf.Model.extend({
  tableName: "school_forum_topic",
  forumCategory() {
    return this.belongsTo("SchoolForumCategory");
  },
  thread() {
    return this.hasMany("SchoolForumThread");
  },

  user() {
    return this.belongsTo(User);
  },
  hasTimestamps: true,
  orderBy(column, order) {
    return this.query(qb => {
      qb.orderBy(column, order);
    });
  }
});

module.exports = Bookshelf.model("SchoolForumTopic", SchoolForumTopic);
