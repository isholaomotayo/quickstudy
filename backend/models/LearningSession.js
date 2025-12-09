const Bookshelf = require("../config/connection").Bookshelf;

const LearningSession = Bookshelf.Model.extend({
  tableName: "learning_sessions",
  hasTimestamps: true,

  // Relationships
  student() {
    return this.belongsTo("Student", "student_id");
  },

  course() {
    return this.belongsTo("Course", "course_id");
  },

  course_module() {
    return this.belongsTo("CourseModule", "course_module_id");
  },

  course_lesson() {
    return this.belongsTo("CourseLesson", "course_lesson_id");
  },

  institution() {
    return this.belongsTo("Institution", "institution_id");
  },

  // Virtual attributes
  virtuals: {
    is_active() {
      return !this.get("session_end");
    },

    session_duration_hours() {
      const minutes = this.get("duration_minutes");
      return minutes ? Math.round((minutes / 60) * 100) / 100 : 0;
    },

    productivity_score() {
      const duration = this.get("duration_minutes");
      const lessonsCompleted = this.get("lessons_completed");
      const lessonsVisited = this.get("lessons_visited");

      if (duration === 0) return 0;

      // Simple productivity scoring
      let score = 0;
      if (lessonsCompleted > 0) score += lessonsCompleted * 10;
      if (lessonsVisited > lessonsCompleted)
        score += (lessonsVisited - lessonsCompleted) * 2;

      // Normalize by time spent (lessons per hour)
      const hoursSpent = duration / 60;
      return hoursSpent > 0 ? Math.round(score / hoursSpent) : score;
    },
  },

  // Instance methods
  isActive() {
    return !this.get("session_end");
  },

  getDurationMinutes() {
    if (this.get("session_end")) {
      return this.get("duration_minutes");
    }

    // Calculate current duration for active session
    const start = new Date(this.get("session_start"));
    const now = new Date();
    return Math.round((now - start) / (1000 * 60));
  },

  endSession(activities = []) {
    const sessionEnd = new Date();
    const sessionStart = new Date(this.get("session_start"));
    const durationMinutes = Math.round(
      (sessionEnd - sessionStart) / (1000 * 60)
    );

    this.set({
      session_end: sessionEnd,
      duration_minutes: durationMinutes,
      activities: JSON.stringify(activities),
    });

    return this.save();
  },

  addActivity(activity) {
    const currentActivities = JSON.parse(this.get("activities") || "[]");
    currentActivities.push({
      ...activity,
      timestamp: new Date(),
    });

    this.set("activities", JSON.stringify(currentActivities));
    return this.save();
  },

  getActivities() {
    return JSON.parse(this.get("activities") || "[]");
  },
});

module.exports = LearningSession;
