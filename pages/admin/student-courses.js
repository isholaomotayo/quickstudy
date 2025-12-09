import React from "react";
import fetch from "isomorphic-unfetch";
import Layout from "../../components/Layout";
import Pagination from "../../components/Pagination";
import { protectPage, getTableData } from "../../helpers/utils";
import toast from "react-hot-toast";

const ApproveAction = (props) => {
  return (
    <span className="fs-18 text-success" style={{ cursor: "pointer" }}>
      <a
        title="Approve"
        onClick={() => {
          props.handleApprovedClick(props.id);
        }}
      >
        <i className="fa fa-check" /> Approve
      </a>
    </span>
  );
};

const sorter = (data) => {
  return data.sort((a, b) => {
    if (
      a.student.user.first_name.trim().toLowerCase() <
      b.student.user.first_name.trim().toLowerCase()
    ) {
      return -1;
    }
    if (
      a.student.user.first_name.trim().toLowerCase() >
      b.student.user.first_name.trim().toLowerCase()
    ) {
      return 1;
    }
    return 0;
  });
};

class StudentCourses extends React.Component {
  state = {
    studentcourses: this.props.studentCourses,
    search: "",
  };

  static getInitialProps = async ({ req, res, query, pathname }) => {
    const allowedRoles = ["ADMIN", "SUPERADMIN"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let [studentCourses, nothing, error, pagingData] = await getTableData(
      "student_course",
      "",
      query,
      [],
      false,
      req
    );
    studentCourses = sorter(studentCourses);

    return { studentCourses, userData, pathname, pagingData };
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
  handleApprovedClick = async (id) => {
    let data;

    try {
      data = await fetch(`${process.env.API_URL}/api/studentcourse/${id}`, {
        //mode: "no-cors",
        method: "put",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          approval_status: "1",
        }),
      });
      console.log(data);

      data = data.status === 200 ? await data.json() : {};

      if (Object.entries(data).length > 0) {
        let filteredStudent = this.state.studentcourses.filter(
          (val) => val.id !== id
        );

        console.log(data);

        filteredStudent = [...filteredStudent, data];
        filteredStudent = sorter(filteredStudent);

        toast.success("Course Registration has been successfully approved", {
          icon: "✅",
        });
        return this.setState({
          studentcourses: filteredStudent,
        });
      } else {
        toast.error("Course Registration Approval Failed");

        return;
      }
    } catch (e) {
      console.log(e);
    }
  };

  handleSearchChange = (e) => {
    this.setState({
      search: e.target.value,
    });
  };

  render() {
    const studentCoursesData = this.state.studentcourses.filter(
      (studentCourse) => {
        return (
          studentCourse.student.user.first_name
            .toLowerCase()
            .includes(this.state.search.toLowerCase()) ||
          studentCourse.student.user.last_name
            .toLowerCase()
            .includes(this.state.search.toLowerCase()) ||
          (studentCourse.student.reg_no &&
            studentCourse.student.reg_no
              .toLowerCase()
              .includes(this.state.search.toLowerCase())) ||
          studentCourse.course.code
            .toLowerCase()
            .includes(this.state.search.toLowerCase()) ||
          studentCourse.course.name
            .toLowerCase()
            .includes(this.state.search.toLowerCase())
        );
      }
    );

    return (
      <Layout pageTitle="Student Registrations" userData={this.props.userData}>
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="card-title">
              <h4>Student Registrations</h4>
            </div>
            <div className="col-sm-12 col-md-6">
              <form action="#" className="form-dark">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search for student by name, reg_no or a course by it's title or code"
                  onChange={this.handleSearchChange}
                />
              </form>
            </div>
            <div className="pull-right">
              <div className="col-xs-12">
                {/* <a
                  href="course-registration"
                  className="btn btn-success btn-cons text-white"
                >
                  <i className="fa fa-plus" /> Register Course
                </a> */}
              </div>
            </div>
            <div className="clearfix" />
          </div>
          <div className="card-body">
            <table className="table table-responsible table-hover">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Reg No</th>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Approved</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {this.state.studentcourses.length ? (
                  studentCoursesData.map((studentcourse) => (
                    <tr key={studentcourse.id}>
                      <td>
                        {studentcourse.student.user.first_name}{" "}
                        {studentcourse.student.user.last_name}{" "}
                      </td>
                      <td>{studentcourse.student.reg_no}</td>
                      <td>{studentcourse.course.code}</td>

                      <td>{studentcourse.course.name}</td>

                      <td className="w-15">
                        <span className="fs-18">
                          {studentcourse.approval_status ? "Yes" : "No"}
                        </span>
                      </td>
                      {/* 
                    <td className="w-25">
                      <span className="fs-18">{studentcourse.level.name}</span>
                    </td>
                    <td className="w-25">
                      <span className="fs-18">
                        {studentcourse.semester.name}
                      </span>
                    </td> */}

                      <td className="w-15">
                        {studentcourse.approval_status ? (
                          ""
                        ) : (
                          <ApproveAction
                            id={studentcourse.id}
                            handleApprovedClick={this.handleApprovedClick}
                          />
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="w-100">No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {this.props.pagingData &&
            this.props.pagingData.rowCount > studentCoursesData.length && (
              <Pagination
                total={+this.props.pagingData.rowCount}
                dataPerPage={+this.props.pagingData.pageSize}
                href={`${this.props.pathname}?pgsize=${+this.props.pagingData
                  .pageSize}&pg=`}
                currentPage={+this.props.pagingData.page}
              />
            )}
        </div>
      </Layout>
    );
  }
}

const ToastWrapper = (props) => {
  return <StudentCourses {...props} />;
};
ToastWrapper.getInitialProps = StudentCourses.getInitialProps;

export default ToastWrapper;
