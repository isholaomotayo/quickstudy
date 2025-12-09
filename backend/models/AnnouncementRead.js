/**
 * AnnouncementRead Model
 */
const Bookshelf = require("../config/connection").Bookshelf;

const AnnouncementRead = Bookshelf.Model.extend({
  tableName: "announcement_reads",
  hasTimestamps: true,
  
  announcement() {
    return this.belongsTo("Announcements", "announcement_id");
  },
  
  user() {
    return this.belongsTo("User", "user_id");
  },
  
  institution() {
    return this.belongsTo("Institution", "institution_id");
  }
});

module.exports = Bookshelf.model("AnnouncementRead", AnnouncementRead);