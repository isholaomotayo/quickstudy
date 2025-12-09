// Import our LMS Routes

const institutionRoutes = require("./institutionRoutes");
const facultyRoutes = require("./facultyRoutes");
const departmentRoutes = require("./departmentRoutes");
const programmeRoutes = require("./programmeRoutes");
const programmeCourseRoutes = require("./programmeCourseRoutes");
const courseRoutes = require("./courseRoutes");
const courseModuleRoutes = require("./courseModuleRoutes");
const courseLessonRoutes = require("./courseLessonRoutes");
const courseTestRoutes = require("./courseTestRoutes");
const courseQuestionRoutes = require("./courseQuestionRoutes");
const courseProgressRoutes = require("./courseProgressRoutes");
const levelRoutes = require("./levelRoutes");
const studentTestRoutes = require("./studentTestRoutes");
const assignmentRoutes = require("./assignmentRoutes");

// Import our SIMS Routes
const staffRoutes = require("./staffRoutes");
const userRoutes = require("./userRoutes");
const studentRoutes = require("./studentRoutes");
const countryRoutes = require("./countryRoutes");
const stateRoutes = require("./stateRoutes");
const lgaRoutes = require("./lgaRoutes");
const titleRoutes = require("./titleRoutes");
const sessionRoutes = require("./sessionRoutes");
const semesterRoutes = require("./semesterRoutes");
const studentCourseRoutes = require("./studentCourseRoutes");
const staffCourseRoutes = require("./staffCourseRoutes");
const studentGpaRoutes = require("./studentGpaRoutes");
const studentResultRoutes = require("./studentResultRoutes");
const gradeRoutes = require("./gradeRoutes");
const classDegreeRoutes = require("./classDegreeRoutes");
const resultBatchRoutes = require("./resultBatchRoutes");
const feeRoutes = require("./feeRoutes");
const feeStudentRoutes = require("./feeStudentRoutes");
const feeStudentPaymentFrequencyRoutes = require("./feeStudentPaymentFrequencyRoutes");
const feeStudentPaymentRoutes = require("./feeStudentPaymentRoutes");
const payment2Routes = require("./payment2Routes");
const discussionRoutes = require("./discussionRoutes");

const forumRoutes = require("./forumRoutes");

const announcementRoutes = require("./announcementRoutes");

// Import Schema routes
const schemaRoutes = require("./schemaRoutes");

//import Authentication Routes
const authRoutes = require("./authRoutes");
const CourseAnnoucementsRoutes = require("./courseAnnouncements");
const paymentController = require("../controllers/paymentController");

const reportRoutes = require("./reportRoutes");
const supportRoutes = require("./supportRoutes");
const affiliateRoutes = require("./affiliateRoutes");
const defermentRoutes = require("./defermentRoutes");
const paymentPlanChange = require("./paymentPlanChange");
const rejectApplicantRoutes = require("./rejectApplicantRoutes");
const paymentAccountRoutes = require("./paymentAccountRoutes");
const selfInstitutionRoutes = require("./selfInstitutionRoutes");
const profileRoutes = require("./profileRoutes");

const routes = [
  {
    method: "POST",
    url: "/api/payment",
    handler: paymentController.paystackWebHook,
    //schema: paymentDoc.PaystackWebhook
  },
  ...affiliateRoutes,
  ...discussionRoutes,
  ...CourseAnnoucementsRoutes,
  ...announcementRoutes,
  ...forumRoutes,
  ...authRoutes,
  ...institutionRoutes,
  ...facultyRoutes,
  ...departmentRoutes,
  ...programmeRoutes,
  ...programmeCourseRoutes,
  ...courseRoutes,
  ...courseModuleRoutes,
  ...courseLessonRoutes,
  ...courseTestRoutes,
  ...courseQuestionRoutes,
  ...courseProgressRoutes,
  ...studentTestRoutes,
  ...assignmentRoutes,
  ...levelRoutes,
  ...classDegreeRoutes,
  ...countryRoutes,
  ...feeRoutes,
  ...feeStudentRoutes,
  ...feeStudentPaymentFrequencyRoutes,
  ...feeStudentPaymentRoutes,
  ...payment2Routes,
  ...gradeRoutes,
  ...lgaRoutes,
  ...resultBatchRoutes,
  ...semesterRoutes,
  ...sessionRoutes,
  ...staffRoutes,
  ...staffCourseRoutes,
  ...stateRoutes,
  ...studentRoutes,
  ...studentCourseRoutes,
  ...studentGpaRoutes,
  ...studentResultRoutes,
  ...titleRoutes,
  ...userRoutes,
  ...schemaRoutes,
  ...reportRoutes,
  ...supportRoutes,
  ...defermentRoutes,
  ...paymentPlanChange,
  ...rejectApplicantRoutes,
  ...paymentAccountRoutes,
  ...selfInstitutionRoutes,
  ...profileRoutes,
];

module.exports = routes;
