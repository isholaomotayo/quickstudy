import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import toast from "react-hot-toast";

const ApproveAction = props => {
  return (
    <span className="fs-18 text-success" style={{ cursor: "pointer" }}>
      <a
        title="Approve"
        onClick={() => {
          props.handleApprovedClick(props.id);
        }}
      >
        <i className="fa fa-check" /> Approve
      </a>
    </span>
  );
};

const UnApproveAction = props => {
  return (
    <span className="fs-18 text-dark" style={{ cursor: "pointer" }}>
      <a
        title="Approve"
        onClick={() => {
          props.handleunApproveClick(props.id);
        }}
      >
        <i className="fa fa-times" /> Unapprove
      </a>
    </span>
  );
};

const CourseApprovalModal = props => {
  const [show, setShow] = useState(false);
  const [userCourse, setUserCourse] = useState({});
  

  const handleClose = () => setShow(false);
  const handleCreation = async e => {
    handleClose();
  };
  const handleShow = async () => {
    let studentCourse;
    try {
      studentCourse = await fetch(
        `${process.env.API_URL}/api/studentcourse/studentid/${props.user.student.id}`,
        {
          method: "get",
          credentials: "include",
          headers: {}
        }
      );

      studentCourse =
        studentCourse.status === 200 ? await studentCourse.json() : [];
    } catch (e) {
      console.log(e);
    }
    setUserCourse(studentCourse);

    setShow(true);
  };

  const handleApprovedClick = async id => {
    let data;

    try {
      data = await fetch(`${process.env.API_URL}/api/studentcourse/${id}`, {
        //mode: "no-cors",
        method: "put",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          approval_status: "1"
        })
      });

      data = data.status === 200 ? await data.json() : {};

      if (Object.entries(data).length > 0) {
        let filteredCourse = userCourse.filter(val => val.id !== id);

        filteredCourse = [...filteredCourse, data];

        toast.success("Course Registration has been successfully approved ");
        setUserCourse(filteredCourse);
      } else {
        toast.error("Course Registration Approval Failed");

        return;
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleunApproveClick = async id => {
    let data;

    try {
      data = await fetch(`${process.env.API_URL}/api/studentcourse/${id}`, {
        //mode: "no-cors",
        method: "put",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          approval_status: "0"
        })
      });

      data = data.status === 200 ? await data.json() : {};

      if (Object.entries(data).length > 0) {
        let filteredCourse = userCourse.filter(val => val.id !== id);

        filteredCourse = [...filteredCourse, data];

        toast.success("Course Registration has been successfully unapproved ");
        setUserCourse(filteredCourse);
      } else {
        toast.error("Course Registration unapproval failed");

        return;
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Button
        className="btn btn-complete text-white btn-sm ml-2"
        onClick={handleShow}
      >
        Course Approval
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
          <Modal.Header closeButton></Modal.Header>
          <Modal.Body>
            <div className="card card-transparent">
              <div className="card-header ">
                <div className="card-title">
                  <h4>
                    {props.user.first_name} {props.user.last_name} Courses
                  </h4>
                </div>
                <div className="col-sm-12 col-md-6"></div>
                <div className="pull-right">
                  <div className="col-xs-12"></div>
                </div>
                <div className="clearfix" />
              </div>
              <div className="card-body">
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Course Title</th>
                      <th>Course Code</th>
                      <th>Approved</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userCourse.length ? (
                      userCourse.map(studentcourse => (
                        <tr key={studentcourse.id}>
                          <td>{studentcourse.course.name}</td>

                          <td>{studentcourse.course.code}</td>

                          <td className="w-15">
                            <span className="fs-18">
                              {studentcourse.approval_status ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="w-15">
                            {studentcourse.approval_status ? (
                              <UnApproveAction
                                id={studentcourse.id}
                                handleunApproveClick={handleunApproveClick}
                              />
                            ) : (
                              <ApproveAction
                                id={studentcourse.id}
                                handleApprovedClick={handleApprovedClick}
                              />
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="w-100">No records found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary btn-info" onClick={handleClose}>
              Close
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
          }
        `}
      </style>
    </>
  );
};

export default CourseApprovalModal;
