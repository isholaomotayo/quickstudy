const boom = require("boom");
const CourseLesson = require("../models/CourseLesson");
const checkAccess = require("../helpers/utils").checkAccess;

// Get all CourseLessons
exports.list = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    let query = CourseLesson.forge();
    if (filterKey && filterValue) query.where(filterKey, +filterValue);

    const courseLessons = await query.orderBy("order", "asc").fetchAll();
    return courseLessons.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.get = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const courseLesson = await CourseLesson.where("id", req.params.id).fetch();
    //const courseLesson = await CourseLesson.forge({id: req.params.id}).fetch();
    return courseLesson;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.add = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    // Filter out course_tests as it's a relationship, not a database column
    const { course_tests, ...lessonData } = req.body;
    const newCourseLesson = await CourseLesson.forge(lessonData).save();

    return newCourseLesson;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.update = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const courseLesson = await CourseLesson.where("id", req.params.id).fetch();
    if (courseLesson) {
      // Filter out course_tests as it's a relationship, not a database column
      const { course_tests, ...updateData } = req.body;
      courseLesson.set(updateData);
      courseLesson.save();
    }

    return courseLesson;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.delete = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const info = await CourseLesson.where("id", req.params.id).destroy();
    return info;
  } catch (err) {
    throw boom.boomify(err);
  }
};
