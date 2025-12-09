const courseAnnouncement = require("../controllers/courseAnnoucementController");
const AnnoucementDocs = require("../documentation/courseAnnouncementDoc");

const routes = [
  // Course announcements
  {
    method: "POST",
    url: "/api/courseAnnouncement",
    handler: courseAnnouncement.createAnnouncement,
    schema: AnnoucementDocs.createCourseAnnouncement
  },
  {
    method: "GET",
    url: "/api/courseAnnouncement",
    handler: courseAnnouncement.getAllAnnouncements,
    schema: AnnoucementDocs.getAllCourseAnnouncements
  },
  {
    method: "GET",
    url: "/api/courseAnnouncement/:id",
    handler: courseAnnouncement.getAnnouncement,
    schema: AnnoucementDocs.getCourseAnnouncement
  },
  {
    method: "PUT",
    url: "/api/courseAnnouncement/:id",
    handler: courseAnnouncement.updateAnnouncement,
    schema: AnnoucementDocs.updateCourseAnnouncement
  },

  {
    method: "DELETE",
    url: "/api/courseAnnouncement/:id",
    handler: courseAnnouncement.deleteAnnouncement,
    schema: AnnoucementDocs.deleteCourseAnnouncement
  }
];
module.exports = routes;
