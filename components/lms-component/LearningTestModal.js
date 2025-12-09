import React, { useState } from "react";
import { Button, Card, Modal } from "react-bootstrap";
import Table from "../Table";
import { getTableData, groupObjectsByProperty } from "../../helpers/utils";

const studentTestCols = [
  "format",
  "submitted_at",
  "deadline",
  "score",
  "max_score"
];
const disabledFields = [
  "test_name",
  "format",
  "duration_mins",
  "max_score",
  "created_at",
  "submitted_at",
  "deadline",
  "updated_at"
];

const LearningTestModal = props => {
  const [show, setShow] = useState(false);
  const [studentTestData, setStudentTestData] = useState([]);
  const [numFetched, setNumFetched] = useState(0);

  const getBestTests = tests => {
    // Returns only only the highest score tests taken by each student

    const bestByTestAndStudent = {};

    tests.forEach(test => {
      let testID = `${test.course_test_id}_${test.user_id}`;
      if (testID in bestByTestAndStudent) {
        if (
          test.score &&
          (!bestByTestAndStudent[testID].score ||
            test.score > bestByTestAndStudent[testID].score)
        ) {
          bestByTestAndStudent[testID] = test;
        }
      } else bestByTestAndStudent[testID] = test;
    });

    return Object.values(bestByTestAndStudent);
  };

  const handleClose = () => setShow(false);

  const handleShow = async () => {
    const query = {
      course_test_id: props.courseTestId
    };
    let [studentTests, nothing, error, pagingData] = await getTableData(
      "student_test",
      "",
      query,
      [],
      false,
      {}
    );
    let studentTestsByName = {};
    const numFetchedTemp = studentTests.length;
    setNumFetched(numFetchedTemp);

    if (studentTests && studentTests.length) {
      studentTests = getBestTests(studentTests);

      if (props.isAuthor) {
        studentTests = studentTests.map(studentTest => {
          studentTest.first_name = studentTest.user.first_name;
          studentTest.last_name = studentTest.user.last_name;
          studentTest.username = studentTest.user.username;

          return studentTest;
        });
      }

      studentTestsByName = groupObjectsByProperty(studentTests, "test_name");

      setStudentTestData(studentTestsByName);
    }
    setShow(true);
  };

  if (props.isAuthor === true) {
    if (studentTestCols[0] != "username") {
      studentTestCols.unshift("username", "first_name", "last_name");
    }
  } else disabledFields.push("score");

  return (
    <>
      <button
        className="btn btn-success"
        onClick={async () => {
          await handleShow();
        }}
      >
        View
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        dialogClassName="modal-90w modal-w"
      >
        <Modal.Header closeButton>
          <Modal.Title className="my-5">{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {Object.entries(studentTestData).map(([testName, submissions], i) => {
            return (
              <Card key={`course_test_${i}`}>
                <Card.Body>
                  <Table
                    rows={submissions}
                    tableName={"student_test"}
                    tableCols={studentTestCols}
                    userData={props.userData}
                    hideAdd={true}
                    noForm={true}
                    subPage="lms/learning-result"
                    subRef="id"
                    subLinkTitle="View"
                  />
                </Card.Body>
              </Card>
            );
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary btn-info" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <style jsx global>
        {`
          .modal-w {
            width: 90vw !important;
            margin: 20px auto !important;
            margin-left: 30px;
          }
        `}
      </style>
    </>
  );
};

export default React.memo(LearningTestModal);
