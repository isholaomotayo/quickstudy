import React from "react";
import Layout from "../../components/Layout";
import fetch from "isomorphic-unfetch";
import { protectPage } from "../../helpers/utils";
import toast from "react-hot-toast";
import AssignStaffCourseModal from "../../components/staff/AssignStaffCourseModal";
import { postStaffCourse } from "../../helpers/FetchWrapper";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const DeleteAction = (props) => {
  return (
    <span className="fs-18 text-danger">
      <a
        title="Delete"
        onClick={() => {
          props.handleDeleteClick(props.id);
        }}
      >
        <i className="fa fa-trash" /> Delete
      </a>
    </span>
  );
};
class StaffCourses extends React.Component {
  state = {
    staffCourses: this.props.staffCourses,
    staffIds: [],
    courseIds: [],
  };
  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["ADMIN", "SUPERADMIN"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );
    let staffCourses = await (
      await fetch(`${process.env.API_URL}/api/staffcourse`, {
        method: "get",
        credentials: "include",
        headers: req
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
      })
    ).json();
    let allStaff = await fetch(`${process.env.API_URL}/api/staff`, {
      method: "get",
      credentials: "include",
      headers:
        req && req.headers && req.headers.cookie
          ? { cookie: req.headers.cookie }
          : {},
    });
    allStaff = allStaff.status == 200 ? await allStaff.json() : {};
    let staffList = allStaff.length
      ? allStaff.map((obj) => ({
          label: obj.user.last_name + " " + obj.user.first_name,
          value: obj.id,
        }))
      : [];

    let allCourses = await fetch(`${process.env.API_URL}/api/course`, {
      method: "get",
      credentials: "include",
      headers: req
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    });

    allCourses = allCourses.status == 200 ? await allCourses.json() : {};
    let courseList = allCourses.length
      ? allCourses.map((obj) => ({
          label: obj.code + " " + obj.name,
          value: obj.id,
        }))
      : [];

    return { staffCourses, staffList, courseList, userData };
  };
  handleStaffMultiChange = (option) => {
    this.setState({
      staffIds: option,
    });
  };

  handleCourseMultiChange = (option) => {
    this.setState({
      courseIds: option,
    });
  };

  handleAssignment = async () => {
    let staffIds = this.state.staffIds;
    staffIds = staffIds.map((x) => x.value);

    let courseIds = this.state.courseIds;
    courseIds = courseIds.map((x) => x.value);
    const postData = {
      staffIds: staffIds,
      courseIds: courseIds,
    };
    if (!courseIds.length || !staffIds.length) {
      toast.error("Kindly select atleast a staff and a course");
    } else {
      const response = await postStaffCourse(postData);
      const newStaffCourse =
        response.status == 200 ? await response.json() : {};
      if (newStaffCourse.id) {
        //staff profile successfully created
        this.setState({
          staffIds: [],
          courseIds: [],
        });
        toast.success("Course assignment successful.");
      } else {
        let msg =
          "An error occurred while assigning staff to course(s). Please check the details and try again";
        toast.error(msg);
      }
    }
  };
  handleDeleteClick = (id) => {
    var staffCourseId = id;

    confirmAlert({
      title: "Confirm Delete",
      message:
        "Are you sure you want to delete this item? By clicking “Delete” this item will be deleted and this action cannot be undone.",
      buttons: [
        {
          label: "Cancel",
          onClick: () => console.log(" not ready"),
        },
        {
          label: "Delete",
          onClick: () => {
            fetch(`${process.env.API_URL}/api/staffcourse/${staffCourseId}`, {
              //mode: "no-cors",
              method: "delete",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            })
              .then((response) => response.json())
              .then((json) => {
                // filter out deleted institution from institutions already saved in state
                var filter_staffcourses = this.state.staffCourses.filter(
                  (item) => item.id != staffCourseId
                );

                this.setState({
                  staffCourses: filter_staffcourses,
                });
                toast.success("Staff Course assignment successfully revoked.");
              });
          },
        },
      ],
    });
  };

  render() {
    return (
      <Layout pageTitle="My Courses" userData={this.props.userData}>
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="card-title">
              <h4>All Staff Courses</h4>
            </div>
            <div className="pull-right">
              <AssignStaffCourseModal
                handleAssignment={this.handleAssignment}
                handleCourseMultiChange={this.handleCourseMultiChange}
                handleStaffMultiChange={this.handleStaffMultiChange}
                state={this.state}
                allStaff={this.props.staffList}
                courses={this.props.courseList}
              />
            </div>
          </div>
          <div className="card-body">
            <table className="table table-responsible table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Staff Name</th>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Course Unit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {this.state.staffCourses.length ? (
                  this.state.staffCourses.map((staffCourse) => (
                    <tr key={staffCourse.id}>
                      <td className="w-15">{staffCourse.id}</td>
                      <td className="w-30">
                        {staffCourse.staff.user.first_name +
                          " " +
                          staffCourse.staff.user.last_name}
                      </td>
                      <td className="w-20">{staffCourse.course.code}</td>

                      <td className="w-30">{staffCourse.course.name}</td>
                      <td className="w-5">{staffCourse.course.units}</td>
                      <td className="w-15">
                        <DeleteAction
                          id={staffCourse.id}
                          handleDeleteClick={this.handleDeleteClick}
                        />
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

export default StaffCourses;
