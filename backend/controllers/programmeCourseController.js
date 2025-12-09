// External Dependancies
const boom = require("boom");

// Get Data Models
const ProgrammeCourse = require("../models/ProgrammeCourse");
const checkAccess = require("../helpers/utils").checkAccess;

// Get all Programmecourses
exports.getProgrammeCourses = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    let query = ProgrammeCourse.forge().orderBy("id", "desc");

    if (filterKey && filterValue) query.where(filterKey, +filterValue);
    else if (req.query) {
      let filterParams = req.query;
      query.where(filterParams);
    }
    const programmeCourse = await query.fetchAll({
      withRelated: ["programme", "course", "level"]
    });
    return programmeCourse.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get a Programmecourse by ID
exports.getProgrammeCourseById = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const id = req.params.id;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too

    const programmeCourse = await new ProgrammeCourse({ id: id }).fetch({
      withRelated: ["programme", "course", "level"]
    });

    return programmeCourse;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new Programmecourse
exports.addProgrammeCourse = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const params = req.body;
    const programmeCourse = await ProgrammeCourse.forge(params).save();
    return programmeCourse.fetch({
      withRelated: ["programme", "course", "level"]
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing Programmecourse
exports.updateProgrammeCourse = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const id = req.params.id;
    const programmeCourse = req.body;
    const { ...updateData } = programmeCourse;
    const update = await ProgrammeCourse.forge({ id: id }).save(updateData, {
      patch: true
    });
    return update.fetch({ withRelated: ["programme", "course", "level"] });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an Programmecourse by id
exports.deleteProgrammeCourse = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const id = req.params.id;
    const programmeCourse = await new ProgrammeCourse({ id: id }).destroy();
    return programmeCourse;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get a Programmecourse by Programme ID
exports.getProgrammeCourseByProgrammeId = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const programmeId = req.params.programme_id;

    const programmeCourse = await ProgrammeCourse.where({
      programme_id: programmeId
    }).fetchAll({ withRelated: ["programme", "course", "level"] });
    return programmeCourse.models;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get Programme Courses by Search Params
exports.getProgrammeCourseBySearchParams = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    let query = ProgrammeCourse.forge();
    for (var key in req.query) {
      if (typeof req.query[key] == "object") {
        query.query(function(qb) {
          qb.where(key, "IN", req.query[key]).orWhere(key, "is", null);
        });
      } else {
        query.query(function(qb) {
          qb.where(key, req.query[key]).orWhere(key, "is", null);
        });
      }
    }
    const programmeCourses = await query.fetchAll({
      withRelated: ["programme", "course.department.faculty", "level"]
    });

    return programmeCourses;
  } catch (err) {
    throw boom.boomify(err);
  }
};
