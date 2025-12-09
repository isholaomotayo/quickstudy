import React from "react";
import fetch from "isomorphic-unfetch";
import Layout from "../../components/Layout";
import { protectPage } from "../../helpers/utils";
import toast from "react-hot-toast";
const DeleteAction = (props) => {
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
};

class ProgrammeCourses extends React.Component {
  state = {
    programmecourses: this.props.programmeCourses,
  };

  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["ADMIN", "SUPERADMIN"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let programmeCourses = await (
      await fetch(`${process.env.API_URL}/api/programmecourse`, {
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

    return { programmeCourses, userData };
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  handleDeleteClick = async (id) => {
    var programmeCourseId = id;
    await fetch(
      `${process.env.API_URL}/api/programmecourse/${programmeCourseId}`,
      {
        method: "delete",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({}),
      }
    )
      .then((response) => response.json())
      .then((json) => {
        // filter out deleted institution from institutions already saved in state
        var filter_studentcourses = this.state.programmecourses.filter(
          (item) => item.id != programmeCourseId
        );

        toast.success("Programme Course has been successfully deleted");
        this.setState({
          programmecourses: filter_studentcourses,
        });
      });
  };

  render() {
    return (
      <Layout pageTitle="Programme Courses" userData={this.props.userData}>
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="card-title">
              <h4>Programme Courses</h4>
            </div>
            <div className="pull-right">
              <div className="col-xs-12">
                <a
                  href="add-programme-course"
                  className="btn btn-primary btn-cons text-white"
                >
                  <i className="fa fa-plus" /> Add Programme Course
                </a>
              </div>
            </div>
            <div className="clearfix" />
          </div>
          <div className="card-body">
            <table className="table table-responsive table-hover">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Course Unit</th>
                  <th>Programme</th>
                  <th>Level</th>
                  <th>Semester</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {this.state.programmecourses.length ? (
                  this.state.programmecourses.map((programmecourse) => (
                    <tr key={programmecourse.id}>
                      <td>{programmecourse.course.code}</td>

                      <td>{programmecourse.course.name}</td>

                      <td>{programmecourse.units}</td>

                      <td className="w-25">
                        <span className="fs-18">
                          {(programmecourse.programme_id &&
                            programmecourse.programme.name) ||
                            "All"}
                        </span>
                      </td>

                      <td className="w-25">
                        <span className="fs-18">
                          {(programmecourse.level_id &&
                            programmecourse.level.name) ||
                            "All"}
                        </span>
                      </td>

                      <td className="w-15">
                        <DeleteAction
                          id={programmecourse.id}
                          handleDeleteClick={this.handleDeleteClick}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    );
  }
}

export default ProgrammeCourses;
