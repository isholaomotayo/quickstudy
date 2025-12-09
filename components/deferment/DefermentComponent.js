import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

const DefermentComponent = props => {
  const [show, setShow] = useState(false);
  const [data, setData] = useState(props.data);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };

  return (
    <>
      <Button
        className="btn btn-success text-white btn-sm my-2"
        onClick={handleShow}
      >
        Change
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        dialogClassName="modal-90w modal-w"
      >
        <form
          role="form"
          onSubmit={e => {
            e.preventDefault();
            props.handleDefermentProcess(data);
            setData("");
            handleClose();
          }}
        >
          <Modal.Header closeButton className="mb-3">
            <Modal.Title>Change a student's admission status</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className="container">
              <div className="row">
                <div className="col-sm-12 col-md-12">
                  <div className="form-row">
                    <div className="form-group col-md-6  mb-5">
                      <h4 className="mx-3">Admission Status</h4>
                      <select
                        id="Gender"
                        className="form-control"
                        defaultValue={
                          !!data.admission_status ? data.admission_status : ""
                        }
                        onChange={e => {
                          setData({
                            ...data,
                            admission_status: e.target.value
                          });
                        }}
                      >
                        <option value="Select" disabled>
                          Select
                        </option>
                        <option value="PENDING" disabled>
                          Deferment Requested
                        </option>
                        <option value="ACTIVE">Activate</option>
                        <option value="DEFERRED">Defer</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <h4>Deferment Duration</h4>
                      <p>
                        {!!data.deferment_duration
                          ? data.deferment_duration
                          : ""}
                      </p>
                    </div>
                    <div className="form-group col-md-6">
                      <h4>Current Semester</h4>
                      <p>
                        {!!data.semester && !!data.semester.name
                          ? data.semester.name
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <h4>Semester Start Year</h4>
                      <p>
                        {!!data.semester && !!data.semester.start_date
                          ? data.semester.start_date
                          : ""}
                      </p>
                    </div>
                    <div className="form-group col-md-6">
                      <h4>Semester End Year</h4>
                      <p>
                        {!!data.semester && !!data.semester.end_date
                          ? data.semester.end_date
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group col-md-12">
                      <h4>Deferment Reason</h4>
                      <textarea
                        cols="50"
                        rows="5"
                        readOnly
                        className="form-control"
                        defaultValue={
                          !!data.deferment_reason ? data.deferment_reason : ""
                        }
                      />
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
              Confirm
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
      <style jsx global>
        {`
          .modal-w {
            width: 60vw !important;
            margin: 20px auto !important;
            margin-left: 30px;
          }
        `}
      </style>
    </>
  );
};

export default DefermentComponent;
