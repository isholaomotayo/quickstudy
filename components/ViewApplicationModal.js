import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import Documents from "./displayImages";
import BaseSelect from "react-select";
import FixRequiredSelect from "../helpers/FixRequiredSelect.js";
import RejectApplicantModal from "./RejectApplicantModal";

const Select = (props) => {
  return (
    <FixRequiredSelect
      {...props}
      SelectComponent={BaseSelect}
      options={props.options || options}
    />
  );
};

const renderImages = (student) => {
  const value = [
    {
      src:
        get_url_extension(student.id_card) === "pdf"
          ? "https://img.icons8.com/plasticine/2x/document.png"
          : student.id_card,
      link: student.id_card,
      name: "Identity card",
    },
  ];
  student.inst_cert !== null &&
    student?.inst_cert?.forEach((url) => {
      const image =
        get_url_extension(url) === "pdf"
          ? "https://img.icons8.com/plasticine/2x/document.png"
          : url;

      value.push({
        src: image,
        link: url,
        name: "Institution certificate",
      });
    });

  return value;
};

function get_url_extension(url = "") {
  return url ? url.split(/\#|\?/)[0].split(".").pop().trim() : "";
}

const ViewApplicationModal = (props) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        View Application
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        animation={false}
        dialogClassName="modal-90w w-75"
        className=" fade fill-in show"
      >
        <Modal.Header closeButton>
          <Modal.Title>View Application</Modal.Title>
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
                            props.applicant.avatar
                              ? props.applicant.avatar
                              : "/custom/img/default-user.png"
                          }
                          alt="User Picture"
                          className="avatar-img  rounded-circle"
                          height="100"
                        />
                      </span>
                    </label>
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
                            props.applicant,
                            e,
                            meta
                          )
                        }
                        value={
                          Array.isArray(props.applicant.student.programme_id)
                            ? props.programmes.filter((p) =>
                                props.applicant.student.programme_id.includes(
                                  p.id
                                )
                              )
                            : props.programmes.filter(
                                (p) =>
                                  p.id == props.applicant.student.programme_id
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
                      <label>Level</label>

                      <Select
                        // isMulti
                        options={props.levels}
                        name="entry_level_id"
                        required
                        onChange={(e, meta) =>
                          props.handleChange(
                            props.index,
                            props.applicant,
                            e,
                            meta
                          )
                        }
                        value={
                          Array.isArray(props.applicant.student.entry_level_id)
                            ? props.levels.filter((p) =>
                                props.applicant.student.entry_level_id.includes(
                                  p.id
                                )
                              )
                            : props.levels.filter(
                                (p) =>
                                  p.id == props.applicant.student.entry_level_id
                              )
                        }
                      />
                    </div>
                  </div>
                </div>

                <legend>Uploaded Documents</legend>

                <div className="row">
                  <div className="col-md-10">
                    <Documents images={renderImages(props.applicant.student)} />
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
                        defaultValue={props.applicant.last_name}
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
                        defaultValue={props.applicant.first_name}
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
                        defaultValue={props.applicant.other_name}
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
                        defaultValue={props.applicant.email}
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
                        defaultValue={props.applicant.phone}
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
                          props.applicant.student.dob
                            ? props.applicant.student.dob.substr(0, 10)
                            : props.applicant.student.dob
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
                            defaultChecked={
                              props.applicant.student.gender === "MALE"
                            }
                          />
                          Male
                        </label>

                        <label>
                          <input
                            type="radio"
                            name="gender"
                            disabled
                            value="FEMALE"
                            defaultChecked={
                              props.applicant.student.gender === "FEMALE"
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
                            type="radio"
                            name="marital_status"
                            value="SINGLE"
                            readOnly
                            checked={
                              props.applicant.student.marital_status ===
                              "SINGLE"
                            }
                          />
                          Single
                        </label>

                        <label>
                          <input
                            type="radio"
                            name="marital_status"
                            value="MARRIED"
                            readOnly
                            checked={
                              props.applicant.student.marital_status ===
                              "MARRIED"
                            }
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
                              props.applicant.student.marital_status ===
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
                            type="radio"
                            name="employment_status"
                            value="UNEMPLOYED"
                            readOnly
                            checked={
                              props.applicant.student.employment_status ===
                              "UNEMPLOYED"
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
                              props.applicant.student.employment_status ===
                              "EMPLOYED"
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
                        defaultValue={props.applicant.student.inst_name}
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
                        defaultValue={props.applicant.student.inst_type}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group form-group-default">
                      <label>Course of Study</label>
                      <input
                        type="text"
                        name="course_studied"
                        defaultValue={props.applicant.student.course_studied}
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
                        defaultValue={props.applicant.student.type_degree}
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
                        defaultValue={props.applicant.student.degree_grade}
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
                          props.applicant.student.grad_year &&
                          props.applicant.student.grad_year.substr(0, 10)
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
        </Modal.Body>
        <Modal.Footer>
          {!(
            Array.isArray(props.applicant.student.entry_level_id)
              ? props.levels.filter((p) =>
                  props.applicant.student.entry_level_id.includes(p.id)
                )
              : props.levels.filter(
                  (p) => p.id == props.applicant.student.entry_level_id
                )
          ).length && (
            <p className="text-danger bold">
              Select a level to admit the student before to enable the admit
              button
            </p>
          )}
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <RejectApplicantModal
            handleReject={props.handleReject}
            applicant={props.applicant}
            close={handleClose}
            open={handleShow}
          />

          <Button
            disabled={
              !(
                Array.isArray(props.applicant.student.entry_level_id)
                  ? props.levels.filter((p) =>
                      props.applicant.student.entry_level_id.includes(p.id)
                    )
                  : props.levels.filter(
                      (p) => p.id == props.applicant.student.entry_level_id
                    )
              ).length
            }
            variant="primary"
            onClick={() => {
              props.handleAdmit(props.applicant);
              handleClose();
            }}
          >
            Admit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ViewApplicationModal;
