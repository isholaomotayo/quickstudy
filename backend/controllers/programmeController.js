const boom = require("boom");
const Programme = require("../models/Programme");
const checkAccess = require("../helpers/utils").checkAccess;

// Get all Programmes
exports.list = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "LECTURER",
    "STAFF",
    "STUDENT",
    "APPLICANT",
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    let query = Programme.forge().orderBy("id", "desc");

    if (
      req.query &&
      "filter" in req.query &&
      req.query["filter"].indexOf(":") > 0
    ) {
      const [filterKey, filterValue] = req.query["filter"].split(":");
      query.where(filterKey, +filterValue);
    }
    if (req.query) {
      let filter_params = req.query;
      query.where(filter_params);
    }
    const programmes = await query.fetchAll({
      withRelated: ["department.faculty"],
    });

    let applicant = programmes.filter((m) => {
      return (
        m.relations.department.relations.faculty.attributes.institution_id ===
        validatedUser.institution_id
      );
    });

    return applicant;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.get = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "LECTURER",
    "STAFF",
    "STUDENT",
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const programme = await Programme.where("id", req.params.id).fetch({
      withRelated: ["courses"],
    });
    //const Programme = await Programme.forge({id: req.params.id}).fetch();
    return programme;
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
    const newProgramme = await Programme.forge(req.body).save();

    return newProgramme;
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
    const programme = await Programme.where("id", req.params.id).fetch();
    if (programme) {
      programme.set(req.body);
      programme.save();
    }

    return programme;
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
    const info = await Programme.where("id", req.params.id).destroy();
    return info;
  } catch (err) {
    throw boom.boomify(err);
  }
};
