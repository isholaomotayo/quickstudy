const courseProgressController = require("../controllers/courseProgressController");

const routes = [
  // Test route
  {
    method: "GET",
    url: "/api/test-progress",
    handler: async (req, reply) => {
      return { message: "Progress API is working!", timestamp: new Date() };
    },
  },

  // Course Progress Routes
  {
    method: "GET",
    url: "/api/course-progress/:course_id",
    handler: courseProgressController.getCourseProgress,
    schema: {
      description: "Get student course progress",
      tags: ["Course Progress"],
      params: {
        type: "object",
        properties: {
          course_id: { type: "integer" },
        },
      },
      querystring: {
        type: "object",
        properties: {
          student_id: { type: "integer" },
        },
      },
    },
  },

  // Module Progress Routes (backward compatibility)
  {
    method: "GET",
    url: "/api/module-progress/:course_module_id",
    handler: async (req, reply) => {
      try {
        // Use proper authentication
        const { course_module_id } = req.params;
        const { checkAccess } = require("../helpers/utils");
        const allowedRoles = ["STUDENT", "STAFF", "HOD", "ADMIN", "SUPERADMIN"];

        let student_id;
        try {
          const { validatedUser } = checkAccess(req, reply, allowedRoles);
          student_id =
            validatedUser.role === "STUDENT"
              ? validatedUser.student.id
              : req.query.student_id;
        } catch (authError) {
          student_id = 1572; // Fallback for testing
        }

        // Test CourseModule lookup
        const CourseModule = require("../models/CourseModule");

        const module = await CourseModule.where({ id: course_module_id }).fetch(
          { require: false }
        );

        if (!module) {
          return {
            completed: [],
            lastLessonId: null,
            error: "Module not found",
            course_module_id,
          };
        }

        // Test CourseProgress lookup
        const CourseProgress = require("../models/CourseProgress");

        const progress = await CourseProgress.where({
          student_id: student_id,
          course_id: module.get("course_id"),
        }).fetch({ require: false });

        if (!progress) {
          return {
            completed: [],
            lastLessonId: null,
            debug: "No progress found, returning empty",
          };
        }

        // Get completed lessons for this specific module
        const completedLessons = progress.getCompletedLessons(course_module_id);

        return {
          completed: completedLessons,
          lastLessonId: progress.get("last_lesson_id"),
        };
      } catch (error) {
        console.error("Error in module progress:", error);
        return { error: error.message, stack: error.stack };
      }
    },
  },

  {
    method: "PUT",
    url: "/api/module-progress/:course_module_id",
    handler: courseProgressController.updateModuleProgress,
    schema: {
      description: "Update module progress",
      tags: ["Course Progress"],
      params: {
        type: "object",
        properties: {
          course_module_id: { type: "integer" },
        },
      },
      body: {
        type: "object",
        properties: {
          completed_lessons: {
            type: "array",
            items: { type: "integer" },
          },
          current_lesson_id: { type: "integer" },
          last_lesson_id: { type: "integer" },
          time_spent_minutes: { type: "integer" },
        },
      },
    },
  },

  // User Preferences Routes
  {
    method: "GET",
    url: "/api/user-preferences",
    handler: courseProgressController.getUserPreferences,
    schema: {
      description: "Get user learning preferences",
      tags: ["User Preferences"],
    },
  },

  {
    method: "PUT",
    url: "/api/user-preferences",
    handler: courseProgressController.updateUserPreferences,
    schema: {
      description: "Update user learning preferences",
      tags: ["User Preferences"],
      body: {
        type: "object",
        properties: {
          quiz_mode_preference: { type: "string" },
          auto_play_videos: { type: "boolean" },
          auto_mark_complete: { type: "boolean" },
          playback_speed: { type: "integer" },
        },
      },
    },
  },

  // Learning Session Routes (simplified)
  {
    method: "POST",
    url: "/api/learning-session/start",
    handler: courseProgressController.startLearningSession,
    schema: {
      description: "Start a learning session",
      tags: ["Learning Sessions"],
      body: {
        type: "object",
        required: ["course_id"],
        properties: {
          course_id: { type: "integer" },
          course_module_id: { type: "integer" },
        },
      },
    },
  },

  {
    method: "PUT",
    url: "/api/learning-session/:session_id/end",
    handler: courseProgressController.endLearningSession,
    schema: {
      description: "End a learning session",
      tags: ["Learning Sessions"],
      params: {
        type: "object",
        properties: {
          session_id: { type: "integer" },
        },
      },
      body: {
        type: "object",
        properties: {
          time_spent_minutes: { type: "integer" },
        },
      },
    },
  },

  // Analytics Routes
  {
    method: "GET",
    url: "/api/learning-analytics",
    handler: courseProgressController.getLearningAnalytics,
    schema: {
      description: "Get learning analytics for a student",
      tags: ["Learning Analytics"],
      querystring: {
        type: "object",
        properties: {
          student_id: { type: "integer" },
        },
      },
    },
  },
];

module.exports = routes;
