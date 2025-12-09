import navLinks from "./NavLinks";

// TODO

// COMPLETE BLOCKAGE.
// CHECK _APP.JS PAGE

const accessRights = {
  APPLICANT: ["/applicant", "/applicant/faq", "/signin?logout=1"],
  AFFILIATE: ["/affiliate/view", "/affiliate", "/signin?logout=1"],
  STUDENT: [
    "/student",
    "/student/view",
    "/student/student-courses",
    "/lms/courses",
    "/lms/learning-results",
    //"/student/payments",
    "/payments2",
    "/announcements",
    "/affiliate/view",
    "/affiliate",
    "/student/course-results",
    "/student/school-calendar",
    "/student/faq",
    "/forum",
    "/discussion-topic",
    "/discussion-comment",
    "/signin?logout=1",
  ],
  STAFF: [
    "/staff",
    "/staff/view",
    "/announcements",
    "/staff/my-courses",
    "/lms/courses",
    "/admin/payments",
    "/lms/learning-results",
    "/affiliate/view",
    "/affiliate",
    "/staff/school-calendar",
    "/staff/faq",
    "/staff/upload-results",
    "/signin?logout=1",
  ],
  HOD: ["/"],
  ADMIN: [
    "/admin",
    "/admin/view",
    "/announcements",
    "/report",
    "/admin/view-institution",
    "/admin/fees",
    // "/payments2",
    "/admin/staff",
    "/admin/session",
    "/admin/semester",
    "/admin/staff-courses",
    "/affiliate",
    "/admin/students",
    "/admin/applicants",
    "/lms/faculties",
    "/admin/payments",
    // "/admin/departments",
    // "/admin/programmes",
    // "/admin/courses",
    "/lms/courses",
    "/lms/learning-results",
    // "http://unnilearn.unn.edu.ng/",
    "/admin/school-calendar",
    "/admin/faq",
    "/admin/bulk-upload-results",
    "/signin?logout=1",
  ],
  SUPERADMIN: [
    "/admin",
    "/admin/view",
    "/announcements",
    "/report",
    "/admin/fees",
    "/admin/payments",
    //'/lms',
    "/lms/institutions",
    "/admin/self-institution",
    "/lms/courses",
    "/lms/learning-results",
    // "/lms/facilitators",
    // "/lms/students",
    "/affiliate",
    // "/lms/messages",
    "/admin/bulk-upload-results",
    "/signin?logout=1",
  ],
  DEFERRED: ["/student/view", "/student/faq", "/signin?logout=1"],
};

export const getAccessRights = (roleName) => {
  return accessRights[roleName] || [];
};

export const getAccessLinks = (roleName, a_status = "") => {
  const accessRights = getAccessRights(roleName);
  const accessLinks = [];

  if (accessRights.length)
    accessRights.forEach((url) => {
      if (navLinks[url]) {
        navLinks[url].href = url;
        accessLinks.push(navLinks[url]);
      }
    });

  if (roleName === "STUDENT" && a_status === "DEFERRED") {
    let tempAccessRights = getAccessRights(a_status);
    let tempAccessLinks = [];

    if (tempAccessRights.length)
      tempAccessRights.forEach((url) => {
        if (navLinks[url]) {
          navLinks[url].href = url;
          tempAccessLinks.push(navLinks[url]);
        }
      });

    return tempAccessLinks;
  }

  return accessLinks;
};
