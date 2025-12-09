const SchoolForumCategory = require("../models/SchoolForumCategory");
const User = require("../models/User");
const SchoolForumTopic = require("../models/SchoolForumTopic");
const boom = require("boom");
const checkAccess = require("../helpers/utils").checkAccess;

/**
 * Create a new forum category
 * @param {object} req Fastify request object
 */
exports.createForumCategory = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "LECTURER"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const { name } = req.body;
    const newForumCategory = await SchoolForumCategory.forge({
      name,
      institution_id: validatedUser.institution_id
    }).save();
    return newForumCategory;
  } catch (error) {
    throw boom.boomify(error);
  }
};

/**
 * List all forum categories
 * @param {object} req Fastify request object
 */
exports.getAllForumCategories = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "STUDENT",
    "LECTURER"
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    return (
      await SchoolForumCategory.where({
        institution_id: validatedUser.institution_id
      }).fetchAll({
        withRelated: ["forumTopics"]
      })
    ).models;
  } catch (error) {
    throw boom.boomify(error);
  }
};

/**
 * Get a single forum category
 * @param {object} req Fastify request object
 */
exports.getForumCategories = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "STUDENT",
    "LECTURER"
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { id } = req.params;

  return SchoolForumCategory.where({ id })
    .fetch({
      // require: true,
      withRelated: ["forumTopics.user"]
    })
    .catch(error => {
      if (error.message === "EmptyResponse") {
        reply.code(400);
        throw boom.badRequest("Forum Category does not exist");
      }

      throw boom.boomify(error);
    });
};

/**
 * Update a single forum category
 * @param {object} req Fastify request object
 */
exports.updateForumCategories = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "LECTURER"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { id } = req.params;
  const { name } = req.body;

  return SchoolForumCategory.where({ id })
    .fetch({
      require: true
    })
    .then(result => {
      return result.save({ name });
    })

    .catch(error => {
      if (error.message === "EmptyResponse") {
        reply.code(400);
        throw boom.badRequest("Forum Category does not exist");
      }

      throw boom.boomify(error);
    });
};

exports.deleteSchoolForumCategory = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "LECTURER"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const { id } = req.params;

    let result = await SchoolForumCategory.where({ id }).destroy();

    Object.keys(result.attributes).length === 0
      ? reply.code(204) && reply.send()
      : reply.send(result);
  } catch (error) {
    if (error.message === "EmptyResponse") {
      reply.code(400);
      throw boom.badRequest("Forum Category does not exist");
    }

    throw boom.boomify(error);
  }
};

// exports.deleteSchoolForumCategory = async (req, reply) => {
//   const { id } = req.params;

//   return SchoolForumTopic.forge({ id })
//     .fetch({
//       withRelated: ["forumTopics"]
//     })
//     .then(item => {
//       item.related("forumTopics").invokeThen("destroy");
//       return item;
//     })
//     .then(item => {
//       return item.destroy();
//     })

//     .catch(error => {
//       if (error.message === "EmptyResponse") {
//         reply.code(400);
//         throw boom.badRequest("Forum Category does not exist");
//       }

//       throw boom.boomify(error);
//     });
// };
