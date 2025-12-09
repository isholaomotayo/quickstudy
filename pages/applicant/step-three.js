import React from "react";
import Layout from "../../components/Layout";
import Router from "next/router";
import Select from "../../helpers/FixRequiredSelect";
import { DatePicker } from "@fluentui/react";
import { initializeIcons } from "@fluentui/react";
import { confirmAlert } from "react-confirm-alert"; // Import
// Import css

import Documents from "../../components/displayImages";

initializeIcons(/* optional base url */);

import toast from "react-hot-toast";
import { protectPage } from "../../helpers/utils";
import {
  getAllProgrammes,
  updateStudentCertFile,
  getStudentByUserId,
  updateStudent,
} from "../../helpers/FetchWrapper";
import states from "../../helpers/states";

import createCloudinary from "../../helpers/createCloudinary";
import { FilePond, registerPlugin } from "react-filepond";
// Import FilePond styles
import "filepond/dist/filepond.min.css";
import "filepond-plugin-file-poster/dist/filepond-plugin-file-poster.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFilePoster from "filepond-plugin-file-poster";
import "react-confirm-alert/src/react-confirm-alert.css";
// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFilePoster
);

function get_url_extension(url = "") {
  return url ? url.split(/\#|\?/)[0].split(".").pop().trim() : "";
}

// const renderImages = student => {
//   const value = [];
//   student.inst_cert !== null &&
//     student.inst_cert.forEach(url => {
//       const image =
//         get_url_extension(url) === "pdf"
//           ? "https://img.icons8.com/plasticine/2x/document.png"
//           : url;

//       value.push({
//         src: image,
//         link: url,
//         name: "Institution certificate"
//       });
//     });

//   return value;
// };

class ApplicationStepThree extends React.Component {
  state = {
    student: this.props.student,
    programmes: this.props.programmes,
    // imageUrl: this.props.student.user.avatar,
    statesList: this.props.statesList,
    stateOfOrigin: "",
    stateOfResidence: "",
    gradeList: [
      "First Class",
      "Second Class Upper",
      "Second Class Lower",
      "Third Class",
      "Upper Credit",
      "Lower Credit",
      "Distinction",
      "Merit",
      "Pass",
    ].map((obj) => ({
      obj,
      label: obj,
      value: obj,
    })),
    degreeList: [
      "BSc",
      "MSc",
      "HND",
      "B.A",
      "B.ENG",
      "B.PHARM",
      "BSc (ED)",
      "MBBS",
      "B.TECH",
    ].map((obj) => ({
      obj,
      label: obj,
      value: obj,
    })),
    instTypeList: ["University", "Polytechnic", "College of Education"].map(
      (obj) => ({
        obj,
        label: obj,
        value: obj,
      })
    ),
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
    const studentId = student ? student.id : 0;

    let { programmes } = await getAllProgrammes(req);

    return { programmes, student, states };
  };

  handleDoG = (value) =>
    this.setState({
      student: { ...this.state.student, grad_year: value },
    });

  handleChange = (e, meta) => {
    let { name, value } = e != null && e.target ? e.target : { e, e };
    meta
      ? ((name = meta.name),
        (value =
          Array.isArray(e) && e != null
            ? e.reduce((t, c) => [...t, c.value], [])
            : e != null && e.value))
      : value;

    // const { name, value } = e.target;
    if (name == "state_origin") {
      this.setState({
        stateOfOrigin: value,
      });
    }
    if (name == "state_residence") {
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
  saveApplication = async (e) => {
    e.preventDefault();
    this.setState(
      {
        student: {
          ...this.state.student,
          status: false,
        },
      },
      async (prevState) => {
        const result = await updateStudent(this.state);

        toast.success(
          "Your Application has been saved. you can continue to edit your application until you are ready to submit it"
        );
      }
    );
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    confirmAlert({
      title: "Submit Your Application",
      message:
        "By clicking “SUBMIT APPLICATION” you agree to be bound by the Terms & Conditions of the chosen Programme - as the Institution Admission Review Board reviews your application. After submitting, you will no longer be able to edit your application.",
      buttons: [
        {
          label: "Not Ready to Submit",
          onClick: () => console.log(" not ready"),
        },
        {
          label: "Submit Application",
          onClick: () => {
            this.setState(
              {
                student: {
                  ...this.state.student,
                  status: true,
                },
              },
              async (prevState) => {
                const result = await updateStudent(this.state);

                toast.success(
                  "Your Application has been submitted. Further instructions would be communicated via email",
                  { duration: 6000 }
                );
                Router.push(`/applicant/`);
              }
            );
          },
        },
      ],
    });
  };

  handleInit = () => {
    console.log("FilePond instance has initialised", this.pond);
  };
  render() {
    const value =
      this.state.student.inst_cert !== null
        ? this.state.student.inst_cert.map((url) => {
            const image =
              get_url_extension(url) === "pdf"
                ? "https://img.icons8.com/plasticine/2x/document.png"
                : url;

            return {
              src: image,
              link: url,
              name: "Institution certificate",
            };
          })
        : [];

    const required =
      this.state.student.inst_cert === null
        ? true
        : !!this.state.student.inst_cert &&
          this.state.student.inst_cert.length > 0
        ? false
        : true;

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
                        <div className="card-body">
                          <legend>Academic History</legend>
                          <div className="row">
                            <div className="col-md-4">
                              <div className="form-group form-group-default">
                                <label>Name of Institution</label>
                                <input
                                  required
                                  type="text"
                                  name="inst_name"
                                  className="form-control"
                                  defaultValue={this.state.student.inst_name}
                                  onChange={this.handleChange}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div
                                className="form-group form-group-default"
                                style={{ overflow: "visible" }}
                              >
                                <label>Type of Institution</label>

                                <Select
                                  // isMulti
                                  options={this.state.instTypeList}
                                  name="inst_type"
                                  required
                                  onChange={this.handleChange}
                                  value={
                                    Array.isArray(this.state.student.inst_type)
                                      ? this.state.instTypeList.filter((p) =>
                                          this.state.student.inst_type.includes(
                                            p.value
                                          )
                                        )
                                      : this.state.instTypeList.filter(
                                          (p) =>
                                            p.value ==
                                            this.state.student.inst_type
                                        )
                                  }
                                />
                                {/* <div className="button dropdown"> */}
                                {/* <select
                                    className="form-group form-group-default"
                                    name="inst_type"
                                    onChange={this.handleChange}
                                    value={this.state.student.inst_type}
                                  >
                                    <option>Select</option>

                                    {this.state.instTypeList.length
                                      ? this.state.instTypeList.map(
                                          instType => (
                                            <option
                                              value={instType}
                                              key={instType}
                                            >
                                              {instType}
                                            </option>
                                          )
                                        )
                                      : ""}
                                  </select> */}
                                {/* </div> */}
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group form-group-default">
                                <label>Course of Study</label>
                                <input
                                  type="text"
                                  name="course_studied"
                                  defaultValue={
                                    this.state.student.course_studied
                                  }
                                  className="form-control"
                                  required
                                  onChange={this.handleChange}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-4">
                              <div
                                className="form-group form-group-default"
                                style={{ overflow: "visible" }}
                              >
                                <label>Type of Degree</label>
                                <Select
                                  // isMulti
                                  options={this.state.degreeList}
                                  name="type_degree"
                                  required
                                  onChange={this.handleChange}
                                  value={
                                    Array.isArray(
                                      this.state.student.type_degree
                                    )
                                      ? this.state.degreeList.filter((p) =>
                                          this.state.student.type_degree.includes(
                                            p.value
                                          )
                                        )
                                      : this.state.degreeList.filter(
                                          (p) =>
                                            p.value ==
                                            this.state.student.type_degree
                                        )
                                  }
                                />
                                {/* <div className="button dropdown"> */}
                                {/* <select
                                    className="form-group form-group-default"
                                    name="type_degree"
                                    onChange={this.handleChange}
                                    value={this.state.student.type_degree}
                                  >
                                    <option>Select</option>

                                    {this.state.degreeList.length
                                      ? this.state.degreeList.map(degree => (
                                          <option value={degree} key={degree}>
                                            {degree}
                                          </option>
                                        ))
                                      : ""}
                                  </select> */}
                                {/* </div> */}
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div
                                className="form-group form-group-default"
                                style={{ overflow: "visible" }}
                              >
                                <label>Grade</label>
                                <Select
                                  // isMulti
                                  options={this.state.gradeList}
                                  name="degree_grade"
                                  required
                                  onChange={this.handleChange}
                                  value={
                                    Array.isArray(
                                      this.state.student.degree_grade
                                    )
                                      ? this.state.gradeList.filter((p) =>
                                          this.state.student.degree_grade.includes(
                                            p.value
                                          )
                                        )
                                      : this.state.gradeList.filter(
                                          (p) =>
                                            p.value ==
                                            this.state.student.degree_grade
                                        )
                                  }
                                />

                                {/* <div className="button dropdown">
                                  <select
                                    className="form-group form-group-default"
                                    name="degree_grade"
                                    onChange={this.handleChange}
                                    value={this.state.student.degree_grade}
                                  >
                                    <option>Select</option>

                                    {this.state.gradeList.length
                                      ? this.state.gradeList.map(grade => (
                                          <option value={grade} key={grade}>
                                            {grade}
                                          </option>
                                        ))
                                      : ""}
                                  </select>
                                </div> */}
                              </div>
                            </div>{" "}
                            <div className="col-md-4">
                              <div className="form-group form-group-default">
                                <label>Year of Graduation</label>

                                {process.browser && (
                                  <DatePicker
                                    value={
                                      this.state.student.grad_year
                                        ? new Date(this.state.student.grad_year)
                                        : ""
                                    }
                                    isRequired={true}
                                    placeholder="Select a date..."
                                    ariaLabel="Select a date"
                                    maxDate={new Date()}
                                    allowTextInput={true}
                                    onSelectDate={this.handleDoG}
                                    // formatDate={this._onFormatDate}
                                    parseDateFromString={
                                      this._onParseDateFromString
                                    }
                                  />
                                )}
                                {/* <input
                                  type="date"
                                  name="grad_year"
                                  defaultValue={this.state.student.grad_year}
                                  className="form-control"
                                  required
                                  onChange={this.handleChange}
                                /> */}
                              </div>
                            </div>
                          </div>
                          {!this.state.student.status && (
                            <div>
                              <legend>
                                Upload One or More Certificate Obtained
                              </legend>
                              <div className="row">
                                <div className="col-md-4">
                                  <FilePond
                                    required={required}
                                    // files={
                                    //   this.state.student.inst_cert &&
                                    //   this.state.student.inst_cert.map(url => ({
                                    //     // the server file reference
                                    //     source: url,

                                    //     // set type to local to indicate an already uploaded file
                                    //     options: {
                                    //       type: "limbo",
                                    //       metadata: {
                                    //         poster: url
                                    //       }
                                    //     }
                                    //   }))
                                    //   // ? [
                                    //   //     {
                                    //   //       // the server file reference
                                    //   //       source: this.state.student
                                    //   //         .inst_cert[0],

                                    //   //       // set type to local to indicate an already uploaded file
                                    //   //       options: {
                                    //   //         type: "limbo",
                                    //   //         metadata: {
                                    //   //           poster: this.state.student
                                    //   //             .inst_cert[0]
                                    //   //         }
                                    //   //       }
                                    //   //     }
                                    //   //   ]
                                    //   // : null
                                    // }
                                    ref={(ref) => (this.pond = ref)}
                                    allowMultiple={true}
                                    // maxFiles={1}
                                    server={createCloudinary(
                                      "emergingplatforms",
                                      "ilearn",
                                      "Higher Institution Certificate", // tag for upload
                                      async (secure_url) => {
                                        //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend

                                        this.setState({
                                          student: {
                                            ...this.state.student,
                                            inst_cert:
                                              this.state.student.inst_cert !==
                                              null
                                                ? [
                                                    ...this.state.student
                                                      .inst_cert,
                                                    secure_url,
                                                  ]
                                                : [secure_url],
                                          },
                                        });
                                        await updateStudentCertFile(
                                          this.state.student.inst_cert,
                                          this.state.student.id
                                        );
                                      }
                                    )}
                                    oninit={() => this.handleInit()}
                                  />
                                </div>
                              </div>

                              <legend>Previously uploaded certificates</legend>

                              <div className="row">
                                <div className="col-md-10">
                                  <Documents images={value} />
                                </div>
                              </div>

                              <button
                                className="btn btn-info btn-cons m-t-10"
                                form="form1"
                                value="back"
                                onClick={() => Router.back()}
                              >
                                GO BACK
                              </button>
                              <button
                                className="btn btn-complete btn-cons m-t-10"
                                value="save"
                                onClick={this.saveApplication}
                              >
                                SAVE AND CONTINUE
                              </button>
                              <button
                                className="btn btn-success btn-cons m-t-10"
                                value="Submit"
                                type="submit"
                              >
                                SUBMIT APPLICATION
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

export default ApplicationStepThree;
