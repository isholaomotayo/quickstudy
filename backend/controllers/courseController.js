const boom = require("boom");
const Course = require("../models/Course");
const StudentCourse = require("../models/StudentCourse");
const StaffCourse = require("../models/StaffCourse");
const Semester = require("../models/Semester");
const Institution = require("../models/Institution");
const {
  checkAccess,
  checkPaymentCurrent,
  setPaginationHeaders,
  setUnpublishedError,
} = require("../helpers/utils");

// Get all Courses
exports.list = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  await checkPaymentCurrent(reply, validatedUser);

  let query = Course.forge().orderBy("code", "desc"),
    withRelated = [],
    courses = [],
    preFetched = false;

  if (validatedUser.role == "STUDENT") {
    const thisSemester = await Semester.where({
      institution_id: validatedUser.institution_id,
      is_active: true,
    }).fetch({ require: false });

    if (thisSemester) {
      query = StudentCourse.forge().orderBy("id", "desc").where({
        student_id: +validatedUser.student.id,
        // semester_id: +thisSemester.id
        // approval_status: true
      });

      withRelated = ["course"];
    } else throw boom.internal("No current semester.");
  } else if (validatedUser.role == "STAFF") {
    query = StaffCourse.forge()
      .orderBy("id", "desc")
      .where("staff_id", +validatedUser.staff.id);
    withRelated = ["course"];
  } else if (validatedUser.role == "HOD") {
    query.where("department_id", +validatedUser.staff.department_id);
  } else if (validatedUser.role == "ADMIN") {
    preFetched = true;
    courses = await exports.getInstitutionCourses(validatedUser.institution_id);

    //console.log('>>>>>>>admin courses>>>>>>>>>', courses)
  } else if (validatedUser.role == "SUPERADMIN") {
    // Don't filter
  } else {
    // Incase we add a new role and forget to filter ;)
    throw boom.boomify("Improper access");
  }

  const { pgsize = 100, pg = 1, search, ...req_query } = req.query;

  // Handle search parameter for course name or code
  if (search && !preFetched) {
    query.where(function () {
      this.where("name", "ILIKE", `%${search}%`).orWhere(
        "code",
        "ILIKE",
        `%${search}%`
      );
    });
  }

  if (filterKey && filterValue) query.where(filterKey, filterValue);
  else if (req_query) query.where(req_query);

  try {
    if (!preFetched)
      courses = await query.fetchPage({
        pageSize: pgsize,
        page: pg,
        withRelated,
      });

    if (withRelated.length) {
      courses = courses.map((course) => {
        return course.relations[withRelated];
      });
    }

    if (courses.pagination) setPaginationHeaders(reply, courses.pagination);

    if (courses.models) courses = courses.models;
    if (validatedUser.role == "STUDENT")
      courses = courses.filter((course) => course.attributes.published);

    // Add progress data for students
    if (validatedUser.role == "STUDENT") {
      const CourseProgress = require("../models/CourseProgress");

      // Get all course progress for this student
      const courseProgresses = await CourseProgress.where({
        student_id: validatedUser.student.id,
      }).fetchAll({ required: false });

      // Create a map of course progress by course_id
      const progressMap = {};
      courseProgresses.forEach((progress) => {
        progressMap[progress.get("course_id")] = {
          completion_percentage: progress.get("completion_percentage") || 0,
          total_lessons: progress.get("total_lessons") || 0,
          completed_lessons: progress.get("completed_lessons") || 0,
          status: progress.get("status"),
          total_time_minutes: progress.get("total_time_minutes") || 0,
          last_accessed_at: progress.get("last_accessed_at"),
        };
      });

      // Add progress data to each course
      courses = courses.map((course) => {
        const courseId = course.attributes ? course.attributes.id : course.id;
        const progress = progressMap[courseId] || {
          completion_percentage: 0,
          total_lessons: 0,
          completed_lessons: 0,
          status: "not_started",
          total_time_minutes: 0,
          last_accessed_at: null,
        };

        // If course is a Bookshelf model, convert to JSON first
        const courseData = course.toJSON ? course.toJSON() : course;

        return {
          ...courseData,
          // Add progress fields
          completion_percentage: progress.completion_percentage,
          total_lessons: progress.total_lessons,
          completed_lessons: progress.completed_lessons,
          // Student enrollment data
          student_enrolled: progress.status !== "not_started",
          student_completed: progress.status === "completed",
          has_result: progress.status === "completed", // You may need to adjust this based on your result system
          enrollment_status:
            progress.status === "completed"
              ? "completed"
              : progress.status === "not_started"
              ? "not_enrolled"
              : "enrolled",
        };
      });
    }

    return courses;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.get = async (req, reply) => {
  //const learningPath = 'course_modules.course_lessons.course_tests.course_questions'
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  await checkPaymentCurrent(reply, validatedUser);

  try {
    const course = await Course.where("id", req.params.id).fetch({
      withRelated: [
        "level",
        "department",
        "course_modules.course_lessons.course_tests",
        {
          "course_modules.course_lessons": (query) => {
            query.orderBy("order", "ASC");
          },
        },
        req.query.relatedString || "course_modules",
      ],
    });

    if (
      validatedUser.role == "STUDENT" &&
      course &&
      course.attributes &&
      !course.attributes.published
    ) {
      setUnpublishedError(reply);
      return;
    }

    // Add progress data for students
    if (validatedUser.role == "STUDENT" && course) {
      const CourseProgress = require("../models/CourseProgress");

      // Get course progress for this student
      const courseProgress = await CourseProgress.where({
        student_id: validatedUser.student.id,
        course_id: req.params.id,
      }).fetch({ require: false });

      let courseData = course.toJSON ? course.toJSON() : course;

      if (courseProgress) {
        // Get overall progress data
        const progressData = courseProgress.getProgressData();

        // Add overall course progress
        courseData.completion_percentage =
          courseProgress.get("completion_percentage") || 0;
        courseData.total_lessons = courseProgress.get("total_lessons") || 0;
        courseData.completed_lessons =
          courseProgress.get("completed_lessons") || 0;
        courseData.student_enrolled =
          courseProgress.get("status") !== "not_started";
        courseData.student_completed =
          courseProgress.get("status") === "completed";
        courseData.has_result = courseProgress.get("status") === "completed";
        courseData.enrollment_status =
          courseProgress.get("status") === "completed"
            ? "completed"
            : courseProgress.get("status") === "not_started"
            ? "not_enrolled"
            : "enrolled";
        courseData.last_accessed_at = courseProgress.get("last_accessed_at");

        // Add module-level progress data
        if (
          courseData.course_modules &&
          Array.isArray(courseData.course_modules)
        ) {
          courseData.course_modules = courseData.course_modules.map(
            (module) => {
              const moduleId = module.id;
              const moduleCompletedLessons =
                courseProgress.getCompletedLessons(moduleId);
              const totalModuleLessons = module.course_lessons
                ? module.course_lessons.length
                : 0;
              const moduleProgressPercentage =
                totalModuleLessons > 0
                  ? Math.round(
                      (moduleCompletedLessons.length / totalModuleLessons) * 100
                    )
                  : 0;

              return {
                ...module,
                // Add module-specific progress
                progress_percentage: moduleProgressPercentage,
                completed: moduleProgressPercentage >= 100,
                completed_lessons_count: moduleCompletedLessons.length,
                total_lessons_count: totalModuleLessons,
                completed_lesson_ids: moduleCompletedLessons,
                // Add lesson-level progress data
                course_lessons: module.course_lessons
                  ? module.course_lessons.map((lesson) => ({
                      ...lesson,
                      completed: moduleCompletedLessons.includes(lesson.id),
                      is_current:
                        courseProgress.get("current_lesson_id") === lesson.id,
                      is_last_accessed:
                        courseProgress.get("last_lesson_id") === lesson.id,
                    }))
                  : [],
              };
            }
          );
        }
      } else {
        // No progress found - set default values
        courseData.completion_percentage = 0;
        courseData.total_lessons = 0;
        courseData.completed_lessons = 0;
        courseData.student_enrolled = false;
        courseData.student_completed = false;
        courseData.has_result = false;
        courseData.enrollment_status = "not_enrolled";
        courseData.last_accessed_at = null;

        // Add default module progress
        if (
          courseData.course_modules &&
          Array.isArray(courseData.course_modules)
        ) {
          courseData.course_modules = courseData.course_modules.map(
            (module) => ({
              ...module,
              progress_percentage: 0,
              completed: false,
              completed_lessons_count: 0,
              total_lessons_count: module.course_lessons
                ? module.course_lessons.length
                : 0,
              completed_lesson_ids: [],
              course_lessons: module.course_lessons
                ? module.course_lessons.map((lesson) => ({
                    ...lesson,
                    completed: false,
                    is_current: false,
                    is_last_accessed: false,
                  }))
                : [],
            })
          );
        }
      }

      return courseData;
    }

    return course;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.add = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const newCourse = await Course.forge(req.body).save();

    return await newCourse.fetch({ withRelated: ["level"] });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.update = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const course = await Course.where("id", req.params.id).fetch({
      withRelated: ["level"],
    });
    if (course) {
      course.set(req.body);
      await course.save();
    }

    return course;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.delete = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const info = await Course.where("id", req.params.id).destroy();
    return info;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getInstitutionCourses = async (institution_id, related = "") => {
  let relatedChain = "departments.courses";
  if (related) relatedChain = relatedChain + "." + related;

  const courses = [];
  const institution = await Institution.where("id", +institution_id).fetch({
    withRelated: [relatedChain],
  });

  if (
    institution &&
    institution.relations &&
    institution.relations.departments
  ) {
    institution.relations.departments.models.forEach((department) => {
      courses.push(...department.relations.courses.models);
    });
  }

  return courses;
};
