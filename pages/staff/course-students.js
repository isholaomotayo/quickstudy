import React from "react";
import Layout from '../../components/Layout';

import { protectPage } from '../../helpers/utils';

class CourseStudents extends React.Component {
  state = {
    courseStudents: this.props.courseStudentsList,
    course: this.props.course
  };
  static getInitialProps = async context => {
    const { req, res, query } = context;
    const allowedRoles = ['LECTURER', 'STAFF'];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );
    const { course_id } = context.query;

    // retrieve course students
    let filter_params = '?';

    filter_params = filter_params.concat('course_id=').concat(course_id);

    let courseStudentsList = await (
      await fetch(`${process.env.API_URL}/api/studentcourse${filter_params}`, {
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

    console.log(course_id);

    let course = [];

    if (courseStudentsList.length) {
      course = courseStudentsList[0].course;
    } else {
      course = await (
        await fetch(`${process.env.API_URL}/api/course/${course_id}`, {
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
    }

    return { courseStudentsList, course, userData };
  };

  handleChange = e => {};
  handleSubmitClick = e => {};

  approveReg = e => {};

  render() {
    return (
      <Layout pageTitle="Course Students" userData={this.props.userData}>
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="card-title">
              <h4>Course Students</h4>
            </div>
          </div>
          <div className="card-body">
            <p>
              Course Registrations for {this.state.course.code}:{' '}
              {this.state.course.name}
            </p>
            <table className="table table-responsive table-hover">
              <thead>
                <tr>
                  <th>Student Reg No</th>
                  <th>Course Unit</th>
                  <th>Level</th>
                  <th>Approved</th>
                  <th>Semester</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input type="text" className="form-control"></input>
                  </td>

                  <td>
                    <input type="text" className="form-control"></input>
                  </td>

                  <td>
                    <input type="text" className="form-control"></input>
                  </td>

                  <td>
                    <select className="form-control">
                      <option value="">Select..</option>
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </td>

                  <td>
                    <select className="form-control">
                      <option value="">Select..</option>
                      <option>First Semester 2018/2029</option>
                      <option>Second Semester 2018/2019</option>
                      <option>First Semester 2019/2020</option>
                    </select>
                  </td>
                </tr>
                {this.state.courseStudents.length ? (
                  this.state.courseStudents.map(courseStudent => (
                    <tr>
                      <td>{courseStudent.student.reg_no}</td>
                      <td>{courseStudent.units}</td>
                      <td>{courseStudent.level.name}</td>
                      <td className="w-15">
                        <span className="fs-18">
                          {courseStudent.approval_status ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="w-25">
                        <span className="fs-18">
                          {courseStudent.semester.name}
                        </span>
                      </td>
                      <td>
                        {courseStudent.approval_status ? (
                          ''
                        ) : (
                          <a onclick={this.approveReg} className="">
                            Approve Registration
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>No Records found</tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    );
  }
}
export default CourseStudents;
