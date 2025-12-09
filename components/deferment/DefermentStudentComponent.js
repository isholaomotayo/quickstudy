import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import toast from "react-hot-toast";
import fetch from "isomorphic-unfetch";

const DefermentStudentComponent = props => {
  const [show, setShow] = useState(false);
  const [deferment_reason, setDefermentReason] = useState("");
  const [deferment_duration, setDefermentDuration] = useState("");
  const [other, setOther] = useState("");

  

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };

  const handleDeferment = async () => {
    let student;

    const data = {
      admission_status: "PENDING",
      deferment_reason: deferment_reason === "Other" ? other : deferment_reason,
      deferment_duration
    };
    try {
      student = await fetch(
        `${process.env.API_URL}/api/deferment/deferProcessByStudent/${props.id}`,
        {
          //mode: "no-cors",
          method: "put",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify({
            ...data
          })
        }
      );

      student = student.status === 200 ? await student.json() : {};
    } catch (e) {
      console.log(e);
    }

    if (Object.entries(student).length > 0) {
      toast.success("Your deferment request has been sent, you will get a response in your mail", { icon: "✅" });
      handleClose();
      return;
    }

    handleClose();
  };

  return (
    <>
      <div className="form-group ">
        <Button
          className=" bold btn btn-success mx-2"
          id="defermentModule"
          onClick={handleShow}
        >
          Defer My Admission
        </Button>
      </div>

      <Modal
        show={show}
        onHide={handleClose}
        dialogClassName="modal-90w modal-w"
      >
        <form
          role="form"
          onSubmit={e => {
            e.preventDefault();
            handleDeferment();
            handleClose();
          }}
        >
          <Modal.Header closeButton className="mb-3">
            <Modal.Title>Defer My Admission</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className="container">
              <div className="row">
                <div className="col-sm-12 col-md-12">
                  <div className="form-row">
                    <div className="form-group col-md-6  mb-5">
                      <h4 className="mx-3">Deferment Duration</h4>
                      <select
                        className="form-control"
                        required
                        onChange={e => setDefermentDuration(e.target.value)}
                      >
                        <option>Select</option>
                        <option value="SEMESTER">SEMESTER</option>
                        <option value="YEAR">YEAR</option>
                      </select>
                    </div>
                    <div className="form-group col-md-6  mb-5">
                      <h4 className="mx-3">Deferment Reason</h4>
                      <select
                        className="form-control"
                        required
                        onChange={e => setDefermentReason(e.target.value)}
                      >
                        <option>Select</option>
                        <option value="Inadequate funds">
                          Inadequate funds
                        </option>
                        <option value="Personal Commitment">
                          Personal Commitment
                        </option>
                        <option value="Official Engagement">
                          Official Engagement
                        </option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {deferment_reason === "Other" && (
                    <div className="form-row">
                      <div className="form-group col-md-12">
                        <h4 className="mx-3">Other</h4>

                        <textarea
                          cols="50"
                          rows="5"
                          className="form-control"
                          required
                          onChange={e => setOther(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
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

export default DefermentStudentComponent;
