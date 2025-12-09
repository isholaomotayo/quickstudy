/**
 * Forum_category Model
 */
const Bookshelf = require("../config/connection").Bookshelf;

const SchoolForumCategory = Bookshelf.Model.extend({
  tableName: "school_forum_category",
  hasTimestamps: true,
  forumTopics() {
    return this.hasMany("SchoolForumTopic");
  },

  orderBy(column, order) {
    return this.query(qb => {
      qb.orderBy(column, order);
    });
  }
});

module.exports = Bookshelf.model("SchoolForumCategory", SchoolForumCategory);
