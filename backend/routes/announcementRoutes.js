const Announcement = require("../controllers/announcementController");
const AnnoucementDocs = require("../documentation/announcementsDoc");

const routes = [
  //  announcements
  {
    method: "POST",
    url: "/api/schoolAnnouncement",
    handler: Announcement.createAnnouncement,
    schema: AnnoucementDocs.createAnnouncement
  },
  {
    method: "GET",
    url: "/api/schoolAnnouncement",
    handler: Announcement.getAllAnnouncements,
    schema: AnnoucementDocs.getAllAnnouncements
  },
  {
    method: "GET",
    url: "/api/schoolAnnouncement/:institution_id",
    handler: Announcement.getAnnouncement,
    schema: AnnoucementDocs.getAnnouncement
  },
  {
    method: "PUT",
    url: "/api/schoolAnnouncement/:id",
    handler: Announcement.updateAnnouncement,
    schema: AnnoucementDocs.updateAnnouncement
  },

  {
    method: "DELETE",
    url: "/api/schoolAnnouncement/:id",
    handler: Announcement.deleteAnnouncement,
    schema: AnnoucementDocs.deleteAnnouncement
  },
  {
    method: "GET",
    url: "/api/schoolAnnouncement/search",
    handler: Announcement.searchSchoolAnnouncement,
    schema: AnnoucementDocs.searchSchoolAnnouncement
  },
  {
    method: "POST",
    url: "/api/schoolAnnouncement/:id/read",
    handler: Announcement.markAnnouncementAsRead
  },
  {
    method: "DELETE",
    url: "/api/schoolAnnouncement/:id/read",
    handler: Announcement.markAnnouncementAsUnread
  },
  {
    method: "GET",
    url: "/api/schoolAnnouncement/unread-count",
    handler: Announcement.getUnreadCount
  },
  {
    method: "POST",
    url: "/api/schoolAnnouncement/mark-all-read",
    handler: Announcement.markAllAsRead
  }
];
module.exports = routes;
