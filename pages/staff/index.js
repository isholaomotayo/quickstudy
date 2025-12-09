import Layout from '../../components/Layout';
import PlainCard from '../../components/PlainCard';
import { protectPage } from '../../helpers/utils';

const cards = {
  profile: {
    cardTitle: 'Profile Management',
    cardClass: 'widget-10 card no-border bg-white no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'My Profile',
    subheader: 'Edit details and change password',
    actionUrl: 'staff/view',
    actionText: 'View Profile'
  },
  myCourses: {
    cardTitle: 'My Courses Management',
    cardClass:
      'widget-10 card no-border bg-complete text-white no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'My Courses',
    subheader: 'Manage all assigned courses assigned',
    actionUrl: 'staff/my-courses',
    actionText: 'Go to My Courses'
  },
  lms: {
    cardTitle: 'Learning Management System',
    cardClass:
      'widget-10 card no-border  bg-default no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'LMS Access',
    subheader: 'Access to LMS for online learning',
    actionUrl: 'lms/courses',
    actionText: 'Get Started'
  },
  results: {
    cardTitle: 'Results Management',
    cardClass:
      'widget-10 card no-border bg-default no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'Student Results',
    subheader: 'Manage course results and student gpas',
    actionUrl: 'staff/results',
    actionText: 'View all'
  },
  support: {
    cardTitle: 'Help & Support',
    cardClass:
      'widget-10 card no-border bg-primary text-white no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'Portal Support',
    subheader: 'Help documentation and support',
    actionUrl: 'staff/faq',
    actionText: 'Get support'
  },
  announcement: {
    cardTitle: 'Announcements',
    cardClass:
      'widget-10 card no-border  bg-success text-white no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'Announcements',
    subheader: 'Important information in the institution',
    actionUrl: 'announcements',
    actionText: 'View all'
  },
  schoolCalendar: {
    cardTitle: 'School Calendar',
    cardClass:
      'widget-10 card no-border bg-default no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'School Calendar',
    subheader: 'View the official school calendar',
    actionUrl: 'staff/school-calendar',
    actionText: 'View'
  }
};

const LecturerHome = props => (
  <Layout
    pageTitle="Staff Dashboard"
    showBreadcrumb="false"
    userData={props.userData}
  >
    <PlainCard {...cards.profile} />
    <PlainCard {...cards.myCourses} />
    <PlainCard {...cards.lms} />

    <PlainCard {...cards.announcement} />
    <PlainCard {...cards.support} />
    <PlainCard {...cards.schoolCalendar} />
  </Layout>
);

LecturerHome.getInitialProps = async ({ req, res, query }) => {
  const allowedRoles = ['LECTURER', 'STAFF'];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  return { userData };
};

export default LecturerHome;
