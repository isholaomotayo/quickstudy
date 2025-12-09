import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import Documents from "../displayImages";
import BaseSelect from "react-select";
import FixRequiredSelect from "../../helpers/FixRequiredSelect.js";

const Select = props => {
  return (
    <FixRequiredSelect
      {...props}
      SelectComponent={BaseSelect}
      options={props.options || options}
    />
  );
};

function get_url_extension(url = "") {
  return url
    ? url
        .split(/\#|\?/)[0]
        .split(".")
        .pop()
        .trim()
    : "";
}

const renderImages = student => {
  const value = [
    {
      src:
        get_url_extension(student.id_card) === "pdf"
          ? "https://img.icons8.com/plasticine/2x/document.png"
          : student.id_card,
      link: student.id_card,
      name: "Identity card"
    }
  ];
  student.inst_cert !== null &&
    student.inst_cert.forEach(url => {
      const image =
        get_url_extension(url) === "pdf"
          ? "https://img.icons8.com/plasticine/2x/document.png"
          : url;

      value.push({
        src: image,
        link: url,
        name: "Institution certificate"
      });
    });

  return value;
};

const ViewStudentModal = props => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Profile
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        animation={false}
        dialogClassName="modal-90w w-75"
        className=" fade fill-in show"
      >
        <Modal.Header closeButton>
          <Modal.Title>View Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="card card-default">
            <div className="card-body">
              <form role="form">
                <div className="row">
                  <div className="pull-right col-md-4">
                    <label className="avatar-input">
                      <span className="avatar avatar-xl">
                        <img
                          src={
                            props.student.user.avatar
                              ? props.student.user.avatar
                              : "/custom/img/default-user.png"
                          }
                          alt="User Picture"
                          className="avatar-img  rounded-circle"
                          height="100"
                        />
                      </span>
                    </label>
                  </div>
                  <div className="pull-right col-md-4">
                    <h3 className="avatar-input">Admission Status</h3>
                    <p className="avatar avatar-xl fs-16 bold">Active</p>
                  </div>
                </div>
                {/* <h1>{props.index}</h1> */}
                <legend>Programme Details</legend>
                <div className="row">
                  <div className="col-md-5">
                    <div
                      className="form-group form-group-default"
                      style={{ overflow: "visible" }}
                    >
                      <label>Programme</label>

                      <Select
                        // isMulti
                        options={props.programmes}
                        name="programme_id"
                        required
                        onChange={(e, meta) =>
                          props.handleChange(
                            props.index,
                            props.student,
                            e,
                            meta
                          )
                        }
                        value={
                          Array.isArray(props.student.programme_id)
                            ? props.programmes.filter(p =>
                                props.student.programme_id.includes(p.id)
                              )
                            : props.programmes.filter(
                                p => p.id == props.student.programme_id
                              )
                        }
                      />
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div
                      className="form-group form-group-default"
                      style={{ overflow: "visible" }}
                    >
                      <label>Entry Level</label>

                      <Select
                        // isMulti
                        options={props.levels}
                        name="entry_level_id"
                        required
                        onChange={(e, meta) =>
                          props.handleChange(
                            props.index,
                            props.student,
                            e,
                            meta
                          )
                        }
                        value={
                          Array.isArray(props.student.entry_level_id)
                            ? props.levels.filter(p =>
                                props.student.entry_level_id.includes(p.id)
                              )
                            : props.levels.filter(
                                p => p.id == props.student.entry_level_id
                              )
                        }
                      />
                    </div>
                  </div>
                </div>

                <legend>Uploaded Documents</legend>

                <div className="row">
                  <div className="col-md-10">
                    <Documents images={renderImages(props.student)} />
                  </div>
                </div>

                <legend>Personal Info</legend>

                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group form-group-default">
                      <label>Surname</label>
                      <input
                        type="text"
                        name="last_name"
                        className="form-control"
                        defaultValue={props.student.user.last_name}
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
                        defaultValue={props.student.user.first_name}
                        className="form-control"
                        readOnly
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group form-group-default">
                      <label>Middle name</label>
                      <input
                        type="text"
                        name="other_name"
                        defaultValue={props.student.user.other_name}
                        className="form-control"
                        readOnly
                        required
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
                        defaultValue={props.student.user.email}
                        readOnly
                        required
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
                        defaultValue={props.student.user.phone}
                        readOnly
                        required
                      />
                    </div>
                  </div>{" "}
                  <div className="col-md-4">
                    <div className="form-group form-group-default">
                      <label>Date of Birth</label>
                      <input
                        readOnly
                        type="input"
                        name="dob"
                        defaultValue={
                          props.student.dob
                            ? props.student.dob.substr(0, 10)
                            : props.student.dob
                        }
                        className="form-control"
                        required
                      />
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
                            type="radio"
                            name="gender"
                            value="MALE"
                            disabled
                            defaultChecked={props.student.gender === "MALE"}
                          />
                          Male
                        </label>

                        <label>
                          <input
                            type="radio"
                            name="gender"
                            disabled
                            value="FEMALE"
                            defaultChecked={props.student.gender === "FEMALE"}
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
                            type="radio"
                            name="marital_status"
                            value="SINGLE"
                            readOnly
                            checked={props.student.marital_status === "SINGLE"}
                          />
                          Single
                        </label>

                        <label>
                          <input
                            type="radio"
                            name="marital_status"
                            value="MARRIED"
                            readOnly
                            checked={props.student.marital_status === "MARRIED"}
                          />
                          Married
                        </label>

                        <label>
                          <input
                            type="radio"
                            name="marital_status"
                            value="DIVORCED"
                            readOnly
                            checked={
                              props.student.marital_status === "DIVORCED"
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
                            type="radio"
                            name="employment_status"
                            value="UNEMPLOYED"
                            readOnly
                            checked={
                              props.student.employment_status === "UNEMPLOYED"
                            }
                          />
                          UNEMPLOYED
                        </label>

                        <label>
                          <input
                            type="radio"
                            name="employment_status"
                            value="EMPLOYED"
                            readOnly
                            checked={
                              props.student.employment_status === "EMPLOYED"
                            }
                          />
                          EMPLOYED
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

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
                        defaultValue={props.student.inst_name}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group form-group-default">
                      <label>Type of Institution</label>
                      <input
                        type="text"
                        name="inst_type"
                        className="form-control"
                        readOnly
                        defaultValue={props.student.inst_type}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group form-group-default">
                      <label>Course of Study</label>
                      <input
                        type="text"
                        name="course_studied"
                        defaultValue={props.student.course_studied}
                        className="form-control"
                        required
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group form-group-default">
                      <label>Type of Degree</label>
                      <input
                        type="text"
                        name="type_degree"
                        className="form-control"
                        readOnly
                        defaultValue={props.student.type_degree}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group form-group-default">
                      <label>Grade</label>
                      <input
                        type="text"
                        name="degree_grade"
                        className="form-control"
                        readOnly
                        defaultValue={props.student.degree_grade}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group form-group-default">
                      <label>Year of Graduation</label>
                      <input
                        type="text"
                        name="grad_year"
                        defaultValue={
                          props.student.grad_year &&
                          props.student.grad_year.substr(0, 10)
                        }
                        className="form-control"
                        required
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* <button
                className="btn btn-success btn-cons m-t-10"
                form="form1"
                value="Submit"
                onClick={() => {
                  props.handleAdmit();
                  close();
                }}
              >
                Admit
              </button>

              <button
                className="btn btn-danger btn-cons m-t-10"
                form="form1"
                value="Submit"
                onClick={() => {
                  props.handleReject();
                  close();
                }}
              >
                Reject
              </button>
              <button
                className="btn btn-danger btn-cons m-t-10"
                onClick={() => {
                  close();
                }}
              >
                Cancel
              </button> */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              props.handleSave(props.student, props.index);
              handleClose();
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ViewStudentModal;
