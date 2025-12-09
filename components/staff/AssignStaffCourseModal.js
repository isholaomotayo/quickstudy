import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Select from 'react-select';

const AssignStaffCourseModal = props => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="info" onClick={handleShow}>
        <i className="fa fa-pencil" /> Assign Staff to Course(s)
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        animation={false}
        dialogClassName="modal-90w w-75"
        className="fill-in show"
      >
        <Modal.Header closeButton>
          <Modal.Title>Assign Staff to Course(s)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group col-md-4">
                <label>Staff</label>

                <Select
                  name="staffIds"
                  placeholder="Select Staff"
                  value={props.state.staffIds}
                  options={props.allStaff}
                  onChange={props.handleStaffMultiChange}
                  isMulti
                />
              </div>
              <div className="form-group col-md-4">
                <label>Courses</label>
                <Select
                  isMulti
                  name="courseIds"
                  placeholder="Select Course(s)"
                  value={props.state.courseIds}
                  options={props.courses}
                  onChange={props.handleCourseMultiChange}
                  required
                />
              </div>
            </div>
            <style jsx>
              {`
                .avatar-input {
                  position: relative;
                  overflow: hidden;
                }
                .avatar {
                  position: relative;
                  display: inline-block;
                }
                .avatar-xl {
                  width: 5.125rem;
                  height: 5.125rem;
                }
                .avatar {
                  width: 3rem;
                  height: 3rem;
                }
                .avatar-img {
                  width: 100%;
                  height: 100%;
                  -o-object-fit: cover;
                  object-fit: cover;
                }

                .avatar-input .avatar-input-icon {
                  position: absolute;
                  top: 0;
                  display: flex;
                  width: 100%;
                  height: 100%;
                  transition: all ease 0.2s;
                  opacity: 0;
                  color: #fff;
                  background: rgba(0, 0, 0, 0.37);
                  justify-content: center;
                  align-items: center;
                }

                .avatar-input .avatar-file-picker {
                  position: absolute;
                  z-index: 2;
                  width: 1px;
                  height: 1px;
                  margin: 0;
                  opacity: 0;
                }
              `}
            </style>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              props.handleAssignment();
              handleClose();
            }}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AssignStaffCourseModal;
