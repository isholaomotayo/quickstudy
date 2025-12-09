const Bookshelf = require("../config/connection").Bookshelf;

const CourseProgress = Bookshelf.Model.extend({
  tableName: "course_progress",
  hasTimestamps: true,

  // Relationships
  student() {
    return this.belongsTo("Student", "student_id");
  },

  course() {
    return this.belongsTo("Course", "course_id");
  },

  current_module() {
    return this.belongsTo("CourseModule", "course_module_id");
  },

  current_lesson() {
    return this.belongsTo("CourseLesson", "current_lesson_id");
  },

  last_lesson() {
    return this.belongsTo("CourseLesson", "last_lesson_id");
  },

  institution() {
    return this.belongsTo("Institution", "institution_id");
  },

  // Virtual attributes
  virtuals: {
    is_completed() {
      return this.get("status") === "completed";
    },

    is_in_progress() {
      return this.get("status") === "in_progress";
    },

    progress_percentage() {
      return this.get("completion_percentage") || 0;
    },

    time_spent_hours() {
      const minutes = this.get("total_time_minutes");
      return minutes ? Math.round((minutes / 60) * 100) / 100 : 0;
    },
  },

  // Instance methods
  getProgressData() {
    try {
      const rawData = this.get("progress_data") || {};

      // If it's already an object (PostgreSQL JSON column returns parsed object)
      if (typeof rawData === "object" && rawData !== null) {
        return rawData;
      }

      // If it's a string, parse it (for other database types or stored strings)
      if (typeof rawData === "string") {
        return JSON.parse(rawData);
      }

      return {};
    } catch (error) {
      console.error("Error handling progress_data:", error);
      return {};
    }
  },

  setProgressData(data) {
    this.set("progress_data", JSON.stringify(data));
    return this;
  },

  getUserPreferences() {
    try {
      return JSON.parse(this.get("user_preferences") || "{}");
    } catch {
      return {};
    }
  },

  setUserPreferences(preferences) {
    this.set("user_preferences", JSON.stringify(preferences));
    return this;
  },

  // Get completed lessons for a specific module
  getCompletedLessons(moduleId = null) {
    const progressData = this.getProgressData();
    const moduleKey = moduleId ? `module_${moduleId}` : "all_modules";
    return progressData[moduleKey]?.completed_lessons || [];
  },

  // Set completed lessons for a specific module
  setCompletedLessons(moduleId, completedLessonIds) {
    const progressData = this.getProgressData();
    const moduleKey = `module_${moduleId}`;

    if (!progressData[moduleKey]) {
      progressData[moduleKey] = {};
    }

    progressData[moduleKey].completed_lessons = completedLessonIds;
    progressData[moduleKey].last_updated = new Date().toISOString();

    this.setProgressData(progressData);
    return this;
  },

  // Update progress for a specific module
  async updateModuleProgress(
    moduleId,
    completedLessonIds,
    currentLessonId = null
  ) {
    // Get total lessons for this module
    const CourseLesson = require("./CourseLesson");
    const totalLessons = await CourseLesson.where({
      course_module_id: moduleId,
    }).count();

    // Update module-specific progress
    this.setCompletedLessons(moduleId, completedLessonIds);

    // Update current position
    if (currentLessonId) {
      this.set({
        course_module_id: moduleId,
        current_lesson_id: currentLessonId,
        last_lesson_id: currentLessonId,
      });
    }

    // Calculate overall course progress
    await this.calculateOverallProgress();

    // Update status
    this.updateStatus();

    // Update timestamps
    this.set("last_accessed_at", new Date());

    if (this.get("status") === "not_started") {
      this.set("started_at", new Date());
    }

    return this.save();
  },

  // Calculate overall course progress across all modules
  async calculateOverallProgress() {
    const CourseModule = require("./CourseModule");
    const CourseLesson = require("./CourseLesson");

    // Get all modules for this course
    const modules = await CourseModule.where({
      course_id: this.get("course_id"),
    }).fetchAll();

    let totalLessons = 0;
    let completedLessons = 0;

    for (const module of modules.models) {
      const moduleId = module.get("id");

      // Try counting lessons with fallback approaches
      let safeLessonCount = 0;

      try {
        // Primary approach: Use Bookshelf count
        const moduleLessonsCount = await CourseLesson.where({
          course_module_id: moduleId,
        }).count();

        // Convert to integer safely
        const parsedCount = parseInt(moduleLessonsCount);

        // Validate the count is reasonable
        if (isNaN(parsedCount) || parsedCount > 10000 || parsedCount < 0) {
          throw new Error(`Invalid count: ${moduleLessonsCount}`);
        }

        safeLessonCount = parsedCount;
      } catch (error) {
        try {
          // Fallback approach: Use raw SQL query
          const { knex } = require("../config/connection");
          const result = await knex("course_lesson")
            .where("course_module_id", moduleId)
            .count("id as count")
            .first();

          safeLessonCount = parseInt(result?.count) || 0;

          if (safeLessonCount > 10000 || safeLessonCount < 0) {
            safeLessonCount = 0;
          }
        } catch (fallbackError) {
          safeLessonCount = 0;
        }
      }

      const moduleCompletedLessons = this.getCompletedLessons(moduleId);
      totalLessons += safeLessonCount;
      completedLessons += moduleCompletedLessons.length;
    }

    // Additional safety check
    if (totalLessons > 2147483647 || completedLessons > 2147483647) {
      totalLessons = 0;
      completedLessons = 0;
    }

    const completionPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    this.set({
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      completion_percentage: completionPercentage,
    });

    return this;
  },

  // Update status based on progress
  updateStatus() {
    const percentage = this.get("completion_percentage");
    const completedLessons = this.get("completed_lessons");

    let status = "not_started";

    if (percentage === 100) {
      status = "completed";
      if (!this.get("completed_at")) {
        this.set("completed_at", new Date());
      }
    } else if (completedLessons > 0 || this.get("current_lesson_id")) {
      status = "in_progress";
    }

    this.set("status", status);
    return this;
  },

  // Add time spent
  addTimeSpent(minutes) {
    const currentTime = this.get("total_time_minutes") || 0;
    this.set("total_time_minutes", currentTime + minutes);
    return this;
  },

  // Start a new session
  startSession() {
    const sessionCount = this.get("session_count") || 0;
    this.set({
      session_count: sessionCount + 1,
      last_accessed_at: new Date(),
    });

    if (this.get("status") === "not_started") {
      this.set("started_at", new Date());
    }

    return this;
  },

  // Get user preference
  getUserPreference(key, defaultValue = null) {
    const preferences = this.getUserPreferences();
    return preferences[key] !== undefined ? preferences[key] : defaultValue;
  },

  // Set user preference
  setUserPreference(key, value) {
    const preferences = this.getUserPreferences();
    preferences[key] = value;
    this.setUserPreferences(preferences);
    return this;
  },
});

// Static methods
CourseProgress.findOrCreate = async function (
  studentId,
  courseId,
  institutionId
) {
  let progress = await CourseProgress.where({
    student_id: studentId,
    course_id: courseId,
  }).fetch({ require: false });

  if (!progress) {
    progress = await CourseProgress.forge({
      student_id: studentId,
      course_id: courseId,
      institution_id: institutionId,
      status: "not_started",
      progress_data: "{}",
      user_preferences: JSON.stringify({
        quiz_mode_preference: "standard",
        auto_play_videos: true,
        auto_mark_complete: false,
        playback_speed: 100,
      }),
    }).save();
  }

  return progress;
};

CourseProgress.getProgressInLocalStorageFormat = async function (
  studentId,
  moduleId
) {
  const CourseModule = require("./CourseModule");
  const module = await CourseModule.where({ id: moduleId }).fetch();

  if (!module) return null;

  const progress = await CourseProgress.where({
    student_id: studentId,
    course_id: module.get("course_id"),
  }).fetch();

  if (!progress) return null;

  const completedLessons = progress.getCompletedLessons(moduleId);
  const lastLessonId = progress.get("last_lesson_id");

  return {
    completed: completedLessons,
    lastLessonId: lastLessonId,
  };
};

module.exports = CourseProgress;
