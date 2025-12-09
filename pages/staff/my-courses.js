import React from "react";
import Layout from '../../components/Layout';
import fetch from 'isomorphic-unfetch';
import { getStaffByUserId } from '../../helpers/FetchWrapper';
import { protectPage } from '../../helpers/utils';

class MyCourses extends React.Component {
  state = {
    staffCourses: this.props.staffCourses
  };
  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ['LECTURER', 'STAFF'];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );
    const { staff } = await getStaffByUserId(userId, req);
    const staffId = staff ? staff.id : 0;

    let staffCourses = await (
      await fetch(
        `${process.env.API_URL}/api/staffcourse?staff_id=${staffId}`,
        {
          method: 'get',
          credentials: 'include',
          headers: req
            ? { cookie: req.headers.cookie }
            : {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
        }
      )
    ).json();

    return { staffCourses, userData };
  };

  render() {
    return (
      <Layout pageTitle="My Courses" userData={this.props.userData}>
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="card-title">
              <h4>My Courses</h4>
            </div>
          </div>
          <div className="card-body">
            <table className="table table-hover table-responsive">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Course Unit</th>
                  <th>Semester</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {this.state.staffCourses.length ? (
                  this.state.staffCourses.map(staffCourse => (
                    <tr key={staffCourse.id}>
                      <td>{staffCourse.course.code}</td>

                      <td className="w-50">{staffCourse.course.name}</td>
                      <td>{staffCourse.course.units}</td>
                      <td>
                        <span className="fs-18">
                          {' '}
                          {staffCourse.course.semester_position === 1
                            ? 'First Semester'
                            : 'Second Semester'}
                        </span>
                      </td>
                      <td>
                        <a
                          href={`course-students?course_id=${staffCourse.course_id}`}
                        >
                          View Students
                        </a>
                      </td>
                      <td>
                        <a
                          href={`course-results?course_id=${staffCourse.course_id}`}
                        >
                          Upload Results
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>No records found</tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    );
  }
}
export default MyCourses;
