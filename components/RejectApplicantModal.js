import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

const RejectApplicantModal = (props) => {
  const [show, setShow] = useState(false);
  const [rejection, setRejection] = useState("");

  // console.log(props.applicant);
  const handleClose = () => setShow(false);

  const handleShow = () => setShow(true);

  const handleRejectionClick = async () => {
    let data;
    // console.log(rejection, +props.applicant.student.id, +props.applicant.id);
    if (!rejection) {
      alert("You must select a reason for the rejection");

      return;
    }

    try {
      data = await fetch(
        `${process.env.API_URL}/api/reject/${+props.applicant.student.id}`,
        {
          method: "post",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            user_id: +props.applicant.id,
            reason: rejection,
          }),
        }
      );

      data = await data.json();
    } catch (e) {
      console.log(e);
    }
    console.log(data);

    // props.close();
    handleClose();
    props.handleReject(+data.user_id, props.close);
  };

  return (
    <>
      <Button
        variant="danger"
        onClick={() => {
          handleShow();
        }}
      >
        Reject
      </Button>
      <Modal
        show={show}
        onHide={() => {
          handleClose();
          props.open();
        }}
        animation={false}
        dialogClassName=""
        className=" fade bg-dark show"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await handleRejectionClick();

            // props.handleDefermentProcess(data);
            // setData("");
            // handleClose();
            // props.close();
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title className="border-bottom pb-3">
              Reject{" "}
              {`${props.applicant.first_name} ${props.applicant.last_name}'s`}
              Application
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="container">
              <div className="row">
                <div className="col-sm-12 col-md-12">
                  <div className="form-row">
                    <div className="form-group col-md-12  mb-5">
                      <h4 className="mx-3">Rejection Reason</h4>
                      <select
                        id="Gender"
                        className="form-control"
                        name="rejection"
                        onChange={(e) => {
                          setRejection(e.target.value);
                        }}
                        required
                      >
                        <option>...</option>

                        <option
                          value="Your credentials do not match the minimum requirements for the
program"
                        >
                          Not Qualified
                        </option>
                        <option value="Your previous Institution is not recognized by the University.">
                          Institution Not recognized
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary btn-info pointer"
              onClick={() => {
                handleClose();
                props.open();
              }}
            >
              Close
            </Button>
            <Button type="submit" className="btn btn-success">
              Confirm
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};

export default RejectApplicantModal;
