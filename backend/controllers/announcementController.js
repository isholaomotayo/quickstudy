const Announcement = require("../models/Announcements");
const AnnouncementRead = require("../models/AnnouncementRead");
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
    const { title, body, user_id, institution_id } = req.body;
    const newAnnouncement = await Announcement.forge({
      title,
      body,
      user_id,
      institution_id,
    }).save();
    let newAnnouncementWithUser = await Announcement.where({
      id: newAnnouncement.id,
    }).fetch({
      withRelated: ["user"],
    });
    return newAnnouncementWithUser;
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
    "STUDENT",
    "LECTURER",
  ];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  // If checkAccess failed and cleared cookies, return empty array
  if (!validatedUser) {
    return [];
  }

  const query = Announcement.forge();
  query
    .where({
      institution_id: validatedUser.institution_id,
    })
    .orderBy("id", "desc");

  const { pgsize = 500, pg = 1, ...req_query } = req.query;

  // Handle specific query parameters that should be exact matches
  if (filterKey && filterValue) query.where(filterKey, filterValue);
  else if (req_query) {
    for (var key in req_query) {
      // Skip pagination parameters
      if (key === "pgsize" || key === "pg") continue;

      if (typeof req_query[key] == "object") {
        query.where(key, "IN", req_query[key]);
      } else {
        query.where(key, "ilike", `%${req_query[key]}%`);
      }
    }
  }

  try {
    const announcements = await query.fetchPage({
      pageSize: parseInt(pgsize),
      page: parseInt(pg),
      withRelated: ["user"],
    });

    // Get read status for current user
    const announcementIds = announcements.models.map((a) => a.id);
    let readAnnouncements = [];

    if (announcementIds.length > 0) {
      const readResult = await AnnouncementRead.where(
        "user_id",
        validatedUser.id
      )
        .where("announcement_id", "IN", announcementIds)
        .fetchAll();

      readAnnouncements = readResult.toJSON();
    }

    const readIds = new Set(readAnnouncements.map((r) => r.announcement_id));

    // Add read status to each announcement and convert to JSON
    const announcementsWithReadStatus = announcements.models.map(
      (announcement) => {
        const announcementData = announcement.toJSON();
        announcementData.read = readIds.has(announcement.id);
        return announcementData;
      }
    );

    if (announcements.pagination)
      setPaginationHeaders(reply, announcements.pagination);
    return announcementsWithReadStatus;
  } catch (error) {
    throw boom.boomify(error);
  }
};

/**
 * Get a single forum Topic
 * @param {object} req Fastify request object
 */
exports.getAnnouncement = async (req, reply) => {
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
  const { institution_id } = req.params;

  return Announcement.where({ institution_id })
    .fetchAll({
      withRelated: ["user"],
    })
    .then((result) => result.models)
    .catch((error) => {
      if (error.message === "EmptyResponse") {
        reply.code(400);
        throw boom.badRequest("Announcement does not exist");
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

  return Announcement.where({ id })
    .fetch({
      require: true,
    })
    .then((result) => {
      return result.save({ title, body });
    })
    .then(async (newResult) => {
      let newAnnouncementWithUser = await Announcement.where({
        id: newResult.id,
      }).fetch({
        withRelated: ["user"],
      });
      return newAnnouncementWithUser;
    })
    .catch((error) => {
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

  return Announcement.forge({ id })
    .destroy()
    .then(async (result) => {
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

exports.searchSchoolAnnouncement = async (req, reply) => {
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

  // If checkAccess failed and cleared cookies, return empty array
  if (!validatedUser) {
    return [];
  }

  const { query, pgsize = 500, pg = 1 } = req.query;

  if (!query) {
    return [];
  }

  try {
    const queryBuilder = Announcement.where({
      institution_id: validatedUser.institution_id,
    })
      .where(function () {
        this.where("title", "ilike", `%${query}%`).orWhere(
          "body",
          "ilike",
          `%${query}%`
        );
      })
      .orderBy("id", "desc");

    const announcements = await queryBuilder.fetchPage({
      pageSize: parseInt(pgsize),
      page: parseInt(pg),
      withRelated: ["user"],
    });

    // Get read status for current user
    const announcementIds = announcements.models.map((a) => a.id);
    let readAnnouncements = [];

    if (announcementIds.length > 0) {
      const readResult = await AnnouncementRead.where(
        "user_id",
        validatedUser.id
      )
        .where("announcement_id", "IN", announcementIds)
        .fetchAll();

      readAnnouncements = readResult.toJSON();
    }

    const readIds = new Set(readAnnouncements.map((r) => r.announcement_id));

    // Add read status to each announcement
    const announcementsWithReadStatus = announcements.models.map(
      (announcement) => {
        const announcementData = announcement.toJSON();
        announcementData.read = readIds.has(announcement.id);
        return announcementData;
      }
    );

    if (announcements.pagination)
      setPaginationHeaders(reply, announcements.pagination);
    return announcementsWithReadStatus;
  } catch (error) {
    throw boom.boomify(error);
  }
};

/**
 * Mark an announcement as read
 * @param {object} req Fastify request object
 */
exports.markAnnouncementAsRead = async (req, reply) => {
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

  try {
    // Check if announcement exists and user has access
    const announcement = await Announcement.where({
      id,
      institution_id: validatedUser.institution_id,
    })
      .fetch()
      .catch((err) => {
        if (err.message === "EmptyResponse") {
          return null;
        }
        throw err;
      });

    if (!announcement) {
      reply.code(404);
      throw boom.notFound("Announcement not found");
    }

    // Use upsert approach - insert if not exists, ignore if exists
    // The unique constraint on (announcement_id, user_id) will prevent duplicates
    try {
      await AnnouncementRead.forge({
        announcement_id: id,
        user_id: validatedUser.id,
        institution_id: validatedUser.institution_id,
        read_at: new Date(),
      }).save();

      return { message: "Marked as read", read: true };
    } catch (insertError) {
      // If it's a duplicate key error, the record already exists
      if (
        insertError.code === "23505" ||
        insertError.message.includes("duplicate key")
      ) {
        return { message: "Already marked as read", read: true };
      }
      throw insertError;
    }
  } catch (error) {
    throw boom.boomify(error);
  }
};

/**
 * Mark an announcement as unread (remove read status)
 * @param {object} req Fastify request object
 */
exports.markAnnouncementAsUnread = async (req, reply) => {
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

  try {
    // Check if announcement exists and user has access
    const announcement = await Announcement.where({
      id,
      institution_id: validatedUser.institution_id,
    })
      .fetch()
      .catch((err) => {
        if (err.message === "EmptyResponse") {
          return null;
        }
        throw err;
      });

    if (!announcement) {
      reply.code(404);
      throw boom.notFound("Announcement not found");
    }

    // Remove read status - if no record exists, that's fine
    await AnnouncementRead.where({
      announcement_id: id,
      user_id: validatedUser.id,
    }).destroy();

    return { message: "Marked as unread", read: false };
  } catch (error) {
    throw boom.boomify(error);
  }
};

/**
 * Get unread announcement count for current user
 * @param {object} req Fastify request object
 */
exports.getUnreadCount = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "STUDENT",
    "LECTURER",
  ];

  try {
    const { validatedUser, filterKey, filterValue } = checkAccess(
      req,
      reply,
      allowedRoles
    );

    // If checkAccess failed and cleared cookies, return early
    if (!validatedUser) {
      return {
        total: 0,
        read: 0,
        unread: 0,
      };
    }

    // Get total announcements for institution
    const totalAnnouncements = await Announcement.where({
      institution_id: validatedUser.institution_id,
    }).count();

    // Get read announcements for user
    const readCount = await AnnouncementRead.where({
      user_id: validatedUser.id,
      institution_id: validatedUser.institution_id,
    }).count();

    const unreadCount = totalAnnouncements - readCount;

    return {
      total: totalAnnouncements,
      read: readCount,
      unread: Math.max(0, unreadCount),
    };
  } catch (error) {
    // Return safe default instead of throwing error to prevent logout
    return {
      total: 0,
      read: 0,
      unread: 0,
    };
  }
};

/**
 * Mark all announcements as read for current user
 * @param {object} req Fastify request object
 */
exports.markAllAsRead = async (req, reply) => {
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
    // Get all announcements for institution that user hasn't read
    const allAnnouncements = await Announcement.where({
      institution_id: validatedUser.institution_id,
    }).fetchAll();

    const readAnnouncements = await AnnouncementRead.where({
      user_id: validatedUser.id,
      institution_id: validatedUser.institution_id,
    }).fetchAll();

    const readIds = new Set(
      readAnnouncements.models.map((r) => r.get("announcement_id"))
    );
    const unreadAnnouncements = allAnnouncements.models.filter(
      (a) => !readIds.has(a.id)
    );

    // Create read records for all unread announcements
    const readRecords = unreadAnnouncements.map((announcement) => ({
      announcement_id: announcement.id,
      user_id: validatedUser.id,
      institution_id: validatedUser.institution_id,
      read_at: new Date(),
    }));

    if (readRecords.length > 0) {
      await AnnouncementRead.collection(readRecords).invokeThen("save");
    }

    return {
      message: "All announcements marked as read",
      markedCount: readRecords.length,
    };
  } catch (error) {
    throw boom.boomify(error);
  }
};
