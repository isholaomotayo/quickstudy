import React, { useState, useRef, useCallback } from "react";
import { Container, Row, Col, Table, Form, Modal } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";
const IDCardComponent = (props) => {
  const componentRef = useRef();

  const [show, setShow] = useState(false);
  const { user = {}, student = {} } = props;
  const handleShow = () => setShow(true);

  const handleClose = () => setShow(false);

  // Print handlers using useCallback
  const handleAfterPrint = useCallback(() => {
    console.log("ID Card printed successfully!");
  }, []);

  const handleBeforePrint = useCallback(() => {
    console.log("Starting ID Card print...");
    console.log("Current props before print:", props);
    // Give React time to fully render the component with updated data
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Print delay complete, proceeding with print");
        resolve();
      }, 100); // Small delay to ensure DOM is updated
    });
  }, [props]);

  // useReactToPrint hook - trying both APIs for compatibility
  const printIDCard = useReactToPrint({
    content: () => componentRef.current, // Fallback for older versions
    contentRef: componentRef, // For newer versions
    documentTitle: `${user.first_name || "Student"}_${
      user.last_name || "ID"
    }_Card`,
    onAfterPrint: handleAfterPrint,
    onBeforePrint: handleBeforePrint,
  });

  // Clean print handler
  const handlePrintIDCard = () => {
    if (printIDCard && typeof printIDCard === "function") {
      printIDCard();
    } else {
      console.warn("Print function not available");
    }
  };
  // console.log(student);
  return (
    <>
      <button className="btn btn-primary px-3" onClick={handleShow}>
        My ID Card
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        style={{
          width: "400px !important",
        }}
        dialogClassName="modal-90w modal-wee"
      >
        <Modal.Header closeButton className="mb-3">
          <Modal.Title>
            {user.first_name} {user.last_name}'s ID Card
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          ref={componentRef}
          style={{
            padding: "0 !important",
          }}
          className="pd-0"
        >
          <div id="bg">
            <img
              src="https://res.cloudinary.com/emergingplatforms/image/upload/v1599659101/ilearn/imx77tvx5wzp1vnd7kto.png"
              alt=""
            />
            <div className="val-e">
              <p className=" py-2">Name</p>
              <p className=" py-2">Name</p>
              <p className=" py-2">Name</p>
              <p className=" py-2">Name</p>
              <p className=" py-2">Name</p>
              <p className=" py-2">Name</p>
            </div>
            <div
              className="row"
              style={{
                position: "relative",
                top: "40%",
                left: "-40%",
              }}
            >
              {user.avatar && user.avatar.length > 0 ? (
                <img
                  src="data:image/jpeg;base64,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"
                  width="100%"
                  height="100%"
                />
              ) : (
                <p className=" ">N/A</p>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-complete"
            onClick={handlePrintIDCard}
            type="button"
          >
            Download
          </button>
          <button
            className="btn btn-danger"
            type="button"
            onClick={handleClose}
          >
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
      <style jsx global>
        {`
          .pls {
            background: url(https://res.cloudinary.com/emergingplatforms/image/upload/v1599659101/ilearn/imx77tvx5wzp1vnd7kto.png)
              no-repeat center center fixed;
            -webkit-background-size: cover;
            -moz-background-size: cover;
            -o-background-size: cover;
            background-size: cover;
          }
          .modal-wee {
            width: 80vw !important;
            margin-left: 30px;
            margin: 20px auto !important;
          }
          . {
            font-size: 30px;
          }
          #bg {
            position: fixed;
            top: -80%;
            left: -50%;
            width: 200%;
            height: 200%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .val-e {
            z-index: 1;
            margin-top: 170px;
            margin-left: -200px;
          }
          #bg img {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;
            min-width: 20%;
            min-height: 20%;
          }

          #bge {
            position: fixed;
            top: -20%;
            left: -50%;
            width: 200%;
            height: 200%;
          }
          #bge img {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;
            min-width: 20%;
            min-height: 20%;
          }
        `}
      </style>
    </>
  );
};

export default IDCardComponent;

const PrintableIDCard = React.forwardRef((props, ref) => {
  const {
    firstName,
    lastName,
    studentId,
    faculty,
    department,
    programme,
    endYear,
    avatar,
    frontImage,
    backImage,
  } = props;

  return (
    <div ref={ref}>
      <div id="bg">
        <img src={frontImage} alt="" />
      </div>
      <div className="val-e">
        <p className="">
          NAME: {firstName && firstName.toUpperCase()}{" "}
          {lastName && lastName.toUpperCase()}
        </p>
        <p className=" py-2">ID: {studentId || "NO-ID"}</p>
        <p className=" py-2">
          FACULTY:{" "}
          {faculty
            ? faculty.replace("Faculty of ", "").toUpperCase()
            : "NO-FACULTY"}
        </p>
        <p className=" py-2">
          DEPT:{" "}
          {department
            ? department.replace("Department of ", "").toUpperCase()
            : "NO-DEPT"}
        </p>
        <p className=" py-2">PROG: {programme || "NO-PROGRAMME"}</p>
        <p className=" py-2">YEAR: {endYear || "NO-YEAR"}</p>
      </div>
      <div
        className="row"
        style={{
          position: "absolute",
          top: "16%",
          right: "2%",
        }}
      >
        {avatar && avatar.length > 0 ? (
          <img
            src={avatar}
            width="150px"
            height="100%"
            alt="Student Photo"
            style={{ zIndex: 1000 }}
          />
        ) : (
          <p className="">N/A</p>
        )}
      </div>
      <div id="bge">
        <img src={backImage} alt="ID Card Back" />
      </div>
      <style jsx global>
        {`
          . {
            font-size: 60px;
          }
          .modal-wee {
            width: 80vw !important;
            margin-left: 30px;
            margin: 20px auto !important;
          }
          #bg {
            position: fixed;
            top: -78%;
            left: -50%;
            width: 200%;
            height: 200%;
            z-index: -1000;
          }
          .val-e {
            z-index: 1000;
            margin-top: 200px;
            margin-left: 250px;
          }
          #bg img {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;
            min-width: 20%;
            min-height: 20%;
          }
          #bge {
            position: fixed;
            top: 20%;
            left: 0%;
            width: 100%;
            height: 100%;
          }
          #bge img {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;
            min-width: 20%;
            min-height: 20%;
          }
        `}
      </style>
    </div>
  );
});

PrintableIDCard.displayName = "PrintableIDCard";
export { PrintableIDCard, PrintableIDCard as ComponentValue };
