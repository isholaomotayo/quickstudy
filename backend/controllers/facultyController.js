const boom = require("boom");
const Faculty = require("../models/Faculty");
const checkAccess = require("../helpers/utils").checkAccess;

// Get all Faculties or filter by a column value
exports.list = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  let query = Faculty.forge().orderBy("id", "desc");
  
  if (validatedUser.role == "ADMIN") {
    query.where('institution_id', +validatedUser.institution_id)
  }

  try {
    if (filterKey && filterValue) query.where(filterKey, +filterValue);

    const faculties = await query.fetchAll();
    return faculties.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.get = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const faculty = await Faculty.where("id", req.params.id).fetch({
      withRelated: ["departments"]
    });
    //const Faculty = await Faculty.forge({id: req.params.id}).fetch();
    return faculty;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.add = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  const { institution_id, code, name, description } = req.body;

  try {
    const newFaculty = await Faculty.forge(req.body).save();

    return newFaculty;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.update = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const faculty = await Faculty.where("id", req.params.id).fetch();
    if (faculty) {
      faculty.set(req.body);
      await faculty.save();
    }

    return faculty;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.delete = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const info = await Faculty.where("id", req.params.id).destroy();
    return info;
  } catch (err) {
    throw boom.boomify(err);
  }
};
