import HodLayout from '../../components/HodLayout';
import PlainCard from '../../components/PlainCard';


const cards = {
  profile: {
    cardTitle: 'Profile Management',
    cardClass: 'widget-10 card no-border bg-white no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'My Profile',
    subheader: 'Edit details and change password',
    actionUrl: 'hod/view?id=4',
    actionText: 'View Profile'
  },
  library: {
    cardTitle: 'Library Management',
    cardClass: 'widget-10 card no-border bg-info text-white no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'Online Library',
    subheader: 'Access to millions of online resources',
    actionUrl: 'http://oxforddictionary.com',
    actionText: 'Go to'
  },
  staff: {
    cardTitle: 'Staff',
    cardClass: 'widget-10 card no-border bg-warning text-white no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'Manage Staff',
    subheader: 'Manage all staff in the department',
    actionUrl: 'hod/staff',
    actionText: 'View Staff'
  },
  department: {
    cardTitle: 'Department Management',
    cardClass: 'widget-10 card no-border bg-primary text-white no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'Manage Department',
    subheader: 'Edit departmental information',
    actionUrl: 'hod/view-department',
    actionText: 'View Department'
  },
  myCourses: {
    cardTitle: 'My Courses Management',
    cardClass: 'widget-10 card no-border bg-default no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'My Courses',
    subheader: 'Manage all assigned courses assigned',
    actionUrl: 'hod/my-courses',
    actionText: 'Go to My Courses'
  },
  courses: {
    cardTitle: 'Departmental Courses',
    cardClass: 'widget-10 card no-border no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'All Courses',
    subheader: 'Manage all departmental courses',
    actionUrl: 'hod/courses',
    actionText: 'Manage Courses'
  },
  students: {
    cardTitle: 'Students',
    cardClass: 'widget-10 card no-border no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'Manage Students',
    subheader: 'Manage all students in the department',
    actionUrl: 'hod/students',
    actionText: 'View Students'
  },
  lms: {
    cardTitle: 'Learning Management System',
    cardClass: 'widget-10 card no-border bg-complete text-white no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'LMS Access',
    subheader: 'Access to LMS for online learning',
    actionUrl: 'lms',
    actionText: 'Get Started'
  },
  results: {
    cardTitle: 'Results Management',
    cardClass: 'widget-10 card no-border bg-default no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'Student Results',
    subheader: 'Manage course results and student gpas',
    actionUrl: 'hod/results',
    actionText: 'View all'
  },
  programmes: {
    cardTitle: 'Departmental Programmes',
    cardClass: 'widget-10 card no-border bg-success text-white no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'Programmes',
    subheader: 'Manage programmes in the department',
    actionUrl: 'hod/programmes',
    actionText: 'View all'
  },
  support: {
    cardTitle: 'Help & Support',
    cardClass: 'widget-10 card no-border bg-primary text-white no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'Portal Support',
    subheader: 'Help documentation and support',
    actionUrl: 'hod/faq',
    actionText: 'Get support'
  },
  announcement: {
    cardTitle: 'Announcements',
    cardClass: 'widget-10 card no-border bg-default no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'Announcements',
    subheader: 'Important information in the institution',
    actionUrl: 'hod/announcement',
    actionText: 'View all'
  },
  schoolCalendar: {
    cardTitle: 'School Calendar',
    cardClass: 'widget-10 card no-border bg-success text-white no-margin widget-loader-bar',
    titleIconClass: 'fa fa-chevron-right',
    header: 'School Calendar',
    subheader: 'View the official school calendar',
    actionUrl: 'hod/school-calendar',
    actionText: 'View'
  }
};

const HodHome = () => (
  <HodLayout pageTitle="Staff Dashboard" breadcrumb="false">
   
    
   <PlainCard {...cards.profile} />
    <PlainCard {...cards.department} />
    <PlainCard {...cards.myCourses} />
    <PlainCard {...cards.lms} />
    <PlainCard {...cards.staff} />

    <PlainCard {...cards.students} />
    <PlainCard {...cards.programmes} />
    <PlainCard {...cards.courses} />
    <PlainCard {...cards.results} />

    <PlainCard {...cards.schoolCalendar} />
    <PlainCard {...cards.announcement} />
    <PlainCard {...cards.support} />
  </HodLayout>
);

export default HodHome;
