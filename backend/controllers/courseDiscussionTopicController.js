const CourseDiscussionTopic = require("../models/CourseDiscussionTopic");

const User = require("../models/User");

const boom = require("boom");
const checkAccess = require("../helpers/utils").checkAccess;
const setPaginationHeaders = require("../helpers/utils").setPaginationHeaders;
/**
 * Create a new forum category
 * @param {object} req Fastify request object
 */
exports.createDiscussionTopic = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "LECTURER"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const { title, body, user_id, course_id, start_date, end_date } = req.body;
    const newDiscussionTopic = await CourseDiscussionTopic.forge({
      title,
      body,
      user_id,
      course_id,
      start_date,
      end_date,
    }).save();
    let newDiscussionWithUser = await CourseDiscussionTopic.where({
      id: newDiscussionTopic.id,
    }).fetch({
      withRelated: ["user", "course", "comment"],
    });
    return newDiscussionWithUser;
  } catch (error) {
    reply.code(401);
    throw boom.boomify(error);
  }
};

/**
 * List all forum categories
 * @param {object} req Fastify request object
 */
exports.getAllDiscussionTopic = async (req, reply) => {
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
  const { course_id } = req.query;

  try {
    // If user is a student, filter by enrolled courses
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

      // Get discussion topics for enrolled courses
      const query = CourseDiscussionTopic.query((qb) => {
        qb.whereIn("course_id", courseIds);
      });

      // Apply additional filters if course_id is specified
      if (course_id) {
        query.where({ course_id });
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

      const discussion = await query.orderBy("id", "desc").fetchPage({
        pageSize: pgsize,
        page: pg,
        withRelated: [
          "user",
          "course",
          {
            "comment.user": (query) => {
              query.orderBy("id", "DESC");
            },
          },
        ],
      });

      if (discussion.pagination) {
        setPaginationHeaders(reply, discussion.pagination);
      }
      return discussion.models;
    }

    // For non-student roles, return all discussion topics
    const query = CourseDiscussionTopic.forge();

    if (course_id) {
      delete req.query.course_id;
      query.where({
        course_id,
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

    const discussion = await query.orderBy("id", "desc").fetchPage({
      pageSize: pgsize,
      page: pg,
      withRelated: [
        "user",
        "course",
        {
          "comment.user": (query) => {
            query.orderBy("id", "DESC");
          },
        },
      ],
    });
    if (discussion.pagination) {
      setPaginationHeaders(reply, discussion.pagination);
    }
    return discussion.models;
  } catch (error) {
    throw boom.boomify(error);
  }
};

/**
 * Get a single forum Topic
 * @param {object} req Fastify request object
 */
exports.getDiscussionTopic = async (req, reply) => {
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

  const { course_id } = req.params;

  return CourseDiscussionTopic.where({ course_id })
    .fetchAll({
      // require: true,
      withRelated: [
        "user",
        "course",
        {
          "comment.user": (query) => {
            query.orderBy("id", "DESC");
          },
        },
      ],
    })
    .then((result) => result.models)
    .catch((error) => {
      if (error.message === "EmptyResponse") {
        reply.code(400);
        throw boom.badRequest("Class Discussion Topic does not exist");
      }

      throw boom.boomify(error);
    });
};

/**
 * Update a single forum category
 * @param {object} req Fastify request object
 */
exports.updateDiscussionTopic = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "LECTURER"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  const { id } = req.params;
  const { title, body, start_date, end_date, course_id, user_id } = req.body;

  return CourseDiscussionTopic.where({ id })
    .fetch({
      require: true,
    })
    .then((result) => {
      // Check if user can edit this discussion
      const isAdmin = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"].includes(
        validatedUser.role
      );
      const isOwner = result.get("user_id") === validatedUser.id;

      if (!isAdmin && !isOwner) {
        reply.code(403);
        throw boom.forbidden("You can only edit your own discussions");
      }

      return result.save({
        title,
        body,
        start_date,
        end_date,
        user_id,
        course_id,
      });
    })
    .then(async (newResult) => {
      let newDiscussionWithUser = await CourseDiscussionTopic.where({
        id: newResult.id,
      }).fetch({
        withRelated: ["user", "course", "comment"],
      });
      return newDiscussionWithUser;
    })
    .catch((error) => {
      if (error.message === "EmptyResponse") {
        reply.code(400);
        throw boom.badRequest("Class Discussion Topic does not exist");
      }

      throw boom.boomify(error);
    });
};

exports.deleteDiscussionTopic = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "LECTURER"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { id } = req.params;

  return CourseDiscussionTopic.forge({ id })
    .fetch({
      withRelated: ["comment"],
    })
    .then((item) => {
      // Check if user can delete this discussion
      const isAdmin = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"].includes(
        validatedUser.role
      );
      const isOwner = item.get("user_id") === validatedUser.id;

      if (!isAdmin && !isOwner) {
        reply.code(403);
        throw boom.forbidden("You can only delete your own discussions");
      }

      item.related("comment").invokeThen("destroy");
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
        throw boom.badRequest("Class Discussion Topic does not exist");
      }

      throw boom.boomify(error);
    });
};
