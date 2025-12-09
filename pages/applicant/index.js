import React from "react";
import fetch from "isomorphic-unfetch";
import Router from "next/router";
import Layout from "../../components/Layout";
import ChangePasswordModal, {
  updatePassword,
} from "../../components/ChangePasswordModal";
import { getStudentByUserId, updateStudent } from "../../helpers/FetchWrapper";
import { protectPage } from "../../helpers/utils";
import StepOne from "./step-one";
import StepTwo from "./step-two";
import StepThree from "./step-three";
import { getAllProgrammes, getStudentById } from "../../helpers/FetchWrapper";

import states from "../../helpers/states";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs().format();
dayjs.extend(relativeTime);

class ApplicantView extends React.Component {
  state = {
    student: this.props.student,
  };

  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["APPLICANT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );
    let { programmes } = await getAllProgrammes(req);

    programmes = programmes
      ? programmes.map((obj) => ({
          ...obj,
          label: obj.name,
          value: obj.id,
        }))
      : null;

    let statesList = Object.keys(states);
    statesList = statesList.map((obj) => ({
      obj,
      label: obj,
      value: obj,
    }));

    // fetch student profile
    const { student } = await getStudentByUserId(userId, req);
    const studentId = student ? student.id : 0;

    if (student && student.status == false) {
      if (res) {
        res.writeHead(302, {
          Location: `/applicant/step-one?id=${studentId}`,
        });
        res.end();
      } else {
        Router.push(`/applicant/step-one?id=${studentId}`);
      }
    }
    return { student, programmes, statesList };
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      student: {
        ...this.state.student,
        [name]: value,
      },
    });
  };

  handleSubmit = async (e) => {
    const result = await updateStudent(this.state);

    this.setState({
      student: result.updatedStudent,
    });
  };

  handleSubmitPassword = async (e) => {
    const userData = {
      user_id: this.state.student.user_id,
      current_password: this.state.student.current_password,
      new_password: this.state.student.password,
      confirm_password: this.state.student.confirm_password,
    };
    const result = await updatePassword(userData);
  };

  render() {
    return (
      <Layout pageTitle="Student Details" showBreadcrumb={false}>
        <div className="page-container">
          <div className="card card-transparent">
            <div className="card-body"></div>
            <section className="">
              <div className="container">
                <div className="row ">
                  <div
                    className="col-lg-12  mt-2 "
                    style={{ marginLeft: "auto", marginRight: "auto" }}
                  >
                    <div className="card py-3 m-b-30">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-10">
                            <div
                              className="form-group form-group-default"
                              style={{ overflow: "visible" }}
                            >
                              <p>
                                Admission Status:{" "}
                                {this.state.student.status ? (
                                  <strong>Processing Admission</strong>
                                ) : null}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <StepOne
          student={this.props.student}
          programmes={this.props.programmes}
        />
        <StepTwo
          student={this.props.student}
          programmes={this.props.programmes}
          statesList={this.props.statesList}
        />
        <StepThree
          student={this.props.student}
          programmes={this.props.programmes}
          statesList={this.props.statesList}
        />
        <style>{`
        
          .header {
            display: none;
          }
        `}</style>
      </Layout>
    );
  }
}

export default ApplicantView;
