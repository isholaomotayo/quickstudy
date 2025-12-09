const CourseDiscussionTopic = require("../models/CourseDiscussionTopic");
const CourseDiscussionComment = require("../models/CourseDiscussionComment");
const checkAccess = require("../helpers/utils").checkAccess;

const boom = require("boom");
/**
 * Create a new forum category
 * @param {object} req Fastify request object
 */
exports.createDiscussionComment = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const { body, user_id, course_discussion_topic_id } = req.body;

    const discussionTopic = await CourseDiscussionTopic.where({
      id: course_discussion_topic_id
    }).fetch();

    const result = discussionTopic._previousAttributes;
    const endDate = new Date(result.end_date).valueOf();
    const startDate = new Date(result.start_date).valueOf();
    const now = Date.now();
    if (startDate <= now && now <= endDate) {
      console.log(true);
      const newDiscussionComment = await CourseDiscussionComment.forge({
        body,
        user_id,
        course_discussion_topic_id
      }).save();
      let newDiscussionWithUser = await CourseDiscussionComment.where({
        id: newDiscussionComment.id
      }).fetch({
        withRelated: ["user"]
      });
      return newDiscussionWithUser;
    } else {
      throw boom.badRequest("You are not allowed to create a new comment");
    }
  } catch (error) {
    reply.code(401);
    throw boom.boomify(error);
  }
};

/**
 * List all forum categories
 * @param {object} req Fastify request object
 */
exports.getDiscussionComment = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { course_discussion_topic_id } = req.params;
  console.log(course_discussion_topic_id);
  return CourseDiscussionComment.where({ course_discussion_topic_id })
    .fetchAll({
      // require: true,
      withRelated: ["user"]
    })
    .then(result => result.models)
    .catch(error => {
      if (error.message === "EmptyResponse") {
        reply.code(400);
        throw boom.badRequest("Class Discussion Topic does not exist");
      }

      throw boom.boomify(error);
    });
};

/**
 * Get a single forum Topic
 * @param {object} req Fastify request object
 */
exports.getAllDiscussionComment = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    console.log(req.cookies);
    return (
      await CourseDiscussionComment.fetchAll({
        withRelated: ["user"]
      })
    ).models;
  } catch (error) {
    throw boom.boomify(error);
  }
};

/**
 * Update a single forum category
 * @param {object} req Fastify request object
 */
exports.updateDiscussionComment = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { id } = req.params;
  const { body, user_id, course_discussion_topic_id } = req.body;
  return CourseDiscussionComment.where({ id })
    .fetch({
      require: true
    })
    .then(result => {
      return result.save({
        body,
        user_id,
        course_discussion_topic_id
      });
    })
    .then(async newResult => {
      let newDiscussionWithUser = await CourseDiscussionComment.where({
        id: newResult.id
      }).fetch({
        withRelated: ["user"]
      });
      return newDiscussionWithUser;
    })
    .catch(error => {
      if (error.message === "EmptyResponse") {
        reply.code(400);
        throw boom.badRequest("Course Discussion Comment does not exist");
      }

      throw boom.boomify(error);
    });
};

exports.deleteDiscussionComment = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const { id } = req.params;

    let result = await CourseDiscussionComment.where({ id }).destroy();

    Object.keys(result.attributes).length === 0
      ? reply.code(204) && reply.send()
      : reply.send(result);
  } catch (error) {
    if (error.message === "EmptyResponse") {
      reply.code(400);
      throw boom.badRequest("Course Discussion Comment does not exist");
    }

    throw boom.boomify(error);
  }
};
