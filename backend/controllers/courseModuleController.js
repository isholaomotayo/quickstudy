const boom = require("boom");
const CourseModule = require("../models/CourseModule");
const {
  checkAccess,
  checkPaymentCurrent,
  setUnpublishedError,
} = require("../helpers/utils");

// Get all CourseModules
exports.list = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  await checkPaymentCurrent(reply, validatedUser);

  try {
    let query = CourseModule.forge();

    // Extract query parameters, excluding pagination params
    const { pgsize = 100, pg = 1, ...req_query } = req.query;

    // Apply filtering - first check legacy filterKey/filterValue, then direct query params
    if (filterKey && filterValue) {
      query.where(filterKey, +filterValue);
    } else if (req_query && Object.keys(req_query).length > 0) {
      for (var key in req_query) {
        if (typeof req_query[key] == "object") {
          query.where(key, "IN", req_query[key]);
        } else {
          // Convert to number if it's a numeric string (like IDs)
          const value = /^\d+$/.test(req_query[key])
            ? +req_query[key]
            : req_query[key];
          query.where(key, value);
        }
      }
    }

    let courseModules = await query.orderBy("order", "asc").fetchAll();
    if (courseModules.models) courseModules = courseModules.models;
    if (validatedUser.role == "STUDENT")
      courseModules = courseModules.filter(
        (courseModule) => courseModule.attributes.published
      );

    return courseModules;
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
  await checkPaymentCurrent(reply, validatedUser);

  try {
    const courseModule = await CourseModule.where("id", req.params.id).fetch({
      withRelated: [req.query.relatedString || "course_lessons"],
    });
    //const courseModule = await CourseModule.forge({id: req.params.id}).fetch();
    //console.log(courseModule)
    if (
      validatedUser.role == "STUDENT" &&
      courseModule &&
      courseModule.attributes &&
      !courseModule.attributes.published
    ) {
      setUnpublishedError(reply);
      return;
    }
    return courseModule;
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
    const newCourseModule = await CourseModule.forge(req.body).save();

    return newCourseModule;
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
    const courseModule = await CourseModule.where("id", req.params.id).fetch();
    if (courseModule) {
      courseModule.set(req.body);
      await courseModule.save();
    }

    return courseModule;
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
    const info = await CourseModule.where("id", req.params.id).destroy();

    return info;
  } catch (err) {
    throw boom.boomify(err);
  }
};
