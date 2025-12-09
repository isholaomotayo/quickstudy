import React from "react";
import Layout from "../../components/Layout";
import Router from "next/router";
import { getAllProgrammes } from "../../helpers/FetchWrapper";

import { getStudentByUserId, updateStudent } from "../../helpers/FetchWrapper";
import { protectPage } from "../../helpers/utils";
import Select from "../../helpers/FixRequiredSelect";

class ApplicantView extends React.Component {
  state = {
    student: this.props.student,
    programmes: this.props.programmes,
  };

  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["APPLICANT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );
    // fetch student profile
    const { student } = await getStudentByUserId(userId, req);
    const studentId = student ? student.id : 0;

    let { programmes } = await getAllProgrammes(req);

    programmes = programmes.map((obj) => ({
      ...obj,
      label: obj.name,
      value: obj.id,
    }));

    return { programmes, student };
  };

  handleChange = (e, meta) => {
    let { name, value } = e != null && e.target ? e.target : { e, e };
    meta
      ? ((name = meta.name),
        (value =
          Array.isArray(e) && e != null
            ? e.reduce((t, c) => [...t, c.id], [])
            : e != null && e.id))
      : name;

    this.setState({
      student: {
        ...this.state.student,
        [name]: value,
      },
    });
  };

  handleCancel = async (e) => {
    e.preventDefault();

    Router.push(`/signin?logout=1`);
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateStudent(this.state);

    Router.push(`/applicant/step-two`);
  };

  render() {
    return (
      <Layout pageTitle="Student Details" showBreadcrumb={false}>
        <div>
          {/* START card */}

          <section className="">
            <div className="container">
              <div className="row ">
                <div
                  className="col-lg-12  mt-2 "
                  style={{ marginLeft: "auto", marginRight: "auto" }}
                >
                  <div className="card py-3 m-b-30">
                    <form onSubmit={this.handleSubmit}>
                      <fieldset disabled={this.state.student.status}>
                        <div className="card-header">
                          <legend>
                            Welcome {this.state.student.user?.first_name}
                          </legend>
                        </div>
                        <div className="card-body">
                          <p>
                            Please select a program below and click "Continue".
                          </p>
                          <div className="row">
                            <div className="col-md-4">
                              <div
                                className="form-group form-group-default"
                                style={{ overflow: "visible" }}
                              >
                                <label>Programme</label>
                                {/* {JSON.stringify(this.state.student.programme_id)} */}
                                {/* <div className="button dropdown">
                                <select
                                  className="form-group "
                                  name="programme_id"
                                  onChange={this.handleChange}
                                  value={this.state.student.programme_id}
                                >
                                  <option>Select</option>

                                  {this.state.programmes.length
                                    ? this.state.programmes.map(programme => (
                                        <option
                                          value={programme.id}
                                          key={programme.id}
                                        >
                                          {programme.name}
                                        </option>
                                      ))
                                    : ""}
                                </select>
                              </div> */}
                                <Select
                                  // isMulti
                                  options={this.state.programmes}
                                  name="programme_id"
                                  required
                                  onChange={this.handleChange}
                                  value={
                                    Array.isArray(
                                      this.state.student.programme_id
                                    )
                                      ? this.state.programmes.filter((p) =>
                                          this.state.student.programme_id.includes(
                                            p.id
                                          )
                                        )
                                      : this.state.programmes.filter(
                                          (p) =>
                                            p.id ==
                                            this.state.student.programme_id
                                        )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          {!this.state.student.status && (
                            <div>
                              <button
                                className="btn btn-danger btn-cons m-t-10"
                                form="form1"
                                value="Submit"
                                onClick={this.handleCancel}
                              >
                                Exit
                              </button>
                              <button
                                className="btn btn-success btn-cons m-t-10"
                                type="submit"
                                value="Submit"
                              >
                                Continue
                              </button>
                            </div>
                          )}
                        </div>
                      </fieldset>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* END card */}
        </div>
        {/* Popup for Edit Student Profile  */}
      </Layout>
    );
  }
}

export default ApplicantView;
