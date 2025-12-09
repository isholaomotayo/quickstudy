const Bookshelf = require("../config/connection").Bookshelf;

const CourseMeeting = Bookshelf.model("CourseMeeting", {
  tableName: "course_meetings",
  hasTimestamps: true,

  // Relationships
  course: function() {
    return this.belongsTo("Course", "course_id");
  },

  // Parse JSON data
  parse: function(attrs) {
    if (attrs.meeting_data && typeof attrs.meeting_data === 'string') {
      try {
        attrs.meeting_data = JSON.parse(attrs.meeting_data);
      } catch (e) {
        attrs.meeting_data = null;
      }
    }
    return attrs;
  },

  // Format for database
  format: function(attrs) {
    if (attrs.meeting_data && typeof attrs.meeting_data === 'object') {
      attrs.meeting_data = JSON.stringify(attrs.meeting_data);
    }
    return attrs;
  },

  // Instance methods
  isExpired: function() {
    if (!this.get('expires_at')) return false;
    return new Date() > new Date(this.get('expires_at'));
  },

  isActive: function() {
    return this.get('is_active') && !this.isExpired();
  }
}, {
  // Class methods
  findActiveByCourse: function(courseId) {
    return this.where({
      course_id: courseId,
      is_active: true
    })
    .where('expires_at', '>', new Date())
    .orWhereNull('expires_at')
    .fetchAll();
  },

  findByProvider: function(courseId, provider) {
    return this.where({
      course_id: courseId,
      meeting_provider: provider,
      is_active: true
    }).fetch();
  }
});

module.exports = CourseMeeting;