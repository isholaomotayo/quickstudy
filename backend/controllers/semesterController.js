// External Dependancies
const boom = require("boom");
const checkAccess = require("../helpers/utils").checkAccess;

// Get Data Models
const Semester = require("../models/Semester");
//Get knex

// Get semesters list
exports.getSemesters = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    let query = Semester.forge();

    if (req.query) {
      for (var key in req.query) {
        if (typeof req.query[key] == "object") {
          query.where(key, "IN", req.query[key]);
        } else {
          query.where(key, req.query[key]);
        }
      }
    }

    const semesters = await query
      .where({ institution_id: validatedUser.institution_id })
      .fetchAll();

    //return semesters.serialize(); this works too
    return semesters.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get an semester by ID
exports.getSemesterById = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too

    const semester = await new Semester({ id: id }).fetch({
      withRelated: ["session"],
    });

    return semester;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new semester
exports.addSemester = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const params = req.body;
    const semester = Semester.forge(params).save();
    return semester;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing semester
exports.updateSemester = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const semester = req.body;
    const { ...updateData } = semester;
    const update = await Semester.forge({ id: id }).save(updateData, {
      patch: true,
    });
    return update;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an semester by id
exports.deleteSemester = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const semester = await new Semester({ id: id }).destroy();
    return semester;
  } catch (err) {
    throw boom.boomify(err);
  }
};
