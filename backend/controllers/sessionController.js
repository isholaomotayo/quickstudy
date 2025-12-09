// External Dependancies
const boom = require("boom");
const checkAccess = require("../helpers/utils").checkAccess;
// Get Data Models
const Session = require("../models/Session");
//Get knex

// Get current active session
exports.getCurrentSession = async (req, reply) => {
  try {
    const session = await Session.where({ is_active: true }).fetch({
      require: false,
    });

    if (!session) {
      return reply.code(404).send({ error: "No active session found" });
    }

    return session.attributes;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get sessions list
exports.getSessions = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const sessions = await Session.where({
      institution_id: validatedUser.institution_id,
    }).fetchAll();

    //return sessions.serialize(); this works too
    return sessions.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get an session by ID
exports.getSessionById = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too

    const session = await new Session({ id: id }).fetch();

    return session;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new session
exports.addSession = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const params = req.body;
    params.institution_id = validatedUser.institution_id;
    const session = Session.forge(params).save();
    return session;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing session
exports.updateSession = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const session = req.body;
    const { ...updateData } = session;
    const update = await Session.forge({ id: id }).save(updateData, {
      patch: true,
    });
    return update;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an session by id
exports.deleteSession = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const session = await new Session({ id: id }).destroy();
    return session;
  } catch (err) {
    throw boom.boomify(err);
  }
};
