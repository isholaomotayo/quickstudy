import React from "react";
import HodLayout from '../../components/HodLayout';
import fetch from 'isomorphic-unfetch';

class MyCourses extends React.Component {
  state = {
    staffCourses: this.props.staffCourses
  };
  static getInitialProps = async () => {
    // const { id } = context.query;
    const staffId = 2;

    return await fetch(
      `${process.env.API_URL}/api/staffcourse?staff_id=${staffId}`,
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
      .then(response => response.json())
      .then(json => {
        //console.log(json);
        return { staffCourses: json };
      })
      .catch(e => {
        console.log(e);
        return e;
      });
  };

  render() {
    return (
      <HodLayout pageTitle="My Courses">
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
      </HodLayout>
    );
  }
}
export default MyCourses;
