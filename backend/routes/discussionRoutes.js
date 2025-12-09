const DiscussionTopic = require("../controllers/courseDiscussionTopicController");
const DiscussionComment = require("../controllers/courseDiscussionCommentController");
const DiscussionDocs = require("../documentation/discussionDocs");

const routes = [
  //  announcements
  {
    method: "POST",
    url: "/api/discussionTopic",
    handler: DiscussionTopic.createDiscussionTopic,
    schema: DiscussionDocs.createCourseDiscussionTopic
  },
  {
    method: "GET",
    url: "/api/discussionTopic",
    handler: DiscussionTopic.getAllDiscussionTopic,
    schema: DiscussionDocs.getAllCourseDiscussionTopics
  },
  {
    method: "GET",
    url: "/api/discussionTopic/:course_id",
    handler: DiscussionTopic.getDiscussionTopic,
    schema: DiscussionDocs.getCourseDiscussionTopic
  },
  {
    method: "PUT",
    url: "/api/discussionTopic/:id",
    handler: DiscussionTopic.updateDiscussionTopic,
    schema: DiscussionDocs.updateCourseDiscussionTopic
  },

  {
    method: "DELETE",
    url: "/api/discussionTopic/:id",
    handler: DiscussionTopic.deleteDiscussionTopic,
    schema: DiscussionDocs.deleteCourseDiscussionTopic
  },
  {
    method: "POST",
    url: "/api/discussionComment",
    handler: DiscussionComment.createDiscussionComment,
    schema: DiscussionDocs.createCourseDiscussionComment
  },
  {
    method: "GET",
    url: "/api/discussionComment/",
    handler: DiscussionComment.getAllDiscussionComment,
    schema: DiscussionDocs.getAllCourseDiscussionComments
  },
  {
    method: "GET",
    url: "/api/discussionComment/:course_discussion_topic_id",
    handler: DiscussionComment.getDiscussionComment,
    schema: DiscussionDocs.getCourseDiscussionComment
  },
  {
    method: "PUT",
    url: "/api/discussionComment/:id",
    handler: DiscussionComment.updateDiscussionComment,
    schema: DiscussionDocs.updateCourseDiscussionComment
  },

  {
    method: "DELETE",
    url: "/api/discussionComment/:id",
    handler: DiscussionComment.deleteDiscussionComment,
    schema: DiscussionDocs.deleteCourseDiscussionComment
  }
];
module.exports = routes;
