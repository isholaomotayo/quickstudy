import React from "react";
import Layout from "../../components/Layout";
import Router from "next/router";
import { DatePicker } from "@fluentui/react";
import { initializeIcons } from "@fluentui/react";
import Select from "../../helpers/FixRequiredSelect";
import { getStudentByUserId } from "../../helpers/FetchWrapper";
import { protectPage } from "../../helpers/utils";
import createCloudinary from "../../helpers/createCloudinary";
import { FilePond, registerPlugin } from "react-filepond";
initializeIcons(/* optional base url */);

// Import FilePond styles

import "filepond/dist/filepond.min.css";
import "filepond-plugin-file-poster/dist/filepond-plugin-file-poster.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFilePoster from "filepond-plugin-file-poster";
import {
  getAllProgrammes,
  updateUserAvatar,
  updateStudentIdFile,
  updateStudent,
} from "../../helpers/FetchWrapper";
import states from "../../helpers/states";

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFilePoster
);

class ApplicantView extends React.Component {
  state = {
    student: this.props.student,
    programmes: this.props.programmes,
    imageUrl: this.props.student.user?.avatar,
    statesList: this.props.statesList,
    stateOfOrigin: this.props.student.state_origin || "",
    stateOfResidence: this.props.student.state_residence || "",
    lgaOfOrigin: this.props.student.lga_origin || "",
    lgaOfResidence: this.props.student.lga_residence || "",
  };
  _onSelectDate = (date) => {
    this.setState({ value: date });
  };

  _onFormatDate = (date) => {
    return (
      (date.getFullYear() % 100) +
      "-" +
      (date.getMonth() + 1) +
      "-" +
      date.getDate()
    );
  };

  _onParseDateFromString = (value) => {
    const date = this.state.value || new Date();
    const values = (value || "").trim().split("/");
    const day =
      values.length > 0
        ? Math.max(1, Math.min(31, parseInt(values[0], 10)))
        : date.getDate();
    const month =
      values.length > 1
        ? Math.max(1, Math.min(12, parseInt(values[1], 10))) - 1
        : date.getMonth();
    let year = values.length > 2 ? parseInt(values[2], 10) : date.getFullYear();
    if (year < 100) {
      year += date.getFullYear() - (date.getFullYear() % 100);
    }
    return new Date(year, month, day);
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

    let statesList = Object.keys(states);
    statesList = statesList.map((obj) => ({
      obj,
      label: obj,
      value: obj,
    }));
    let { programmes } = await getAllProgrammes(req);

    return { programmes, student, statesList, states };
  };
  handleDoB = (value) =>
    this.setState({
      student: { ...this.state.student, dob: value },
    });
  handleChange = (e, meta) => {
    let { name, value } = e != null && e.target ? e.target : { e, e };
    meta
      ? ((name = meta.name),
        (value =
          Array.isArray(e) && e != null
            ? e.reduce((t, c) => [...t, c.value], [])
            : e != null && e.value))
      : name;

    // const { name, value } = e.target;
    if (name == "state_origin") {
      // console.log(this.state.states[value]);
      this.setState({
        stateOfOrigin: value,
      });
    }
    if (name == "state_residence") {
      // console.log(this.state.states[value]);
      this.setState({
        stateOfResidence: value,
      });
    }
    this.setState({
      student: {
        ...this.state.student,
        [name]: value,
      },
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateStudent(this.state);

    // this.setState({
    //   student: result.updatedStudent
    // });
    Router.push(`/applicant/step-three`);
  };

  handleInit = () => {
    console.log("FilePond instance has initialised", this.pond);
  };

  render() {
    let lgaList = (
      this.state.stateOfOrigin !== ""
        ? states[this.state.stateOfOrigin]
        : states["Abia State"]
    ).map((obj) => ({
      obj,
      label: obj,
      value: obj,
    }));

    let lgaResidenceList = (
      this.state.stateOfResidence !== ""
        ? states[this.state.stateOfResidence]
        : states["Abia State"]
    ).map((obj) => ({
      obj,
      label: obj,
      value: obj,
    }));
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
                        <div className="col-xs-6 col-md-4">
                          {!this.state.student.status && (
                            <>
                              <legend>Upload Passport</legend>{" "}
                              <FilePond
                                files={
                                  this.state.student.user?.avatar
                                    ? [
                                        {
                                          // the server file reference
                                          source:
                                            this.state.student.user.avatar,

                                          // set type to local to indicate an already uploaded file
                                          options: {
                                            type: "limbo",
                                            metadata: {
                                              poster:
                                                this.state.student.user.avatar,
                                            },
                                          },
                                        },
                                      ]
                                    : null
                                }
                                required
                                ref={(ref) => (this.pond = ref)}
                                allowMultiple={false}
                                maxFiles={1}
                                server={createCloudinary(
                                  "emergingplatforms",
                                  "ilearn",
                                  "avatar", // tag for upload
                                  async (secure_url) => {
                                    //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend
                                    await updateUserAvatar(
                                      secure_url,
                                      this.state.student.user_id
                                    );
                                    this.setState({
                                      student: {
                                        ...this.state.student,
                                        user: {
                                          ...this.state.student.user,
                                          avatar: secure_url,
                                        },
                                      },
                                    });
                                  }
                                )}
                                oninit={() => this.handleInit()}
                              />
                            </>
                          )}
                        </div>
                        <div className="card-body">
                          <legend>Personal Details</legend>
                          <div className="row">
                            <div className="col-md-4">
                              <div className="form-group form-group-default">
                                <label>Surname</label>
                                <input
                                  type="text"
                                  name="last_name"
                                  className="form-control"
                                  defaultValue={
                                    this.state.student.user?.last_name
                                  }
                                  onChange={this.handleChange}
                                  readOnly
                                  required
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group form-group-default">
                                <label>First Name</label>
                                <input
                                  type="text"
                                  name="first_name"
                                  defaultValue={
                                    this.state.student.user.first_name
                                  }
                                  className="form-control"
                                  readOnly
                                  required
                                  onChange={this.handleChange}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group form-group-default">
                                <label>Middle name</label>
                                <input
                                  type="text"
                                  name="other_name"
                                  defaultValue={
                                    this.state.student.user.other_name
                                  }
                                  className="form-control"
                                  readOnly
                                  required
                                  onChange={this.handleChange}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-4">
                              <div className="form-group form-group-default">
                                <label>Email</label>
                                <input
                                  type="text"
                                  name="email"
                                  className="form-control"
                                  defaultValue={this.state.student.user.email}
                                  readOnly
                                  required
                                  onChange={this.handleChange}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group form-group-default">
                                <label>Phone</label>
                                <input
                                  type="text"
                                  name="phone"
                                  className="form-control"
                                  defaultValue={this.state.student.user.phone}
                                  readOnly
                                  required
                                  onChange={this.handleChange}
                                />
                              </div>
                            </div>{" "}
                            <div className="col-md-4">
                              <div>
                                <label>Date of Birth</label>
                                {process.browser && (
                                  <DatePicker
                                    value={
                                      this.state.student.dob
                                        ? new Date(this.state.student.dob)
                                        : ""
                                    }
                                    isRequired={true}
                                    placeholder="Select a date..."
                                    ariaLabel="Select a date"
                                    maxDate={new Date()}
                                    allowTextInput={true}
                                    onSelectDate={this.handleDoB}
                                    // formatDate={this._onFormatDate}
                                    parseDateFromString={
                                      this._onParseDateFromString
                                    }
                                  />
                                )}
                                {/* <input
                                  type="date"
                                  name="dob"
                                  defaultValue={
                                    this.state.student.dob
                                      ? this.state.student.dob.substr(0, 10)
                                      : this.state.student.dob
                                  }
                                  className="form-control"
                                  required
                                  onChange={this.handleChange}
                                  max={today}
                                /> */}
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-4">
                              <div className="form-group form-group-default">
                                <label>Gender</label>
                                <div
                                  // className="radio"
                                  style={{ display: "inline-flex" }}
                                >
                                  <label>
                                    <input
                                      required
                                      type="radio"
                                      name="gender"
                                      value="MALE"
                                      onChange={this.handleChange}
                                      checked={
                                        this.state.student.gender === "MALE"
                                      }
                                    />
                                    Male
                                  </label>

                                  <label>
                                    <input
                                      required
                                      type="radio"
                                      name="gender"
                                      value="FEMALE"
                                      onChange={this.handleChange}
                                      checked={
                                        this.state.student.gender === "FEMALE"
                                      }
                                    />
                                    Female
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-4">
                              <div className="form-group form-group-default">
                                <label>Marital Status</label>
                                <div
                                  // className="radio"
                                  style={{ display: "inline-flex" }}
                                >
                                  <label>
                                    <input
                                      required
                                      type="radio"
                                      name="marital_status"
                                      value="SINGLE"
                                      onChange={this.handleChange}
                                      checked={
                                        this.state.student.marital_status ===
                                        "SINGLE"
                                      }
                                    />
                                    Single
                                  </label>

                                  <label>
                                    <input
                                      required
                                      type="radio"
                                      name="marital_status"
                                      value="MARRIED"
                                      onChange={this.handleChange}
                                      checked={
                                        this.state.student.marital_status ===
                                        "MARRIED"
                                      }
                                    />
                                    Married
                                  </label>

                                  <label>
                                    <input
                                      required
                                      type="radio"
                                      name="marital_status"
                                      value="DIVORCED"
                                      onChange={this.handleChange}
                                      checked={
                                        this.state.student.marital_status ===
                                        "DIVORCED"
                                      }
                                    />
                                    Divorced
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group form-group-default">
                                <label>Employment Status</label>
                                <div
                                  // className="radio"
                                  style={{ display: "inline-flex" }}
                                >
                                  <label>
                                    <input
                                      required
                                      type="radio"
                                      name="employment_status"
                                      value="UNEMPLOYED"
                                      onChange={this.handleChange}
                                      checked={
                                        this.state.student.employment_status ===
                                        "UNEMPLOYED"
                                      }
                                    />
                                    UNEMPLOYED
                                  </label>

                                  <label>
                                    <input
                                      required
                                      type="radio"
                                      name="employment_status"
                                      value="EMPLOYED"
                                      onChange={this.handleChange}
                                      checked={
                                        this.state.student.employment_status ===
                                        "EMPLOYED"
                                      }
                                    />
                                    EMPLOYED
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            {/* 
                  <div className="col-md-4">
                    <div className="form-group form-group-default">
                      <label>Nationality</label>
                      <input
                        type="text"
                        name="nationality_id"
                        defaultValue={this.state.student.nationality_id}
                        className="form-control"
                        required
                        onChange={this.handleChange}
                      />
                    </div>
                  </div> */}

                            <div className="col-md-4">
                              <div
                                className="form-group form-group-default"
                                style={{ overflow: "visible" }}
                              >
                                <label>State of Origin (for Nigerians)</label>

                                <Select
                                  // isMulti
                                  options={this.state.statesList}
                                  name="state_origin"
                                  required
                                  onChange={this.handleChange}
                                  value={
                                    Array.isArray(
                                      this.state.student.state_origin
                                    )
                                      ? this.state.stateList.filter((p) =>
                                          this.state.student.state_origin.includes(
                                            p.id
                                          )
                                        )
                                      : this.state.statesList.filter(
                                          (p) =>
                                            p.value ==
                                            this.state.student.state_origin
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
                                <label>LGA of Origin (for Nigerians)</label>

                                <Select
                                  // isMulti
                                  options={lgaList}
                                  name="lga_origin"
                                  required
                                  onChange={this.handleChange}
                                  value={
                                    Array.isArray(this.state.student.lga_origin)
                                      ? lgaList.filter((p) =>
                                          this.state.student.lga_origin.includes(
                                            p.value
                                          )
                                        )
                                      : lgaList.filter(
                                          (p) =>
                                            p.value ==
                                            this.state.student.lga_origin
                                        )
                                  }
                                />

                                {/* <div className="button dropdown"> */}
                                {/* <select
                                    className="form-group form-group-default"
                                    name="lga_origin"
                                    onChange={this.handleChange}
                                    value={
                                      this.state.student.lga_origin
                                        ? this.state.student.lga_origin
                                        : ""
                                    }
                                  >
                                    <option>Select</option>

                                    {lgaList.length
                                      ? lgaList.map(lga => (
                                          <option key={lga} value={lga}>
                                            {lga}
                                          </option>
                                        ))
                                      : ""}
                                  </select> */}
                                {/* </div> */}
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-4">
                              <div
                                className="form-group form-group-default"
                                style={{ overflow: "visible" }}
                              >
                                <label>
                                  State of Residence (if in Nigeria)
                                </label>
                                <Select
                                  // isMulti
                                  options={this.state.statesList}
                                  name="state_residence"
                                  required
                                  onChange={this.handleChange}
                                  value={
                                    Array.isArray(
                                      this.state.student.state_residence
                                    )
                                      ? this.state.stateList.filter((p) =>
                                          this.state.student.state_residence.includes(
                                            p.id
                                          )
                                        )
                                      : this.state.statesList.filter(
                                          (p) =>
                                            p.value ==
                                            this.state.student.state_residence
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
                                <label>LGA of Residence (if in Nigeria)</label>

                                <Select
                                  // isMulti
                                  options={lgaResidenceList}
                                  name="lga_residence"
                                  required
                                  onChange={this.handleChange}
                                  value={
                                    Array.isArray(
                                      this.state.student.lga_residence
                                    )
                                      ? lgaResidenceList.filter((p) =>
                                          this.state.student.lga_residence.includes(
                                            p.value
                                          )
                                        )
                                      : lgaResidenceList.filter(
                                          (p) =>
                                            p.value ==
                                            this.state.student.lga_residence
                                        )
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-12">
                              <div className="form-group">
                                <label>
                                  Address
                                  {" {"}Apartment, House number, Street, City
                                  {"}"}
                                </label>
                                <textarea
                                  rows="4"
                                  name="address"
                                  defaultValue={this.state.student.address}
                                  className="form-control"
                                  onChange={this.handleChange}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          {!this.state.student.status && (
                            <div>
                              <legend>Upload Identification</legend>
                              <div className="row">
                                <div className="col-md-4">
                                  <FilePond
                                    files={
                                      this.state.student.id_card
                                        ? [
                                            {
                                              // the server file reference
                                              source:
                                                this.state.student.id_card,

                                              // set type to local to indicate an already uploaded file
                                              options: {
                                                type: "limbo",
                                                metadata: {
                                                  poster:
                                                    this.state.student.id_card,
                                                },
                                              },
                                            },
                                          ]
                                        : null
                                    }
                                    ref={(ref) => (this.pond = ref)}
                                    allowMultiple={false}
                                    maxFiles={1}
                                    server={createCloudinary(
                                      "emergingplatforms",
                                      "ilearn",
                                      "id card", // tag for upload
                                      async (secure_url) => {
                                        //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend
                                        await updateStudentIdFile(
                                          secure_url,
                                          this.state.student.id
                                        );
                                        this.setState({
                                          student: {
                                            ...this.state.student,
                                            id_card: secure_url,
                                          },
                                        });
                                      }
                                    )}
                                    oninit={() => this.handleInit()}
                                  />
                                  <span>
                                    Voter's Card, Internation Passport or
                                    Drivers Licence
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          {!this.state.student.status && (
                            <div>
                              <button
                                className="btn btn-info btn-cons m-t-10"
                                form="form1"
                                value="back"
                                onClick={() => Router.back()}
                              >
                                GO BACK
                              </button>
                              <button
                                type="submit"
                                className="btn btn-success btn-cons m-t-10"
                                value="Submit"
                              >
                                NEXT
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
