const schoolForumThread = require("../controllers/schoolForumThreadController");
const schoolForumTopic = require("../controllers/schoolForumTopicController");
const schoolForumCategory = require("../controllers/schoolForumCategoryController");
const courseForumThread = require("../controllers/CourseForumThreadController");
const courseForumTopic = require("../controllers/CourseForumTopicController");
const forumStats = require("../controllers/forumStatsController");

const forumDocs = require("../documentation/forumDocs");

const routes = [
  {
    method: "POST",
    url: "/api/forumCategory",
    handler: schoolForumCategory.createForumCategory,
    schema: forumDocs.createSchoolForumCategory,
  },
  {
    method: "GET",
    url: "/api/forumCategory",
    handler: schoolForumCategory.getAllForumCategories,
    schema: forumDocs.getAllForumCategories,
  },
  {
    method: "GET",
    url: "/api/forumCategory/:id",
    handler: schoolForumCategory.getForumCategories,
    schema: forumDocs.getForumCategories,
  },
  {
    method: "PUT",
    url: "/api/forumCategory/:id",
    handler: schoolForumCategory.updateForumCategories,
    schema: forumDocs.updateForumCategories,
  },
  {
    method: "DELETE",
    url: "/api/forumCategory/:id",
    handler: schoolForumCategory.deleteSchoolForumCategory,
    schema: forumDocs.deleteForumCategories,
  },
  // School Forum Threads
  {
    method: "POST",
    url: "/api/forumThread",
    handler: schoolForumThread.createForumThread,
    schema: forumDocs.createForumThread,
  },
  {
    method: "GET",
    url: "/api/forumThread/:school_forum_topic_id",
    handler: schoolForumThread.getAllForumThreads,
    schema: forumDocs.getAllForumThreads,
  },
  {
    method: "GET",
    url: "/api/forumThread/:school_forum_topic_id/:id",
    handler: schoolForumThread.getForumThread,
    schema: forumDocs.getForumThread,
  },
  {
    method: "PUT",
    url: "/api/forumThread/:id",
    handler: schoolForumThread.updateForumThread,
    schema: forumDocs.updateForumThread,
  },
  {
    method: "DELETE",
    url: "/api/forumThread/:id",
    handler: schoolForumThread.deleteForumThread,
    schema: forumDocs.deleteForumThread,
  },

  // School Forum Topics
  {
    method: "POST",
    url: "/api/forumTopic",
    handler: schoolForumTopic.createForumTopic,
    schema: forumDocs.createForumTopic,
  },
  {
    method: "GET",
    url: "/api/forumTopic",
    handler: schoolForumTopic.getAllForumTopics,
    schema: forumDocs.getAllForumTopics,
  },
  {
    method: "GET",
    url: "/api/forumTopic/:id",
    handler: schoolForumTopic.getForumTopic,
    schema: forumDocs.getForumTopic,
  },
  {
    method: "PUT",
    url: "/api/forumTopic/:id",
    handler: schoolForumTopic.updateForumTopic,
    schema: forumDocs.updateForumTopic,
  },

  {
    method: "DELETE",
    url: "/api/forumTopic/:id",
    handler: schoolForumTopic.deleteForumTopic,
    schema: forumDocs.deleteForumTopic,
  },

  // Course Forum Threads
  {
    method: "POST",
    url: "/api/courseForumThread",
    handler: courseForumThread.createForumThread,
    schema: forumDocs.createCourseForumThread,
  },
  {
    method: "GET",
    url: "/api/courseForumThread/:course_forum_topic_id",
    handler: courseForumThread.getAllForumThreads,
    schema: forumDocs.getAllCourseForumThreads,
  },
  {
    method: "GET",
    url: "/api/courseForumThread/:course_forum_topic_id/:id",
    handler: courseForumThread.getForumThread,
    schema: forumDocs.getCourseForumThread,
  },
  {
    method: "PUT",
    url: "/api/courseForumThread/:id",
    handler: courseForumThread.updateForumThread,
    schema: forumDocs.updateCourseForumThread,
  },
  {
    method: "DELETE",
    url: "/api/courseForumThread/:id",
    handler: courseForumThread.deleteForumThread,
    schema: forumDocs.deleteCourseForumThread,
  },

  // Course Forum Topics
  {
    method: "POST",
    url: "/api/courseForumTopic",
    handler: courseForumTopic.createForumTopic,
    schema: forumDocs.createCourseForumTopic,
  },
  {
    method: "GET",
    url: "/api/courseForumTopic",
    handler: courseForumTopic.getAllForumTopics,
    schema: forumDocs.getAllCourseForumTopics,
  },
  {
    method: "GET",
    url: "/api/courseForumTopic/:course_id",
    handler: courseForumTopic.getForumTopic,
    schema: forumDocs.getCourseForumTopic,
  },
  {
    method: "PUT",
    url: "/api/courseForumTopic/:id",
    handler: courseForumTopic.updateForumTopic,
    schema: forumDocs.updateCourseForumTopic,
  },

  {
    method: "DELETE",
    url: "/api/courseForumTopic/:id",
    handler: courseForumTopic.deleteForumTopic,
    schema: forumDocs.deleteCourseForumTopic,
  },

  // Forum Statistics
  {
    method: "GET",
    url: "/api/forumStats",
    handler: forumStats.getForumStats,
  },
];
module.exports = routes;
