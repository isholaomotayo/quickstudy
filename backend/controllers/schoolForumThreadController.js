const SchoolForumThread = require("../models/SchoolForumThread");
const checkAccess = require("../helpers/utils").checkAccess;

const boom = require("boom");

/**
 * Create a new forum category
 * @param {object} req Fastify request object
 */
exports.createForumThread = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const { body, user_id, school_forum_topic_id } = req.body;
    const newForumThread = await SchoolForumThread.forge({
      body,
      user_id,
      school_forum_topic_id,
      institution_id: validatedUser.institution_id,
    }).save();

    let newThreadWithUser = await SchoolForumThread.where({
      id: newForumThread.id,
      school_forum_topic_id,
    }).fetch({
      withRelated: ["user"],
    });
    reply.code(201);
    return newThreadWithUser;
  } catch (error) {
    throw boom.boomify(error);
  }
};

/**
 * List all forum categories
 * @param {object} req Fastify request object
 */
exports.getAllForumThreads = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "STUDENT",
    "LECTURER",
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const { school_forum_topic_id } = req.params;
    return (
      await SchoolForumThread.where({
        school_forum_topic_id,
        institution_id: validatedUser.institution_id,
      }).fetchAll({
        withRelated: ["user"],
      })
    ).models;
  } catch (error) {
    throw boom.boomify(error);
  }
};

/**
 * Get a single forum Thread
 * @param {object} req Fastify request object
 */
exports.getForumThread = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "STUDENT",
    "LECTURER",
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { id, school_forum_topic_id } = req.params;

  return SchoolForumThread.where({ id, school_forum_topic_id })
    .fetch({
      // require: true,
      withRelated: ["user"],
    })

    .catch((error) => {
      if (error.message === "EmptyResponse") {
        reply.code(400);
        throw boom.badRequest("Forum Thread does not exist");
      }

      throw boom.boomify(error);
    });
};

/**
 * Update a single forum category
 * @param {object} req Fastify request object
 */
exports.updateForumThread = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { id } = req.params;
  const { body } = req.body;

  return SchoolForumThread.where({ id })
    .fetch({
      require: true,
      withRelated: ["user"],
    })
    .then((result) => {
      // Check if user can edit this thread
      const isAdmin = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"].includes(
        validatedUser.role
      );
      const isOwner = result.get("user_id") === validatedUser.id;

      if (!isAdmin && !isOwner) {
        reply.code(403);
        throw boom.forbidden("You can only edit your own comments");
      }

      return result.save({ body });
    })

    .catch((error) => {
      if (error.message === "EmptyResponse") {
        reply.code(400);
        throw boom.badRequest("Forum Thread does not exist");
      }

      throw boom.boomify(error);
    });
};

exports.deleteForumThread = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const { id } = req.params;

    // First fetch the thread to check ownership
    const thread = await SchoolForumThread.where({ id }).fetch({
      require: true,
    });

    // Check if user can delete this thread
    const isAdmin = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"].includes(
      validatedUser.role
    );
    const isOwner = thread.get("user_id") === validatedUser.id;

    if (!isAdmin && !isOwner) {
      reply.code(403);
      throw boom.forbidden("You can only delete your own comments");
    }

    let result = await SchoolForumThread.where({ id }).destroy();
    Object.keys(result.attributes).length === 0
      ? reply.code(204) && reply.send()
      : reply.send(result);
  } catch (error) {
    if (error.message === "EmptyResponse") {
      reply.code(400);
      throw boom.badRequest("Forum Thread does not exist");
    }

    throw boom.boomify(error);
  }
};
