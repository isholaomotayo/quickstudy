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
      'widget-10 card no-border bg-default no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'Announcements',
    subheader: 'Important information in the institution',
    actionUrl: 'staff/announcement',
    actionText: 'View all'
  },
  schoolCalendar: {
    cardTitle: 'School Calendar',
    cardClass:
      'widget-10 card no-border bg-success text-white no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'School Calendar',
    subheader: 'View the official school calendar',
    actionUrl: 'staff/school-calendar',
    actionText: 'View all'
  }
};

const StaffHome = props => (
  <Layout
    pageTitle="Staff Dashboard"
    showBreadcrumb="false"
    userData={props.userData}
  >
    <PlainCard {...cards.profile} />

    <PlainCard {...cards.schoolCalendar} />
    <PlainCard {...cards.announcement} />
    <PlainCard {...cards.support} />
  </Layout>
);

StaffHome.getInitialProps = async ({ req, res, query }) => {
  const allowedRoles = ['STAFF'];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  return { userData };
};

export default StaffHome;
