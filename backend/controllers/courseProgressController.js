const boom = require("boom");
const { checkAccess, checkPaymentCurrent } = require("../helpers/utils");
const CourseProgress = require("../models/CourseProgress");
const LearningSession = require("../models/LearningSession");

// Get student's course progress
exports.getCourseProgress = async (req, reply) => {
  const allowedRoles = ["STUDENT", "STAFF", "HOD", "ADMIN", "SUPERADMIN"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);
  await checkPaymentCurrent(reply, validatedUser);

  const { course_id } = req.params;
  const student_id =
    validatedUser.role === "STUDENT"
      ? validatedUser.student.id
      : req.query.student_id;

  if (!student_id) {
    throw boom.badRequest("Student ID is required");
  }

  try {
    const progress = await CourseProgress.findOrCreate(
      student_id,
      course_id,
      validatedUser.institution_id
    );

    return progress;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get module progress (for backward compatibility with localStorage format)
exports.getModuleProgress = async (req, reply) => {
  const allowedRoles = ["STUDENT", "STAFF", "HOD", "ADMIN", "SUPERADMIN"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);
  await checkPaymentCurrent(reply, validatedUser);

  const { course_module_id } = req.params;
  const student_id =
    validatedUser.role === "STUDENT"
      ? validatedUser.student.id
      : req.query.student_id;

  try {
    console.log("Getting module progress for:", {
      student_id,
      course_module_id,
    });

    // First, let's try to find the course module
    const CourseModule = require("../models/CourseModule");
    console.log("CourseModule model loaded:", !!CourseModule);

    const module = await CourseModule.where({ id: course_module_id }).fetch();
    console.log(
      "Module found:",
      !!module,
      module ? module.get("course_id") : "none"
    );

    if (!module) {
      return { completed: [], lastLessonId: null, error: "Module not found" };
    }

    // Try to find existing progress
    const progress = await CourseProgress.where({
      student_id: student_id,
      course_id: module.get("course_id"),
    }).fetch();

    console.log("Progress found:", !!progress);

    if (!progress) {
      return { completed: [], lastLessonId: null };
    }

    const completedLessons = progress.getCompletedLessons(course_module_id);
    const lastLessonId = progress.get("last_lesson_id");

    return {
      completed: completedLessons,
      lastLessonId: lastLessonId,
    };
  } catch (err) {
    console.error("Error in getModuleProgress:", err);
    throw boom.boomify(err);
  }
};

// Update module progress
exports.updateModuleProgress = async (req, reply) => {
  const allowedRoles = ["STUDENT"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  const { course_module_id } = req.params;
  const student_id = validatedUser.student.id;
  const {
    completed_lessons = [],
    current_lesson_id,
    last_lesson_id,
    time_spent_minutes = 0,
  } = req.body;

  // Validate integer values to prevent out-of-range errors
  const MAX_INT = 2147483647; // PostgreSQL integer max value
  const validateIntegerField = (value, fieldName) => {
    if (value !== null && value !== undefined) {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue > MAX_INT || numValue < -2147483648) {
        throw boom.badRequest(
          `${fieldName} value ${value} is out of range for integer field (max: ${MAX_INT})`
        );
      }
      return numValue;
    }
    return null;
  };

  // Validate all integer fields
  const validatedCurrentLessonId = validateIntegerField(
    current_lesson_id,
    "current_lesson_id"
  );
  const validatedLastLessonId = validateIntegerField(
    last_lesson_id,
    "last_lesson_id"
  );
  const validatedTimeSpent = validateIntegerField(
    time_spent_minutes,
    "time_spent_minutes"
  );

  // Validate completed_lessons array
  const validatedCompletedLessons = completed_lessons.map((lessonId, index) => {
    return validateIntegerField(lessonId, `completed_lessons[${index}]`);
  });

  try {
    // Get course ID from module
    const CourseModule = require("../models/CourseModule");
    const module = await CourseModule.where({ id: course_module_id }).fetch();

    if (!module) {
      throw boom.notFound("Course module not found");
    }

    const course_id = module.get("course_id");

    // Get or create progress record
    const progress = await CourseProgress.findOrCreate(
      student_id,
      course_id,
      validatedUser.institution_id
    );

    // Update module progress
    await progress.updateModuleProgress(
      course_module_id,
      validatedCompletedLessons,
      validatedCurrentLessonId || validatedLastLessonId
    );

    // Add time spent
    if (validatedTimeSpent > 0) {
      progress.addTimeSpent(validatedTimeSpent);
    }

    // Start session (increment session count)
    progress.startSession();

    await progress.save();

    return progress;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get user preferences
exports.getUserPreferences = async (req, reply) => {
  const allowedRoles = ["STUDENT", "STAFF", "HOD", "ADMIN", "SUPERADMIN"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  try {
    // Get any course progress record for this user to access preferences
    const progress = await CourseProgress.where({
      student_id: validatedUser.student?.id || validatedUser.id,
    }).fetch();

    if (!progress) {
      // Return default preferences
      return {
        quiz_mode_preference: "standard",
        auto_play_videos: true,
        auto_mark_complete: false,
        playback_speed: 100,
      };
    }

    return progress.getUserPreferences();
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update user preferences
exports.updateUserPreferences = async (req, reply) => {
  const allowedRoles = ["STUDENT", "STAFF", "HOD", "ADMIN", "SUPERADMIN"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  try {
    // Get any course progress record for this user
    const progress = await CourseProgress.where({
      student_id: validatedUser.student?.id || validatedUser.id,
    }).fetch();

    if (!progress) {
      throw boom.notFound("No progress record found to update preferences");
    }

    // Update preferences
    const currentPreferences = progress.getUserPreferences();
    const updatedPreferences = { ...currentPreferences, ...req.body };

    progress.setUserPreferences(updatedPreferences);
    await progress.save();

    return progress.getUserPreferences();
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Start a learning session (simplified)
exports.startLearningSession = async (req, reply) => {
  const allowedRoles = ["STUDENT"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  const { course_id, course_module_id } = req.body;

  try {
    // Update progress session count
    const progress = await CourseProgress.findOrCreate(
      validatedUser.student.id,
      course_id,
      validatedUser.institution_id
    );

    progress.startSession();
    await progress.save();

    // Optionally create detailed session record
    const session = await LearningSession.forge({
      student_id: validatedUser.student.id,
      course_id,
      session_start: new Date(),
      session_data: JSON.stringify({
        course_module_id,
        user_agent: req.headers["user-agent"],
        ip_address: req.ip,
      }),
    }).save();

    return { session_id: session.id, progress };
  } catch (err) {
    throw boom.boomify(err);
  }
};

// End a learning session
exports.endLearningSession = async (req, reply) => {
  const allowedRoles = ["STUDENT"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  const { session_id } = req.params;
  const { time_spent_minutes = 0 } = req.body;

  try {
    const session = await LearningSession.where({
      id: session_id,
      student_id: validatedUser.student.id,
    }).fetch();

    if (session) {
      await session.endSession();
    }

    // Add time to course progress
    if (time_spent_minutes > 0) {
      const sessionData = JSON.parse(session.get("session_data") || "{}");
      const courseId = session.get("course_id");

      const progress = await CourseProgress.where({
        student_id: validatedUser.student.id,
        course_id: courseId,
      }).fetch();

      if (progress) {
        progress.addTimeSpent(time_spent_minutes);
        await progress.save();
      }
    }

    return { success: true };
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get learning analytics
exports.getLearningAnalytics = async (req, reply) => {
  const allowedRoles = ["STUDENT", "STAFF", "HOD", "ADMIN", "SUPERADMIN"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  const student_id =
    validatedUser.role === "STUDENT"
      ? validatedUser.student.id
      : req.query.student_id;

  try {
    // Get all course progress for the student
    const courseProgresses = await CourseProgress.where({
      student_id,
    }).fetchAll({
      withRelated: ["course"],
    });

    // Calculate analytics
    const totalCourses = courseProgresses.length;
    const completedCourses = courseProgresses.filter(
      (cp) => cp.get("status") === "completed"
    ).length;

    const inProgressCourses = courseProgresses.filter(
      (cp) => cp.get("status") === "in_progress"
    ).length;

    const totalTimeSpent = courseProgresses.reduce(
      (sum, cp) => sum + (cp.get("total_time_minutes") || 0),
      0
    );

    const averageCompletion =
      totalCourses > 0
        ? courseProgresses.reduce(
            (sum, cp) => sum + (cp.get("completion_percentage") || 0),
            0
          ) / totalCourses
        : 0;

    return {
      course_progresses: courseProgresses,
      analytics_summary: {
        total_courses: totalCourses,
        completed_courses: completedCourses,
        in_progress_courses: inProgressCourses,
        total_time_spent_minutes: totalTimeSpent,
        total_time_spent_hours: Math.round((totalTimeSpent / 60) * 100) / 100,
        average_completion_percentage:
          Math.round(averageCompletion * 100) / 100,
      },
    };
  } catch (err) {
    throw boom.boomify(err);
  }
};
