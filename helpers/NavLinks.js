// Register all sidebar navlinks here
// Make sure keys (URLs) are unique
const navLinks = {
  // General Links
  "/": { label: "Home", iconClass: "pg-home" },
  "/signin?logout=1": { label: "Log Out", iconClass: "fa fa-sign-out" },

  // LMS Links
  //"/lms": { label: "LMS Dashboard", iconClass: "fa fa-briefcase" },
  "/lms/institutions": {
    label: "Institutions",
    iconClass: "fa fa-institution",
  },
  "/lms/faculties": {
    label: "Faculties",
    iconClass: "fa fa-address-book",
  },
  "/lms/courses": { label: "Learning", iconClass: "fa fa-list" },
  "/lms/learning-results": {
    label: "Learning Results",
    iconClass: "fa fa-check-square",
  },
  "/lms/facilitators": {
    label: "Facilitators",
    iconClass: "fa fa-graduation-cap",
  },
  "/lms/students": { label: "LMS Students", iconClass: "fa fa-users" },
  "/lms/pages": { label: "Pages", iconClass: "pg-layouts" },
  // "/lms/messages": { label: "Messages", iconClass: "fa fa-envelope"},

  //Live ilearn link
  "http://unnilearn.unn.edu.ng/": {
    label: "Learning",
    iconClass: "fa fa-list",
  },

  "/applicant": { label: "My Application", iconClass: "fa fa-user" },

  // "/affiliate/view": {
  //   label: "Affiliate Profile",
  //   iconClass: "fa fa-address-card",
  // },
  // "/affiliate": { label: "Affiliate Referrals", iconClass: "fa fa-share-alt" },

  "/payments2": { label: "Payments", iconClass: "fa fa-dollar" },

  "/applicant/faq": {
    label: "Help & Support",
    iconClass: "fa fa-question",
  },
  "/oer": {
    label: "Open Educational Resources",
    iconClass: "fa fa-book",
  },
  "/student": { label: "Home", iconClass: "pg-home" },

  "/student/view": { label: "My Profile", iconClass: "fa fa-user" },
  "/student/payments": { label: "Payments", iconClass: "fa fa-dollar" },
  "/student/student-courses": {
    label: "Course Registration",
    iconClass: "fa fa-book",
  },
  "/student/course-results": {
    label: "Results",
    iconClass: "fa fa-graduation-cap",
  },
  "/student/school-calendar": {
    label: "School Calendar",
    iconClass: "fa fa-calendar",
  },
  "/student/faq": { label: "Help & Support", iconClass: "fa fa-question" },

  "/admin": { label: "Home", iconClass: "pg-home" },
  "/admin/view": { label: "My Profile", iconClass: "fa fa-user" },
  "/admin/view-institution": {
    label: "My Institution",
    iconClass: "fa fa-institution",
  },
  "/admin/fees": { label: "Fees", iconClass: "fa fa-dollar" },
  "/admin/payments": {
    label: "Payment Management",
    iconClass: "fa fa-credit-card",
  },
  "/admin/self-institution": {
    label: "New Institution",
    iconClass: "fa fa-graduation-cap",
  },
  "/admin/staff": { label: "Staff", iconClass: "fa fa-address-book" },
  "/admin/staff-courses": {
    label: "Staff Courses",
    iconClass: "fa fa-asterisk",
  },
  "/admin/students": { label: "Students", iconClass: "fa fa-users" },
  "/admin/applicants": {
    label: "Applicants",
    iconClass: "fa fa-users",
  },
  "/admin/faculties": {
    label: "Faculties",
    iconClass: "fa fa-address-book",
  },
  "/admin/session": {
    label: "Session",
    iconClass: "fa fa-asterisk",
  },
  "/admin/semester": {
    label: "Semester",
    iconClass: "fa fa-book",
  },
  "/admin/departments": {
    label: "Departments",
    iconClass: "fa fa-address-book",
  },
  "/admin/programmes": { label: "Programmes", iconClass: "fa fa-list" },
  "/admin/courses": { label: "Courses", iconClass: "fa fa-th-list" },
  "/admin/school-calendar": {
    label: "School Calendar",
    iconClass: "fa fa-calendar",
  },
  "/admin/faq": {
    label: "Help & Support",
    iconClass: "fa fa-question",
  },
  "/staff": { label: "Home", iconClass: "pg-home" },
  "/staff/view": { label: "My Profile", iconClass: "fa fa-user" },
  "/staff/my-courses": {
    label: "My Courses",
    iconClass: "fa fa-book",
  },
  "/staff/school-calendar": {
    label: "School Calendar",
    iconClass: "fa fa-calendar",
  },
  "/staff/faq": {
    label: "Help & Support",
    iconClass: "fa fa-question",
  },

  "/forum": { label: "Forum", iconClass: "fa fa-commenting" },
  "/announcements": {
    label: "Announcements",
    iconClass: "fa fa-envelope",
  },
  "/report": {
    label: "Report",
    iconClass: "fa fa-bar-chart",
  },
  "/staff/upload-results": {
    label: "Upload Results",
    iconClass: "fa fa-upload",
  },
  "/admin/bulk-upload-results": {
    label: "Upload Results",
    iconClass: "fa fa-upload",
  },
};

export default navLinks;
