/**
 * CourseForum Model
 */
const Bookshelf = require("../config/connection").Bookshelf;

const Announcements = Bookshelf.Model.extend({
  tableName: "announcements",
  hasTimestamps: true,
  user() {
    return this.belongsTo("User");
  },
  reads() {
    return this.hasMany("AnnouncementRead", "announcement_id");
  },
  institution() {
    return this.belongsTo("Institution", "institution_id");
  }
});

module.exports = Bookshelf.model("Announcements", Announcements);
