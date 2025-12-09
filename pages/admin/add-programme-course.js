import React from "react";
import Layout from "../../components/Layout";
import Checkbox from "../../components/Checkbox.js";
import Router from "next/router";
import { protectPage } from "../../helpers/utils";
import {
  getCourseById,
  getAllLevels,
  getAllProgrammes,
} from "../../helpers/FetchWrapper";

import Select from "../../helpers/FixRequiredSelect";
import toast from "react-hot-toast";
class CourseRegistration extends React.Component {
  state = {
    courseList: this.props.courseList,
    programmeId: "",
    levelId: "",
    checkedItems: new Map(),
  };
  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["ADMIN", "SUPERADMIN"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    //get ALL courses
    let courseList = await (
      await fetch(`${process.env.API_URL}/api/course`, {
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

    let { programmes } = await getAllProgrammes(req);
    programmes = programmes
      ? programmes.map((obj) => ({
          ...obj,
          label: obj.name,
          value: obj.id,
        }))
      : null;

    let { levels } = await getAllLevels(req);
    levels = levels
      ? levels.map((obj) => ({
          ...obj,
          label: obj.name,
          value: obj.id,
        }))
      : null;

    return { courseList, programmes, levels, userData };
  };
  handleInputChange = (e, meta) => {
    let { name, value } = e != null && e.target ? e.target : { e, e };
    meta
      ? ((name = meta.name),
        (value =
          Array.isArray(e) && e != null
            ? e.reduce((t, c) => [...t, c.id], [])
            : e != null && e.id))
      : name;

    this.setState({
      [name]: value,
    });
  };
  handleChange = (e) => {
    const item = e.target.name;
    const isChecked = e.target.checked;
    this.setState((prevState) => ({
      checkedItems: prevState.checkedItems.set(item, isChecked),
    }));
  };
  handleSubmitClick = async (e) => {
    let courses = this.state.checkedItems;

    for (const [key, value] of courses.entries()) {
      //console.log(key, value);
      if (value == true) {
        //register the course for the student
        let courseId = key;
        let { course } = await getCourseById(courseId);
        let courseUnit = course.units;

        let payload = {
          course_id: courseId,
          units: courseUnit,
        };
        if (this.state.programmeId)
          payload.programme_id = this.state.programmeId;

        if (this.state.levelId) payload.level_id = this.state.levelId;

        fetch(`${process.env.API_URL}/api/programmecourse`, {
          method: "post",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify(payload),
        });
      }
    }

    toast.success("Programme Course(s) have been successfully added");

    Router.push("/admin/programme-courses");
  };

  render() {
    return (
      <Layout pageTitle="New Programme Course" userData={this.props.userData}>
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="card-title">
              <h4>Add Course to Programme</h4>
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
              <div className="row">
                <div className="col-md-4">
                  <div
                    className="form-group form-group-default"
                    style={{ overflow: "visible" }}
                  >
                    <label>Programme</label>
                    <Select
                      // isMulti
                      options={this.props.programmes}
                      name="programmeId"
                      onChange={this.handleInputChange}
                      value={
                        Array.isArray(this.state.programmeId)
                          ? this.props.programmes.filter((p) =>
                              this.state.programmeId.includes(p.id)
                            )
                          : this.props.programmes.filter(
                              (p) => p.id == this.state.programmeId
                            )
                      }
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div
                    className="form-group form-group-default"
                    style={{ overflow: "visible" }}
                  >
                    <label>Level</label>
                    <Select
                      // isMulti
                      options={this.props.levels}
                      name="levelId"
                      onChange={this.handleInputChange}
                      value={
                        Array.isArray(this.state.levelId)
                          ? this.props.levels.filter((p) =>
                              this.state.levelId.includes(p.id)
                            )
                          : this.props.levels.filter(
                              (p) => p.id == this.state.levelId
                            )
                      }
                    />
                  </div>
                </div>
              </div>
              <table className="table table-condensed table-responsive table-hover">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Course Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.courseList.length ? (
                    this.state.courseList.map((course) => (
                      <tr key={`${course.id}`}>
                        <td>
                          <Checkbox
                            name={course.id.toString()}
                            checked={this.state.checkedItems.get(
                              course.id.toString()
                            )}
                            onChange={this.handleChange}
                          />
                        </td>
                        <td className="font-montserrat all-caps fs-12 w-50">
                          {course.code}
                        </td>
                        <td className="font-montserrat all-caps fs-12 w-50">
                          {course.name}
                        </td>
                        <td className="text-middle  w-15">
                          <span className="hint-text small">
                            {course.units}
                          </span>
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
