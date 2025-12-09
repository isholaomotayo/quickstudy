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

import { updateBulk, getStaff } from "../../helpers/manage-users/manageUser";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker-cssmodules.css";
import { dateFormater } from "../../helpers/discussion-helpers/discussion-utils";

const EditStaffModal = props => {
  // const [validDate, setValiddate] = useState;
  const [show, setShow] = useState(false);
  const [department, setDepartment] = useState([]);
  const [user, setUser] = useState({});
  const [student, setStaff] = useState({});
  const [dob, setDob] = useState("");

  const handleClose = () => setShow(false);
  const handleCreation = async e => {
    e.preventDefault();
    const data = await updateBulk(student, user, "staff");

    const person = data.user;

    props.handleUserUpdate(person);
    handleClose();
  };

  const handleShow = async () => {
    let { staff, department } = await getStaff(props.user.id);

    staff = staff[0];

    const { user } = staff;

    setUser(user);

    setStaff(staff);

    setDepartment(department);

    setDob(staff.dob !== null ? new Date(staff.dob.replace("T", " ")) : "");

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
      <Modal
        show={show}
        onHide={handleClose}
        dialogClassName="modal-90w modal-w"
      >
        <form
          role="form"
          onSubmit={e => {
            handleCreation(e);
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
                                  poster: props.user.avatar
                                }
                              }
                            }
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
                      async secure_url => {
                        console.log(secure_url);
                        //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend
                        await updateUserAvatar(secure_url, props.user.id);
                        setUser({
                          ...props.user,
                          avatar: secure_url
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
                        onChange={e => {
                          setUser({
                            ...user,
                            first_name: e.target.value
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
                        onChange={e => {
                          setUser({
                            ...user,
                            last_name: e.target.value
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
                        onChange={e => {
                          setUser({
                            ...user,
                            other_name: e.target.value
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
                        onChange={e => {
                          setUser({
                            ...user,
                            email: e.target.value
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
                        onChange={e => {
                          setUser({
                            ...user,
                            phone:
                              e.target.value.length < 1 ? null : e.target.value
                          });
                        }}
                      />
                    </div>
                    <div className="form-group col-md-4">
                      <label htmlFor="personal_info">
                        Personal Information
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={
                          user.personal_info ? user.personal_info : ""
                        }
                        id="personal_info"
                        name="personal_info"
                        placeholder=""
                        onChange={e => {
                          setUser({
                            ...user,
                            personal_info: e.target.value
                          });
                        }}
                      />
                    </div>
                    <div className="form-group col-md-4">
                      <label htmlFor="Level">Level</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Level"
                        name="level"
                        defaultValue={student.level ? student.level : ""}
                        // placeholder="Email"
                        onChange={e => {
                          setStaff({
                            ...student,
                            level: e.target.value
                          });
                        }}
                      />
                    </div>

                    {/* <div className="form-group col-md-4">
                      <label htmlFor="dob">Date Of Birth</label>
                      <div className="pr-5">
                        <DatePicker
                          selected={dob}
                          className="form-control dater"
                          maxDate={new Date()}
                          showYearDropdown
                          showMonthDropdown
                          onChange={date => {
                            const dater = dateFormater(date);
                            setDob(date);
                            setStaff({
                              ...student,
                              dob: dater
                            });
                          }}
                        />
                      </div>
                    </div>
                    */}
                    <div className="form-group col-md-4">
                      <label htmlFor="Gender">Gender </label>
                      <select
                        id="Gender"
                        className="form-control"
                        defaultValue={
                          student.gender ? student.gender.toUpperCase() : ""
                        }
                        onChange={e => {
                          setStaff({
                            ...student,
                            gender: e.target.value
                          });
                        }}
                      >
                        <option value="Select">Select</option>
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                      </select>
                    </div>
                    <div className="form-group col-md-4">
                      <label htmlFor="Designation">Designation</label>

                      <input
                        type="text"
                        className="form-control"
                        id="Designation"
                        name="designation"
                        defaultValue={
                          student.designation ? student.designation : ""
                        }
                        placeholder="Email"
                        onChange={e => {
                          setStaff({
                            ...student,
                            designation: e.target.value
                          });
                        }}
                      />
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
                        onChange={e => {
                          setStaff({
                            ...student,
                            address: e.target.value
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    {/* <div className="form-group col-md-4">
                      <label htmlFor="Level">Level</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Level"
                        name="level"
                        defaultValue={student.level ? student.level : ""}
                        // placeholder="Email"
                        onChange={e => {
                          setStaff({
                            ...student,
                            level: e.target.value
                          });
                        }}
                      />
                    </div> */}

                    <div className="form-group col-md-4">
                      <label htmlFor="inputRole">Staff No</label>

                      <input
                        type="text"
                        className="form-control"
                        id="StaffNo"
                        name="staff_no"
                        readOnly
                        defaultValue={student.staff_no ? student.staff_no : ""}
                      />
                    </div>
                    <div className="form-group col-md-4">
                      <label htmlFor="account_active">
                        Deactivate Account{" "}
                      </label>
                      <select
                        className="form-control"
                        name="account_active"
                        onChange={e => {
                          setUser({
                            ...user,
                            account_active: e.target.value
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
            color: #000 !important;
          }
        `}
      </style>
    </>
  );
};

export default EditStaffModal;
