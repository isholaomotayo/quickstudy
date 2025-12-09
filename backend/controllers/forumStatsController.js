const ForumTopic = require("../models/SchoolForumTopic");
const User = require("../models/User");
const checkAccess = require("../helpers/utils").checkAccess;
const boom = require("boom");

/**
 * Get forum statistics for university forum
 * @param {object} req Fastify request object
 */
exports.getForumStats = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    // Get today's date at start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get start of this week (Monday)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
    startOfWeek.setDate(today.getDate() - daysToSubtract);

    // Get total users count
    const totalUsers = await User.count();

    // Get posts created today
    const todayPosts = await ForumTopic.count({
      created_at: {
        $gte: today,
      },
    });

    // Get posts created this week
    const thisWeekPosts = await ForumTopic.count({
      created_at: {
        $gte: startOfWeek,
      },
    });

    // Get total posts
    const totalPosts = await ForumTopic.count();

    return {
      today: todayPosts,
      thisWeek: thisWeekPosts,
      totalMembers: totalUsers,
      totalPosts: totalPosts,
    };
  } catch (error) {
    throw boom.boomify(error);
  }
};
