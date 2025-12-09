//endpoints and routes for all staff
const report = require("../controllers/reportController");
const reportDoc = require("../documentation/reportDoc");

const routes = [
  {
    method: "GET",
    url: "/api/report",
    handler: report.getAllReports,
    schema: reportDoc.getAllReports,
  },
  {
    method: "GET",
    url: "/api/report/:institution_id",
    handler: report.getReportById,
    schema: reportDoc.getReportById,
  },
  {
    method: "GET",
    url: "/api/report/analytics/:institution_id",
    handler: report.getAnalytics,
    schema: reportDoc.getAnalytics,
  },
  {
    method: "GET",
    url: "/api/report/weekly",
    handler: report.getWeeklyReports,
    schema: reportDoc.getWeeklyReports,
  },
];

module.exports = routes;
