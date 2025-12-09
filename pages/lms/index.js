// import Layout from '../../components/Layout'
// import StatCard from '../../components/StatCard'
// import HTabs from '../../components/HTabs'
// import Table from '../../components/Table'
// import { protectPage } from '../../helpers/utils'

// const mockCourses = [
//     {id: 1, programme_id: 1, name: 'Intro to Computer Engineering', code: 'CSC101'},
//     {id: 2, programme_id: 1, name: 'Intro to Data sciences', code: 'CSC103'},
//     {id: 3, programme_id: 1, name: 'Intro to Python programming', code: 'CSC105'},
//     {id: 4, programme_id: 2, name: 'Introduction to thermodynamics', code: 'CHE201'},
//     {id: 5, programme_id: 2, name: 'Fundamentals of Reaction Engineering', code: 'CHE205'}
// ]
// const courseTableCols = ['code', 'name']

// const stats = {
//     institutions: {
//         statName: 'Institutions',
//         statValue: 64,
//         iconClass: 'fa fa-institution',
//         iconColor: 'dodgerblue',
//         statUrl: '/lms/institutions'
//     },
//     courses: {
//         statName: 'Courses',
//         statValue: 812,
//         iconClass: 'fa fa-list',
//         iconColor: 'tomato',
//         statUrl: '/lms/courses'
//     },
//     students: {
//         statName: 'Students',
//         statValue: 536831,
//         iconClass: 'fa fa-users',
//         iconColor: '#10cfbd',
//         statUrl: '/lms/students'
//     }
// }

// const dataTabs = [
//     {tabId: 'courses', tabTitle: 'Courses', paneTitle: 'Recent Courses',
//         paneContent: <Table rows={mockCourses} tableCols={courseTableCols} hideDetails={true} />
//     },
//     {tabId: 'quizes', tabTitle: 'Quizes', paneTitle: 'Recent Quizes',
//         paneContent: 'Content for quiz pane'},
//     {tabId: 'forum', tabTitle: 'Forum', paneTitle: 'Recent Forum Activity',
//         paneContent: 'Content for forum pane'}
// ]

// const Home = props => {
//     // ???
//     return (
//         <Layout pageTitle='LMS' userData={props.userData}>
//             <div>
//                 <StatCard {...stats.institutions} />
//                 <StatCard {...stats.courses} />
//                 <StatCard {...stats.students} />
//             </div>
//             <HTabs tabs={dataTabs} defaultPane="courses" />
//         </Layout>
//     )
// }

// Home.getInitialProps = async ({ req, res }) => {
//     // Other roles will be added as page metrics are built
//     const allowedRoles = ['SUPERADMIN']
//     const {token, role, userId, userData} = protectPage(req, res, allowedRoles)

//     return { userData }
// };

// export default Home
import Course from "./course";
export default Course;
