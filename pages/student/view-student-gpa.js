import React from 'react';
import Layout from '../../components/Layout';
import fetch from 'isomorphic-unfetch';
import { protectPage } from '../../helpers/utils';
import { getStudentCoursesByParams } from '../../helpers/FetchWrapper';

class StudentGpaView extends React.Component {
  state = {
    studentgpa: this.props.studentGpa,
    studentcourses: this.props.studentCourseList
  };
  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ['STUDENT'];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );
    const { id } = query;
    //const id = 3;

    let studentGpa = await (
      await fetch(`${process.env.API_URL}/api/studentgpa/${id}`, {
        method: 'get',
        credentials: 'include',
        headers: req
          ? { cookie: req.headers.cookie }
          : {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
      })
    ).json();

    let filter_params = '?';

    filter_params = filter_params
      .concat('programme_id=')
      .concat(studentGpa.student.programme_id);
    filter_params = filter_params
      .concat('&level_id=')
      .concat(studentGpa.level_id);
    filter_params = filter_params
      .concat('&semester_position=')
      .concat(studentGpa.semester.position);

    let programmeCourseList = await (
      await fetch(
        `${process.env.API_URL}/api/programmecourse/search${filter_params}`,
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
    // retrieve course ids as an array
    let courseIds = [];
    programmeCourseList.filter(function(item) {
      if (item.course_id != null) {
        courseIds.push(item.course_id);
      }
      return courseIds;
    });

    let query_params = '';

    query_params = query_params
      .concat('semester_id=')
      .concat(studentGpa.semester_id);
    query_params = query_params
      .concat('&level_id=')
      .concat(studentGpa.level_id);
    query_params = query_params
      .concat('&student_id=')
      .concat(studentGpa.student_id);

    for (let i = 0; i < courseIds.length; i++) {
      query_params = query_params.concat('&course_id=').concat(courseIds[i]);
    }

    const getStudentCourses = await getStudentCoursesByParams(
      query_params,
      req
    );
    const studentCourseList = await getStudentCourses.json();

    return { studentGpa, studentCourseList, userData };
  };

  handleChange = e => {};
  handleSubmitClick = e => {};

  render() {
    return (
      <Layout pageTitle="View Student GPA" userData={this.props.userData}>
        <h3 className="all-caps semi-bold">View Student GPA</h3>

        <div className="card-body">
          <table className="table table-borderless table-condensed table-responsive-width">
            <tbody>
              <tr>
                <th className="v-align-middle">Semester</th>
                <td className="v-align-middle">
                  <p>{this.state.studentgpa.semester.name}</p>
                </td>
              </tr>
              <tr>
                <th className="v-align-middle">Level</th>
                <td className="v-align-middle">
                  <p>{this.state.studentgpa.level.name}</p>
                </td>
              </tr>

              <tr>
                <th className="v-align-middle">Prev TCP</th>
                <td className="v-align-middle">
                  <p>{this.state.studentgpa.prev_tcp}</p>
                </td>
              </tr>
              <tr>
                <th className="v-align-middle">Prev TNU</th>
                <td className="v-align-middle">
                  <p>{this.state.studentgpa.prev_tnu}</p>
                </td>
              </tr>
              <tr>
                <th className="v-align-middle">Prev GPA</th>
                <td className="v-align-middle">
                  <p>{this.state.studentgpa.prev_gpa}</p>
                </td>
              </tr>

              <tr>
                <th className="v-align-middle">Current TCP</th>
                <td className="v-align-middle">
                  <p>{this.state.studentgpa.current_tcp}</p>
                </td>
              </tr>
              <tr>
                <th className="v-align-middle">Current TNU</th>
                <td className="v-align-middle">
                  <p>{this.state.studentgpa.current_tnu}</p>
                </td>
              </tr>
              <tr>
                <th className="v-align-middle">Current GPA</th>
                <td className="v-align-middle">
                  <p>{this.state.studentgpa.current_gpa}</p>
                </td>
              </tr>

              <tr>
                <th className="v-align-middle">Cumulative TCP</th>
                <td className="v-align-middle">
                  <p>{this.state.studentgpa.cumulative_tcp}</p>
                </td>
              </tr>
              <tr>
                <th className="v-align-middle">Cumulative TNU</th>
                <td className="v-align-middle">
                  <p>{this.state.studentgpa.cumulative_tnu}</p>
                </td>
              </tr>
              <tr>
                <th className="v-align-middle">Cumulative GPA</th>
                <td className="v-align-middle">
                  <p>{this.state.studentgpa.cumulative_gpa}</p>
                </td>
              </tr>
            </tbody>
          </table>

          <legend>Registered Courses</legend>
          <table className="table table-responsive table-hover">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Course Unit</th>
                <th>Level</th>
                <th>Semester</th>
              </tr>
            </thead>
            <tbody>
              {this.state.studentcourses.length ? (
                this.state.studentcourses.map(studentcourse => (
                  <tr key={studentcourse.id}>
                    <td>{studentcourse.course.code}</td>

                    <td>{studentcourse.course.name}</td>
                    <td>{studentcourse.units}</td>

                    <td className="w-25">
                      <span className="fs-18">{studentcourse.level.name}</span>
                    </td>
                    <td className="w-25">
                      <span className="fs-18">
                        {studentcourse.semester.name}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>No records found</tr>
              )}
            </tbody>
          </table>
        </div>
      </Layout>
    );
  }
}
export default StudentGpaView;
