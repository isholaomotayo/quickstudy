import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const CreateStaffModal = (props) => {
  const [show, setShow] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdStaff, setCreatedStaff] = useState(null);

  const handleClose = () => {
    setShow(false);
    setShowSuccess(false);
    setCreatedStaff(null);
  };
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        <i className="fa fa-user" /> Create Staff
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        animation={false}
        dialogClassName="modal-90w w-75"
        className="fill-in show"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {showSuccess ? "Staff Created Successfully" : "Create Staff"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showSuccess ? (
            <div className="card-body">
              <div className="text-center mb-4">
                <i
                  className="fa fa-check-circle text-success"
                  style={{ fontSize: "3rem" }}
                ></i>
                <h4 className="text-success mt-2">
                  Staff Profile Created Successfully!
                </h4>
                <p className="text-muted">
                  The staff member can now log in using the credentials below.
                </p>
              </div>

              <div className="alert alert-warning mt-3">
                <i className="fa fa-exclamation-triangle mr-2"></i>
                <strong>Important:</strong> Please save these credentials
                securely. The password cannot be retrieved later.
              </div>
            </div>
          ) : (
            <div className="card-body">
              {/* Required Fields Section */}
              <div className="mb-4">
                <h6 className="text-primary font-weight-bold mb-3">
                  <i className="fa fa-asterisk text-danger mr-1"></i>
                  Required Information
                </h6>
                <div className="form-row">
                  <div className="form-group col-md-4">
                    <label className="font-weight-bold text-dark mb-2">
                      <i className="fa fa-user text-primary mr-1"></i>
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Enter first name"
                      defaultValue={props.state.firstName}
                      className="form-control form-control-lg border-2 border-primary rounded-lg shadow-sm"
                      style={{
                        borderColor: "#007bff",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                      }}
                      required
                      onChange={props.handleChange}
                    />
                  </div>
                  <div className="form-group col-md-4">
                    <label className="font-weight-bold text-dark mb-2">
                      <i className="fa fa-user text-primary mr-1"></i>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Enter last name"
                      className="form-control form-control-lg border-2 border-primary rounded-lg shadow-sm"
                      style={{
                        borderColor: "#007bff",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                      }}
                      defaultValue={props.state.lastName}
                      required
                      onChange={props.handleChange}
                    />
                  </div>
                  <div className="form-group col-md-4">
                    <label className="font-weight-bold text-dark mb-2">
                      <i className="fa fa-at text-primary mr-1"></i>
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      className="form-control form-control-lg border-2 border-primary rounded-lg shadow-sm"
                      style={{
                        borderColor: "#007bff",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                      }}
                      placeholder="Choose a username"
                      defaultValue={props.state.username}
                      required
                      onChange={props.handleChange}
                    />
                  </div>
                  <div className="form-group col-md-4">
                    <label className="font-weight-bold text-dark mb-2">
                      <i className="fa fa-lock text-primary mr-1"></i>
                      Password *
                    </label>
                    <input
                      type="password"
                      defaultValue={props.state.password}
                      className="form-control form-control-lg border-2 border-primary rounded-lg shadow-sm"
                      style={{
                        borderColor: "#007bff",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                      }}
                      name="password"
                      placeholder="Enter password"
                      required
                      onChange={props.handleChange}
                    />
                  </div>
                  <div className="form-group col-md-4">
                    <label className="font-weight-bold text-dark mb-2">
                      <i className="fa fa-envelope text-primary mr-1"></i>
                      Email *
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg border-2 border-primary rounded-lg shadow-sm"
                      style={{
                        borderColor: "#007bff",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                      }}
                      name="email"
                      placeholder="Enter email address"
                      defaultValue={props.state.email}
                      required
                      onChange={props.handleChange}
                    />
                  </div>
                  <div className="form-group col-md-4">
                    <label className="font-weight-bold text-dark mb-2">
                      <i className="fa fa-user-tag text-primary mr-1"></i>
                      Role *
                    </label>
                    <select
                      name="role"
                      defaultValue={props.state.role}
                      onChange={props.handleChange}
                      className="form-control form-control-lg border-2 border-primary rounded-lg shadow-sm"
                      style={{
                        borderColor: "#007bff",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        height: "48px",
                        transition: "all 0.3s ease",
                      }}
                      required
                    >
                      <option value="">Select a role</option>
                      <option value="ADMIN">Admin</option>
                      <option value="PROGRAMME_COORDINATOR">
                        Programme Coordinator
                      </option>
                      <option value="HOD">HOD</option>
                      <option value="PROGRAMME_EXAM_OFFICER">
                        Programme Exam Officer
                      </option>
                      <option value="FACILITATOR">Facilitator</option>
                      <option value="ETUTOR">eTutor</option>
                      <option value="STAFF">Staff</option>
                      <option value="LECTURER">Lecturer</option>
                    </select>
                  </div>
                  <div className="form-group col-md-4">
                    <label className="font-weight-bold text-dark mb-2">
                      <i className="fa fa-building text-primary mr-1"></i>
                      Department *
                    </label>
                    <select
                      name="department_id"
                      defaultValue={props.state.department_id}
                      onChange={props.handleChange}
                      className="form-control form-control-lg border-2 border-primary rounded-lg shadow-sm"
                      style={{
                        borderColor: "#007bff",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        height: "48px",
                        transition: "all 0.3s ease",
                      }}
                      required
                    >
                      <option value="">Choose Department</option>
                      {props.departments.map((department, i) => {
                        return (
                          <option
                            key={`department-option-${i}`}
                            value={department.id}
                          >
                            {department.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* Optional Fields Section */}
              <div className="mb-4">
                <h6 className="text-muted font-weight-bold mb-3">
                  <i className="fa fa-plus-circle text-muted mr-1"></i>
                  Additional Information (Optional)
                </h6>
                <div className="form-row">
                  <div className="form-group col-md-4">
                    <label className="font-weight-bold text-secondary mb-2">
                      <i className="fa fa-user-circle text-secondary mr-1"></i>
                      Other Name
                    </label>
                    <input
                      type="text"
                      name="otherName"
                      className="form-control form-control-lg border-2 border-secondary rounded-lg shadow-sm"
                      style={{
                        borderColor: "#6c757d",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                      }}
                      placeholder="Enter middle name"
                      defaultValue={props.state.otherName}
                      onChange={props.handleChange}
                    />
                  </div>
                  <div className="form-group col-md-4">
                    <label className="font-weight-bold text-secondary mb-2">
                      <i className="fa fa-id-badge text-secondary mr-1"></i>
                      Staff No
                    </label>
                    <input
                      type="text"
                      name="staff_no"
                      className="form-control form-control-lg border-2 border-secondary rounded-lg shadow-sm"
                      style={{
                        borderColor: "#6c757d",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                      }}
                      placeholder="Enter staff number"
                      defaultValue={props.state.staff_no}
                      onChange={props.handleChange}
                    />
                  </div>
                  <div className="form-group col-md-4">
                    <label className="font-weight-bold text-secondary mb-2">
                      <i className="fa fa-briefcase text-secondary mr-1"></i>
                      Designation
                    </label>
                    <input
                      type="text"
                      name="designation"
                      className="form-control form-control-lg border-2 border-secondary rounded-lg shadow-sm"
                      style={{
                        borderColor: "#6c757d",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                      }}
                      placeholder="Enter job title"
                      defaultValue={props.state.designation}
                      onChange={props.handleChange}
                    />
                  </div>
                  <div className="form-group col-md-4">
                    <label className="font-weight-bold text-secondary mb-2">
                      <i className="fa fa-layer-group text-secondary mr-1"></i>
                      Level
                    </label>
                    <input
                      type="text"
                      defaultValue={props.state.level}
                      className="form-control form-control-lg border-2 border-secondary rounded-lg shadow-sm"
                      style={{
                        borderColor: "#6c757d",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                      }}
                      name="level"
                      placeholder="Enter level"
                      onChange={props.handleChange}
                    />
                  </div>
                  <div className="form-group col-md-4">
                    <label className="font-weight-bold text-secondary mb-2">
                      <i className="fa fa-phone text-secondary mr-1"></i>
                      Phone
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-lg border-2 border-secondary rounded-lg shadow-sm"
                      style={{
                        borderColor: "#6c757d",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                      }}
                      name="phone"
                      placeholder="Enter phone number"
                      defaultValue={props.state.phone}
                      onChange={props.handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="form-group">
                <label className="font-weight-bold text-secondary mb-2">
                  <i className="fa fa-map-marker-alt text-secondary mr-1"></i>
                  Address
                </label>
                <textarea
                  rows="4"
                  name="address"
                  defaultValue={props.state.address}
                  className="form-control form-control-lg border-2 border-secondary rounded-lg shadow-sm"
                  style={{
                    borderColor: "#6c757d",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                    resize: "vertical",
                  }}
                  placeholder="Enter full address"
                  onChange={props.handleChange}
                />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {showSuccess ? (
            <>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  handleClose();
                  window.location.reload();
                }}
              >
                <i className="fa fa-refresh mr-1"></i>
                Refresh List
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  await props.handleSubmit((staffData) => {
                    setCreatedStaff(staffData);
                    setShowSuccess(true);
                  });
                }}
              >
                <i className="fa fa-user-plus mr-1"></i>
                Create Staff
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .form-control:focus {
          border-color: #007bff !important;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25) !important;
          transform: translateY(-1px);
        }

        .form-control:hover {
          border-color: #0056b3 !important;
          transform: translateY(-1px);
        }

        .form-control-lg {
          min-height: 48px;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          font-size: 14px;
          margin-bottom: 8px;
          display: block;
        }

        .modal-body {
          padding: 2rem;
        }

        .card-body {
          padding: 1.5rem;
        }

        .text-primary {
          color: #007bff !important;
        }

        .text-secondary {
          color: #6c757d !important;
        }

        .border-primary {
          border-color: #007bff !important;
        }

        .border-secondary {
          border-color: #6c757d !important;
        }

        .shadow-sm {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
        }

        .rounded-lg {
          border-radius: 0.5rem !important;
        }

        .form-control {
          transition: all 0.3s ease;
        }

        .form-control:focus {
          transition: all 0.3s ease;
        }

        .form-control:hover {
          transition: all 0.3s ease;
        }

        .btn {
          border-radius: 8px;
          padding: 10px 20px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .btn-primary {
          background: linear-gradient(135deg, #007bff, #0056b3);
          border: none;
        }

        .btn-success {
          background: linear-gradient(135deg, #28a745, #1e7e34);
          border: none;
        }

        .btn-secondary {
          background: linear-gradient(135deg, #6c757d, #545b62);
          border: none;
        }
      `}</style>
    </>
  );
};

export default CreateStaffModal;
