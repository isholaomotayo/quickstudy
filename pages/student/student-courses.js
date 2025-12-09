import React from "react";
import fetch from "isomorphic-unfetch";
import Layout from "../../components/Layout";
import { protectPage } from "../../helpers/utils";
import { getStudentByUserId } from "../../helpers/FetchWrapper";

const DeleteAction = (props) => {
  const isApproved = props.approval_status;
  if (isApproved) {
    return "";
  } else {
    return (
      <span className="fs-18 text-danger">
        <a
          title="Delete"
          onClick={() => {
            alert("Are you sure you want to delete this?");
            props.handleDeleteClick(props.id);
          }}
        >
          <i className="fa fa-trash" /> Delete
        </a>
      </span>
    );
  }
};

class StudentCourses extends React.Component {
  state = {
    studentcourses: this.props.studentCourses,
  };

  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );
    let studentCourses;

    try {
      // Optimized: Only fetch student ID instead of full student data with all relations
      const studentResponse = await fetch(
        `${process.env.API_URL}/api/student/userid/${userId}/minimal`,
        {
          method: "get",
          credentials: "include",
          headers: req
            ? { cookie: req.headers.cookie }
            : {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
        }
      );

      let student;
      if (studentResponse.status === 200) {
        student = await studentResponse.json();
      } else {
        // Fallback to original method if minimal endpoint doesn't exist
        const { student: fullStudent } = await getStudentByUserId(userId, req);
        student = { id: fullStudent.id };
      }

      const studentId = student.id;

      // Fetch student courses with optimized field selection
      studentCourses = await fetch(
        `${process.env.API_URL}/api/studentcourse/studentid/${studentId}?fields=minimal`,
        {
          method: "get",
          credentials: "include",
          headers: req
            ? { cookie: req.headers.cookie }
            : {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
        }
      );

      studentCourses =
        studentCourses.status === 200 ? await studentCourses.json() : [];
    } catch (e) {
      console.log(e);
      studentCourses = [];
    }

    return { studentCourses, userData };
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  handleSubmitClick = (e) => {
    fetch(`${process.env.API_URL}/api/studentcourse`, {
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        student_id: this.state.studentId,
        course_id: this.state.courseId,
        level_id: this.state.levelId,
        semester_id: this.state.semesterId,
        units: "2",
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        this.setState({
          successMessage: "New Course Registration is successful",
          studentcourses: [...this.state.studentcourses, json],
          courseId: "",
        });
      })
      .catch((e) => {
        console.log(e);
        return e;
      });
  };

  handleDeleteClick = (id) => {
    var studentCourseId = id;
    fetch(`${process.env.API_URL}/api/studentcourse/${studentCourseId}`, {
      method: "delete",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((response) => response.json())
      .then((json) => {
        // filter out deleted course registration from state
        var filter_studentcourses = this.state.studentcourses.filter(
          (item) => item.id != studentCourseId
        );

        this.setState({
          successMessage: "Course Registration has been successfully deleted",
          studentcourses: filter_studentcourses,
        });
      });
  };

  render() {
    return (
      <Layout pageTitle="Student Registrations" userData={this.props.userData}>
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="card-title">
              <h4>Student Registrations</h4>
            </div>
            <div className="pull-right">
              <div className="col-xs-12">
                <a
                  href="course-registration"
                  className="btn btn-success btn-cons text-white"
                >
                  <i className="fa fa-plus" /> Register Course
                </a>
              </div>
            </div>
            <div className="clearfix" />
          </div>
          <div className="card-body">
            <table className="table table-responsible table-hover">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Course Unit</th>
                  <th>Approved</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {this.state.studentcourses.map((studentcourse) => (
                  <tr key={studentcourse.id}>
                    <td>{studentcourse.course?.code || "N/A"}</td>
                    <td>{studentcourse.course?.name || "N/A"}</td>
                    <td>{studentcourse.units || "N/A"}</td>
                    <td className="w-15">
                      <span className="fs-18  text-danger">
                        {studentcourse.approval_status ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="w-15">
                      <DeleteAction
                        id={studentcourse.id}
                        approval_status={studentcourse.approval_status}
                        handleDeleteClick={this.handleDeleteClick}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    );
  }
}
export default StudentCourses;
