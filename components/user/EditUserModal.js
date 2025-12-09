import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

import { updateUserAvatar } from "../../helpers/FetchWrapper";
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

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFilePoster
);
// import toast from "react-hot-toast";

import { getStudent, updateBulk } from "../../helpers/manage-users/manageUser";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { dateFormater } from "../../helpers/discussion-helpers/discussion-utils";

const degreeList = [
  "BSc",
  "MSc",
  "HND",
  "B.A",
  "B.ENG",
  "B.PHARM",
  "BSc (ED)",
  "MBBS",
  "B.TECH",
];

const gradeList = [
  "First Class",
  "Second Class Upper",
  "Second Class Lower",
  "Third Class",
  "Upper Credit",
  "Lower Credit",
  "Distinction",
  "Merit",
  "Pass",
];

const EditUserModal = (props) => {
  // const [validDate, setValiddate] = useState;
  const [show, setShow] = useState(false);
  const [user, setUser] = useState({});
  const [student, setStudent] = useState({});
  const [grad_year, setGrad_Year] = useState("");
  const [dob, setDob] = useState("");

  const handleClose = () => setShow(false);
  const handleCreation = async (e) => {
    e.preventDefault();
    const data = await updateBulk(student, user, "student");

    const person = data.user;

    props.handleUserUpdate(person);
    handleClose();
  };
  const handleShow = async () => {
    const student = await getStudent(props.user.id);

    const { user } = student;

    setUser(user);

    setStudent(student);

    setGrad_Year(
      student.grad_year !== null
        ? new Date(student.grad_year.replace("T", " "))
        : ""
    );

    setDob(student.dob !== null ? new Date(student.dob.replace("T", " ")) : "");

    setShow(true);
  };

  return (
    <>
      <Button
        // style={{ backgroundColor: "#0CCFBD" }}
        className="btn btn-warning text-white btn-sm my-2"
        onClick={handleShow}
      >
        Edit
      </Button>
      {show && (
        <Modal
          show={show}
          size="xl"
          onHide={handleClose}
          dialogClassName="modal-90w modal-w"
        >
          <form
            role="form"
            method="post"
            onSubmit={async (e) => {
              await handleCreation(e);
            }}
          >
            <Modal.Header closeButton>
              <Modal.Title className="mb-3">Edit A User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="form-row">
                <div className="form-group col-md-4">
                  <div
                    className="col-lg-6  mt-2 "
                    style={{ marginLeft: "auto", marginRight: "auto" }}
                  >
                    <FilePond
                      files={
                        props.user && props.user.avatar
                          ? [
                              {
                                // the server file reference
                                source:
                                  props.user.avatar.length > 1
                                    ? props.user.avatar
                                    : "/custom/img/default-user.png",

                                // set type to local to indicate an already uploaded file
                                options: {
                                  type: "limbo",
                                  metadata: {
                                    poster: props.user.avatar,
                                  },
                                },
                              },
                            ]
                          : null
                      }
                      // ref={ref => (this.pond = ref)}
                      allowMultiple={false}
                      maxFiles={1}
                      server={createCloudinary(
                        "emergingplatforms",
                        "ilearn",
                        "avatar", // tag for upload
                        async (secure_url) => {
                          //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend
                          await updateUserAvatar(secure_url, props.user.id);
                          setUser({
                            ...props.user,
                            avatar: secure_url,
                          });
                        }
                      )}
                      // oninit={() => this.handleInit()}
                    />
                  </div>
                </div>
              </div>
              <div className="container">
                <div className="row">
                  <div className="col-sm-12 col-md-12">
                    <h3>Personal Information</h3>
                    <div className="form-row">
                      <div className="form-group col-md-4">
                        <label htmlFor="first_name">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="first_name"
                          name="first_name"
                          placeholder="First Name"
                          defaultValue={
                            user.hasOwnProperty("first_name")
                              ? user.first_name
                              : ""
                          }
                          onChange={(e) => {
                            setUser({
                              ...user,
                              first_name: e.target.value,
                            });
                          }}
                        />
                      </div>
                      <div className="form-group col-md-4">
                        <label htmlFor="last_name">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="last_name"
                          name="last_name"
                          placeholder="Last Name"
                          defaultValue={user.last_name ? user.last_name : ""}
                          onChange={(e) => {
                            setUser({
                              ...user,
                              last_name: e.target.value,
                            });
                          }}
                        />
                      </div>
                      <div className="form-group col-md-4">
                        <label htmlFor="other_name">Other Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="other_name"
                          name="other_name"
                          placeholder="Other Name"
                          defaultValue={user.other_name ? user.other_name : ""}
                          onChange={(e) => {
                            setUser({
                              ...user,
                              other_name: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group col-md-4">
                        <label htmlFor="email">Email</label>
                        <input
                          type="text"
                          className="form-control"
                          id="email"
                          name="email"
                          defaultValue={user.email ? user.email : ""}
                          placeholder="Email"
                          onChange={(e) => {
                            setUser({
                              ...user,
                              email: e.target.value,
                            });
                          }}
                        />
                      </div>
                      <div className="form-group col-md-4">
                        <label htmlFor="phone">Phone </label>
                        <input
                          type="number"
                          className="form-control"
                          id="phone"
                          name="phone"
                          placeholder="Phone no"
                          defaultValue={user.phone ? user.phone : ""}
                          onChange={(e) => {
                            setUser({
                              ...user,
                              phone:
                                e.target.value.length < 1
                                  ? null
                                  : e.target.value,
                            });
                          }}
                        />
                      </div>
                      <div className="form-group col-md-4">
                        <label htmlFor="personal_info">
                          Registration Number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          defaultValue={student?.reg_no}
                          id="reg_no"
                          name="reg_no"
                          placeholder=""
                          onChange={(e) => {
                            setStudent({
                              ...student,
                              reg_no: e.target.value,
                            });
                          }}
                        />
                      </div>
                      <div className="form-group col-md-4">
                        <label htmlFor="dob">Date Of Birth</label>
                        <div className="pr-5">
                          <DatePicker
                            selected={dob}
                            className="form-control dater text-dark"
                            maxDate={new Date()}
                            showYearDropdown
                            showMonthDropdown
                            onChange={(date) => {
                              const dater = dateFormater(date);
                              setDob(date);
                              setStudent({
                                ...student,
                                dob: dater,
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-group col-md-4">
                        <label htmlFor="Gender">Gender </label>
                        <select
                          id="Gender"
                          className="form-control"
                          defaultValue={student.gender ? student.gender : ""}
                          onChange={(e) => {
                            setStudent({
                              ...student,
                              gender: e.target.value,
                            });
                          }}
                        >
                          <option value="Select">Select</option>
                          <option value="MALE">MALE</option>
                          <option value="FEMALE">FEMALE</option>
                        </select>
                      </div>
                      <div className="form-group col-md-4">
                        <label htmlFor="Marital">Marital Status</label>
                        <select
                          id="Marital"
                          className="form-control"
                          defaultValue={
                            student.marital_status ? student.marital_status : ""
                          }
                          onChange={(e) => {
                            setStudent({
                              ...student,
                              marital_status: e.target.value,
                            });
                          }}
                        >
                          <option value="Select">Select</option>
                          <option value="SINGLE">SINGLE</option>
                          <option value="MARRIED">MARRIED</option>
                          <option value="DIVORCED">DIVORCED</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group col-md-4">
                        <label htmlFor="Employment">Employment Status</label>
                        <select
                          id="Employment"
                          className="form-control"
                          defaultValue={
                            student.employment_status
                              ? student.employment_status
                              : ""
                          }
                          onChange={(e) => {
                            setStudent({
                              ...student,
                              employment_status: e.target.value,
                            });
                          }}
                        >
                          <option value="">Select</option>
                          <option value="EMPLOYED">EMPLOYED</option>
                          <option value="UNEMPLOYED">UNEMPLOYED</option>
                        </select>
                      </div>

                      <div className="form-group col-md-4">
                        <label htmlFor="isADmin">Is Admin</label>
                        <select
                          id="isADmin"
                          className="form-control"
                          defaultValue={user.admin === 0 ? "FALSE" : "TRUE"}
                          onChange={(e) => {
                            setUser({
                              ...user,
                              admin: e.target.value === "TRUE" ? 1 : 0,
                            });
                          }}
                        >
                          <option value={"TRUE"}>True</option>
                          <option value={"FALSE"}>False</option>
                        </select>
                      </div>
                      <div className="form-group col-md-4">
                        <label htmlFor="inputRole">Role</label>
                        <select
                          id="inputRole"
                          className="form-control"
                          defaultValue={user.role ? user.role : ""}
                          onChange={(e) => {
                            setUser({
                              ...user,
                              role: e.target.value,
                            });
                          }}
                        >
                          <option value="">Select</option>
                          <option value="APPLICANT">APPLICANT</option>
                          <option value="STUDENT">STUDENT</option>
                          <option value="STAFF">STAFF</option>
                          <option value="HOD">HOD</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group col-md-12">
                        <label htmlFor="address">Address</label>
                        <textarea
                          type="text"
                          className="form-control"
                          id="address"
                          name="address"
                          defaultValue={student.address ? student.address : ""}
                          placeholder=""
                          onChange={(e) => {
                            setStudent({
                              ...student,
                              address: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-12 col-md-12">
                    <h3>Academic History</h3>
                    <div className="form-row">
                      <div className="form-group col-md-4">
                        <label htmlFor="institution">Name of Institution</label>
                        <input
                          type="text"
                          className="form-control"
                          id="institution"
                          name="first_name"
                          defaultValue={
                            student.inst_name ? student.inst_name : ""
                          }
                          onChange={(e) => {
                            setStudent({
                              ...student,
                              inst_name: e.target.value,
                            });
                          }}
                        />
                      </div>
                      <div className="form-group col-md-4">
                        <label htmlFor="typeOfInstitution">
                          Type of Institution
                        </label>
                        <select
                          id="typeOfInstitution"
                          className="form-control"
                          defaultValue={
                            student.inst_type ? student.inst_type : ""
                          }
                          onChange={(e) => {
                            setStudent({
                              ...student,
                              inst_type: e.target.value,
                            });
                          }}
                        >
                          <option value="">Select</option>
                          <option value="University">University</option>
                          <option value="Polytechnic">Polytechnic</option>
                          <option value="College of Education">
                            College of Education
                          </option>
                        </select>
                      </div>

                      <div className="form-group col-md-4">
                        <label htmlFor="course">Course Of Study</label>
                        <input
                          type="text"
                          className="form-control"
                          id="course"
                          name="other_name"
                          defaultValue={
                            student.course_studied ? student.course_studied : ""
                          }
                          onChange={(e) => {
                            setStudent({
                              ...student,
                              course_studied: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group col-md-4">
                        <label htmlFor="degree">Degree</label>
                        <select
                          id="degree"
                          className="form-control"
                          defaultValue={
                            student.type_degree ? student.type_degree : ""
                          }
                          onChange={(e) => {
                            setStudent({
                              ...student,
                              type_degree: e.target.value,
                            });
                          }}
                        >
                          <option value="">Select</option>

                          {degreeList.map((name, i) => (
                            <option value={name} key={i}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group col-md-4">
                        <label htmlFor="grade">Grade</label>
                        <select
                          id="grade"
                          className="form-control"
                          defaultValue={
                            student.degree_grade ? student.degree_grade : ""
                          }
                          onChange={(e) => {
                            setStudent({
                              ...student,
                              degree_grade: e.target.value,
                            });
                          }}
                        >
                          <option value="">Select</option>

                          {gradeList.map((name, i) => (
                            <option value={name} key={i}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group col-md-4">
                        <label htmlFor="grad_year">Year Of Graduation</label>
                        <div className="pr-5">
                          <DatePicker
                            selected={grad_year}
                            className="form-control dater"
                            maxDate={new Date()}
                            showYearDropdown
                            showMonthDropdown
                            onChange={(date) => {
                              const dater = dateFormater(date);
                              setGrad_Year(date);
                              setStudent({
                                ...student,
                                grad_year: dater,
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-group col-md-4">
                        <label htmlFor="account_active">
                          Deactivate Account{" "}
                        </label>
                        <select
                          className="form-control"
                          name="account_active"
                          onChange={(e) => {
                            setUser({
                              ...user,
                              account_active: e.target.value,
                            });
                          }}
                          defaultValue={
                            user.hasOwnProperty("account_active")
                              ? user.account_active
                              : ""
                          }
                        >
                          <option value={false}>Yes</option>
                          <option value={true}>No</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary btn-info" onClick={handleClose}>
                Close
              </Button>
              <Button type="submit" className="btn btn-success">
                Save Changes
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      )}
      <style jsx global>
        {`
          .modal-w {
            width: 90vw !important;
            margin: 20px auto !important;
            margin-left: 30px;
          }

          .react-toast-notifications__container {
            z-index: 1000000 !important;
          }

          .dater {
            padding-right: 180px !important;
          }
        `}
      </style>
    </>
  );
};

export default EditUserModal;
