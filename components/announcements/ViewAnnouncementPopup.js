import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

const ViewAnnouncementPopup = (props) => {
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setTimeout(() => {
      setShow((prev) => !prev);
    }, 1000);
  };

  const handleShow = () => {
    setShow(true);
  };

  return (
    <>
      <a
        className="text-big text-primary cursor"
        onClick={() => {
          handleShow();
        }}
      >
        {props.announcement.title}
      </a>

      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{props.announcement.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="card card-default">
            <div className="card-body">
              <form role="form">
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <div className="form-group ">
                        <h4 className="">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: props.announcement.body,
                            }}
                          />
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary btn-info" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ViewAnnouncementPopup;
