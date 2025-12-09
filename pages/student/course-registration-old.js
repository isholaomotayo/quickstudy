import React from "react";
import Layout from '../../components/Layout';
import Checkbox from '../../components/Checkbox.js';
import Router from 'next/router';
import { protectPage } from '../../helpers/utils';
import {
  getStudentByUserId,
  getCourseById,
  getCurrentSemester,
  getStudentLevelId
} from '../../helpers/FetchWrapper';

class CourseRegistration extends React.Component {
  state = {
    courseList: this.props.courseList,
    student: this.props.student,
    studentId: this.props.studentId,
    currentSemesterId: this.props.currentSemesterId,
    semesterPosition: this.props.semesterPosition,
    currentLevelId: this.props.currentLevelId,
    checkedItems: new Map()
  };
  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ['STUDENT'];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    const { student } = await getStudentByUserId(userId, req);
    const studentId = student ? student.id : 0;
    const programmeId = student ? student.programme_id : 0;
    const semesterAdmittedId = student ? student.semester_admitted_id : 1;

    const { semester } = await getCurrentSemester(req);
    const currentSemesterId = semester ? semester.id : 1;
    const currentSessionId = semester ? semester.session_id : 1;

    const semesterPosition = semester ? semester.position : 1;
    const entryLevelId =
      student && student.entry_level_id ? student.entry_level_id : 1;

    const currentLevelId = await getStudentLevelId(
      semesterAdmittedId,
      currentSemesterId,
      entryLevelId,
      req
    );

    let studentCourses = await (
      await fetch(
        `${process.env.API_URL}/api/studentcourse/studentid/${studentId}`,
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

    //get programme courses by level
    let courseList = await (
      await fetch(
        `${process.env.API_URL}/api/programmecourse?programmeid=${programmeId}&semester_position=${semesterPosition}&level_id=${currentLevelId}`,
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

    return {
      studentCourses,
      courseList,
      student,
      studentId,
      currentSemesterId,
      semesterPosition,
      currentLevelId,
      userData
    };
  };

  handleChange = e => {
    const item = e.target.name;
    const isChecked = e.target.checked;
    this.setState(prevState => ({
      checkedItems: prevState.checkedItems.set(item, isChecked)
    }));
  };
  handleSubmitClick = async e => {
    let courses = this.state.checkedItems;

    for (const [key, value] of courses.entries()) {
      //console.log(key, value);
      if (value == true) {
        //register the course for the student
        let courseId = key;
        let { course } = await getCourseById(courseId);
        let courseUnit = course.units;

        fetch(`${process.env.API_URL}/api/studentcourse`, {
          method: 'post',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            student_id: this.state.studentId,
            course_id: courseId,
            semester_id: this.state.currentSemesterId,
            level_id: this.state.currentLevelId,
            units: courseUnit
          })
        });
      }
    }

    Router.push('/student/student-courses');
  };

  render() {
    return (
      <Layout
        pageTitle="New Course Registrations"
        userData={this.props.userData}
      >
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="card-title">
              <h4>New Course Registrations</h4>
              <span className="font-montserrat fs-18">
                First Semester 2019/2020
              </span>
            </div>
            <div className="pull-right">
              <div className="col-xs-12">
                <button
                  id="show-modal"
                  className="btn btn-success btn-cons"
                  onClick={this.handleSubmitClick}
                >
                  <i className="fa fa-plus" /> Submit
                </button>
              </div>
            </div>
            <div className="clearfix" />
          </div>
          <div className="card-body">
            <form>
              <p>
                Kindly register only courses relevant to your current semester.{' '}
              </p>
              <table className="table table-condensed table-responsive table-hover">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Course Unit</th>
                    <th>Programme</th>
                    <th>Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.courseList.length ? (
                    this.state.courseList.map(programmeCourse => (
                      <tr key={`${programmeCourse.course.id}`}>
                        <td>
                          <Checkbox
                            name={programmeCourse.course.id.toString()}
                            checked={this.state.checkedItems.get(
                              programmeCourse.course.id.toString()
                            )}
                            onChange={this.handleChange}
                          />
                        </td>
                        <td className="font-montserrat all-caps fs-12 w-50">
                          {programmeCourse.course.code}
                        </td>
                        <td className="font-montserrat all-caps fs-12 w-50">
                          {programmeCourse.course.name}
                        </td>
                        <td className="text-middle  w-15">
                          <span className="hint-text small">
                            {programmeCourse.course.units}
                          </span>
                        </td>
                        <td className="text-middle  w-15">
                          <span className="hint-text small">
                            {(programmeCourse.programme_id &&
                              programmeCourse.programme.name) ||
                              'All'}
                          </span>
                        </td>
                        <td className="text-middle  w-15">
                          <span className="hint-text small">
                            {(programmeCourse.level_id &&
                              programmeCourse.level.name) ||
                              'All'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>No records found</tr>
                  )}
                </tbody>
              </table>
            </form>
            <br />
            <div className="pull-left">
              <div className="col-xs-12">
                <button
                  id="show-modal"
                  className="btn btn-success btn-cons"
                  onClick={this.handleSubmitClick}
                >
                  <i className="fa fa-plus" /> Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}
export default CourseRegistration;
