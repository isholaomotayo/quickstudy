const CourseAnnouncement = require("../models/CourseAnnouncement");
const checkAccess = require("../helpers/utils").checkAccess;
const setPaginationHeaders = require("../helpers/utils").setPaginationHeaders;

const boom = require("boom");

/**
 * Create a new forum category
 * @param {object} req Fastify request object
 */
exports.createAnnouncement = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "LECTURER"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const { title, body, user_id, course_id } = req.body;
    const newAnnouncement = await CourseAnnouncement.forge({
      title,
      body,
      user_id,
      course_id
    }).save();
    let newForumWithUser = await CourseAnnouncement.where({
      id: newAnnouncement.id
    }).fetch({
      withRelated: ["user"]
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

exports.getAllAnnouncements = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
    "STUDENT"
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { course_id } = req.query;

  const query = CourseAnnouncement.forge();

  if (course_id) {
    delete req.query.course_id;
    query.where({
      course_id
    });
  }

  const { pgsize = 500, pg = 1, ...req_query } = req.query;
  if (filterKey && filterValue) query.where(filterKey, filterValue);
  else if (req_query) {
    for (var key in req_query) {
      if (typeof req_query[key] == "object") {
        query.where(key, "IN", req_query[key]);
      } else {
        query.where(key, "ilike", `%${req_query[key]}%`);
      }
    }
  }

  try {
    const announcements = await query.orderBy("id", "desc").fetchPage({
      pageSize: pgsize,
      page: pg,
      withRelated: ["user"]
    });
    if (announcements.pagination) {
      setPaginationHeaders(reply, announcements.pagination);
    }
    return announcements.models;
  } catch (error) {
    throw boom.boomify(error);
  }
};

/**
 * Get a single forum Topic
 * @param {object} req Fastify request object
 *
 */
exports.getAnnouncement = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
    "STUDENT"
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { id } = req.params;

  return CourseAnnouncement.where({ id })
    .fetch({
      // require: true,
      withRelated: ["user"]
    })
    .then(result => result.attributes)
    .catch(error => {
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
exports.updateAnnouncement = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "LECTURER"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { id } = req.params;
  const { title, body } = req.body;

  return CourseAnnouncement.where({ id })
    .fetch({
      require: true
    })
    .then(result => {
      return result.save({ title, body });
    })
    .then(async newResult => {
      let newForumWithUser = await CourseAnnouncement.where({
        id: newResult.id
      }).fetch({
        withRelated: ["user"]
      });
      return newForumWithUser;
    })
    .catch(error => {
      if (error.message === "EmptyResponse") {
        reply.code(400);
        throw boom.badRequest("Course Announcement does not exist");
      }

      throw boom.boomify(error);
    });
};

exports.deleteAnnouncement = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "LECTURER"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { id } = req.params;

  return CourseAnnouncement.forge({ id })
    .destroy()
    .then(async result => {
      Object.keys(result.attributes).length === 0
        ? reply.code(204) && reply.send()
        : reply.send(result);
    })

    .catch(error => {
      if (error.message === "EmptyResponse") {
        reply.code(400);
        throw boom.badRequest("Forum Topic does not exist");
      }

      throw boom.boomify(error);
    });
};
