import Layout from "../../components/Layout";
import PlainCard from "../../components/PlainCard";
import { protectPage } from "../../helpers/utils";

const cards = {
  profile: {
    cardTitle: "Profile Management",
    cardClass: "widget-10 card no-border bg-white no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "My Profile",
    subheader: "Edit details and change password",
    actionUrl: "/admin/view?id=4",
    actionText: "View Profile",
  },
  staff: {
    cardTitle: "Staff",
    cardClass:
      "widget-10 card no-border bg-warning text-white no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "Manage Staff",
    subheader: "Manage all staff in the institution",
    actionUrl: "/admin/staff",
    actionText: "View Staff",
  },

  staffcourses: {
    cardTitle: "Staff Courses",
    cardClass:
      "widget-10 card no-border bg-complete text-white no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "Manage Staff Courses",
    subheader: "Manage all courses assigned staff",
    actionUrl: "/admin/staff-courses",
    actionText: "View Staff Courses",
  },
  fees: {
    cardTitle: "Fees ",
    cardClass:
      "widget-10 card no-border bg-info text-white no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "Fees Management",
    subheader: "Manage all fees in the institution",
    actionUrl: "/admin/fees",
    actionText: "View Fees",
  },
  institution: {
    cardTitle: "Institution Management",
    cardClass:
      "widget-10 card no-border bg-primary text-white no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "Manage Institution",
    subheader: "Edit institution information",
    actionUrl: "/admin/view-institution",
    actionText: "View Institution",
  },
  departments: {
    cardTitle: "Departments Management",
    cardClass:
      "widget-10 card no-border bg-primary text-white no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "Manage Departments",
    subheader: "Edit departmental information",
    actionUrl: "/admin/departments",
    actionText: "View Department",
  },
  faculties: {
    cardTitle: "Faculties Management",
    cardClass:
      "widget-10 card no-border bg-default no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "Faculties",
    subheader: "Manage all assigned courses assigned",
    actionUrl: "/admin/faculties",
    actionText: "Manage Faculties",
  },
  courses: {
    cardTitle: "Courses",
    cardClass: "widget-10 card no-border no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "All Courses",
    subheader: "Manage all Courses",
    actionUrl: "/admin/courses",
    actionText: "Manage Courses",
  },
  applicants: {
    cardTitle: "Applicants",
    cardClass:
      "widget-10 card no-border bg-info text-white no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "Manage Applicants",
    subheader: "Manage all students in the department",
    actionUrl: "/admin/applicants",
    actionText: "View Applicants",
  },
  students: {
    cardTitle: "Students",
    cardClass: "widget-10 card no-border no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "Manage Students",
    subheader: "Manage all students in the institution",
    actionUrl: "/admin/students",
    actionText: "View Students",
  },
  lms: {
    cardTitle: "Learning Management System",
    cardClass:
      "widget-10 card no-border bg-complete text-white no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "LMS Access",
    subheader: "Access to LMS for online learning",
    actionUrl: "/lms/courses",
    actionText: "Get Started",
  },
  results: {
    cardTitle: "Results Management",
    cardClass:
      "widget-10 card no-border bg-default no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "Student Results",
    subheader: "Manage course results and student gpas",
    actionUrl: "/admin/results",
    actionText: "View all",
  },
  programmes: {
    cardTitle: "Departmental Programmes",
    cardClass:
      "widget-10 card no-border bg-success text-white no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "Programmes",
    subheader: "Manage programmes in the institution",
    actionUrl: "/admin/programmes",
    actionText: "View all",
  },

  programmecourses: {
    cardTitle: "Programmes Courses",
    cardClass:
      "widget-10 card no-border bg-info text-white no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "Programme Courses",
    subheader: "Manage programme courses ",
    actionUrl: "/admin/programme-courses",
    actionText: "View all",
  },
  support: {
    cardTitle: "Help & Support",
    cardClass:
      "widget-10 card no-border bg-primary text-white no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "Portal Support",
    subheader: "Help documentation and support",
    actionUrl: "/admin/faq",
    actionText: "Get support",
  },
  announcement: {
    cardTitle: "Announcements",
    cardClass:
      "widget-10 card no-border bg-default no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "Announcements",
    subheader: "Important information in the institution",
    actionUrl: "/admin/announcement",
    actionText: "View all",
  },
  schoolCalendar: {
    cardTitle: "School Calendar",
    cardClass:
      "widget-10 card no-border bg-success text-white no-margin widget-loader-bar",
    titleIconClass: "fa fa-chevron-right",
    header: "School Calendar",
    subheader: "View the official school calendar",
    actionUrl: "/calendar",
    actionText: "View",
  },
};

const AdminHome = (props) => (
  <Layout
    pageTitle="ADMIN Dashboard"
    showBreadcrumb="false"
    userData={props.userData}
  >
    <PlainCard {...cards.profile} />
    <PlainCard {...cards.applicants} />
    <PlainCard {...cards.institution} />
    <PlainCard {...cards.faculties} />
    <PlainCard {...cards.departments} />

    <PlainCard {...cards.programmes} />
    <PlainCard {...cards.programmecourses} />
    <PlainCard {...cards.courses} />
    <PlainCard {...cards.fees} />
    <PlainCard {...cards.staff} />
    <PlainCard {...cards.staffcourses} />
    <PlainCard {...cards.students} />

    <PlainCard {...cards.lms} />
    <PlainCard {...cards.schoolCalendar} />
    <PlainCard {...cards.announcement} />
    <PlainCard {...cards.support} />
  </Layout>
);

AdminHome.getInitialProps = async ({ req, res, query }) => {
  const allowedRoles = ["ADMIN", "SUPERADMIN"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  return { userData };
};

export default AdminHome;
