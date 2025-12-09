const SchoolForumTopic = require("../models/SchoolForumTopic");
const checkAccess = require("../helpers/utils").checkAccess;

const boom = require("boom");

/**
 * Create a new forum category
 * @param {object} req Fastify request object
 */
exports.createForumTopic = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
    "STUDENT",
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  // Debug logging removed for production

  try {
    const { title, body, user_id, school_forum_category_id } = req.body;
    const newForumTopic = await SchoolForumTopic.forge({
      title,
      body,
      user_id,
      school_forum_category_id,
      institution_id: validatedUser.institution_id,
    }).save();
    let newForumWithUser = await SchoolForumTopic.where({
      id: newForumTopic.id,
    }).fetch({
      withRelated: ["user", "thread"],
    });
    return newForumWithUser;
  } catch (error) {
    reply.code(401);
    throw boom.boomify(error);
  }
};

/**
 * List all forum categories
 * @param {object} req Fastify request object
 */
exports.getAllForumTopics = async (req, reply) => {
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
    return (
      await SchoolForumTopic.where({
        institution_id: validatedUser.institution_id,
      }).fetchAll({
        withRelated: [
          "user",
          "thread",
          // {
          //   "thread.user": query => {
          //     query.orderBy("id", "DESC");
          //   }
          // }
        ],
      })
    ).models;
  } catch (error) {
    throw boom.boomify(error);
  }
};

/**
 * Get a single forum Topic
 * @param {object} req Fastify request object
 */
exports.getForumTopic = async (req, reply) => {
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
  const { id } = req.params;

  return SchoolForumTopic.where({ id })
    .fetch({
      // require: true,
      withRelated: [
        "user",

        {
          "thread.user": (query) => {
            query.orderBy("id", "DESC");
          },
        },
      ],
    })

    .catch((error) => {
      if (error.message === "EmptyResponse") {
        reply.code(400);
        throw boom.badRequest("Forum Topic does not exist");
      }

      throw boom.boomify(error);
    });
};

/**
 * Update a single forum category
 * @param {object} req Fastify request object
 */
exports.updateForumTopic = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
    "STUDENT",
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { id } = req.params;
  const { title, body } = req.body;

  return SchoolForumTopic.where({ id })
    .fetch({
      require: true,
    })
    .then((result) => {
      // Check if user can edit this post
      const isAdmin = [
        "SUPERADMIN",
        "ADMIN",
        "HOD",
        "STAFF",
        "LECTURER",
      ].includes(validatedUser.role);
      const isOwner = result.get("user_id") === validatedUser.id;

      if (!isAdmin && !isOwner) {
        reply.code(403);
        throw boom.forbidden("You can only edit your own posts");
      }

      return result.save({ title, body });
    })
    .then(async (newResult) => {
      let newForumWithUser = await SchoolForumTopic.where({
        id: newResult.id,
      }).fetch({
        withRelated: ["user", "thread"],
      });
      return newForumWithUser;
    })
    .catch((error) => {
      if (error.message === "EmptyResponse") {
        reply.code(400);
        throw boom.badRequest("Forum Topic does not exist");
      }

      throw boom.boomify(error);
    });
};

exports.deleteForumTopic = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
    "STUDENT",
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { id } = req.params;

  return SchoolForumTopic.forge({ id })
    .fetch({
      withRelated: ["thread"],
    })
    .then((item) => {
      // Check if user can delete this post
      const isAdmin = [
        "SUPERADMIN",
        "ADMIN",
        "HOD",
        "STAFF",
        "LECTURER",
      ].includes(validatedUser.role);
      const isOwner = item.get("user_id") === validatedUser.id;

      if (!isAdmin && !isOwner) {
        reply.code(403);
        throw boom.forbidden("You can only delete your own posts");
      }

      item.related("thread").invokeThen("destroy");
      return item;
    })
    .then(async (item) => {
      let result = await item.destroy();
      Object.keys(result.attributes).length === 0
        ? reply.code(204) && reply.send()
        : reply.send(result);
    })

    .catch((error) => {
      if (error.message === "EmptyResponse") {
        reply.code(400);
        throw boom.badRequest("Forum Topic does not exist");
      }

      throw boom.boomify(error);
    });
};
