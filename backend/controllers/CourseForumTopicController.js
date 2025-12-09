const CourseForumTopic = require("../models/CourseForumTopic");
const checkAccess = require("../helpers/utils").checkAccess;

const User = require("../models/User");

const boom = require("boom");

/**
 * Create a new forum category
 * @param {object} req Fastify request object
 */
exports.createForumTopic = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const { title, description, user_id, course_id } = req.body;
    const newForumTopic = await CourseForumTopic.forge({
      title,
      description,
      user_id,
      course_id,
    }).save();
    let newForumWithUser = await CourseForumTopic.where({
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
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    // If user is a student, filter by enrolled courses and topics with posts
    if (validatedUser.role === "STUDENT") {
      const StudentCourse = require("../models/StudentCourse");

      // Get courses where the student is enrolled
      const studentCourses = await StudentCourse.where({
        student_id: validatedUser.student.id,
      }).fetchAll();

      if (!studentCourses.models.length) {
        return [];
      }

      const courseIds = studentCourses.models.map((sc) => sc.get("course_id"));

      // Get forum topics for enrolled courses
      return (
        await CourseForumTopic.query((qb) => {
          qb.whereIn("course_id", courseIds);
        }).fetchAll({
          withRelated: ["user", "thread", "course"],
        })
      ).models;
    }

    // For non-student roles, return all forum topics
    return (
      await CourseForumTopic.fetchAll({
        withRelated: ["user", "thread", "course"],
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
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { course_id } = req.params;

  return CourseForumTopic.where({ course_id })
    .fetchAll({
      // require: true,
      withRelated: [
        "user",
        "course",

        {
          "thread.user": (query) => {
            query.orderBy("id", "DESC");
          },
        },
      ],
    })
    .then((result) => result.models)
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
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { id } = req.params;
  const { title, description } = req.body;

  return CourseForumTopic.where({ id })
    .fetch({
      require: true,
    })
    .then((result) => {
      // Check if user can edit this post
      const isAdmin = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"].includes(
        validatedUser.role
      );
      const isOwner = result.get("user_id") === validatedUser.id;

      if (!isAdmin && !isOwner) {
        reply.code(403);
        throw boom.forbidden("You can only edit your own posts");
      }

      return result.save({ title, description });
    })
    .then(async (newResult) => {
      let newForumWithUser = await CourseForumTopic.where({
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
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { id } = req.params;

  return CourseForumTopic.forge({ id })
    .fetch({
      withRelated: ["thread"],
    })
    .then((item) => {
      // Check if user can delete this post
      const isAdmin = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"].includes(
        validatedUser.role
      );
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
