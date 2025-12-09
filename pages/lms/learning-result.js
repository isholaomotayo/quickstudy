import { useState, useEffect } from "react";
import { Form, Card, Row, Col, Button } from "react-bootstrap";
import toast from "react-hot-toast";
import Layout from "../../components/Layout";
import CourseQuestion from "../../components/CourseQuestion";
import {
  showToastAlert,
  protectPage,
  getTableData,
  ucfirst,
} from "../../helpers/utils";
import { translateCode } from "../../helpers/language/translate";
import { TEST_MARKING_EDIT_MINS } from "../../constants";

const API_URL = process.env.API_URL;
const TestResult = (props) => {
  const pageParentNavs = [
    { route: "/lms/learning-results", title: "Learning Results" },
  ];

  const [testState, setTestState] = useState(props.studentTest),
    currentDatetime = new Date(),
    testStarted = testState && new Date(testState.created_at),
    testDeadline = testState && new Date(testState.deadline),
    testSubmitted =
      testState && testState.submitted_at && new Date(testState.submitted_at),
    testMarked =
      testState && testState.marked_at && new Date(testState.marked_at),
    testMarker = testState && testState.marker,
    testMarkEditEndtime =
      testMarked &&
      new Date(testMarked.getTime() + TEST_MARKING_EDIT_MINS * 60000),
    myData = props.userData,
    iCanWrite =
      props.writeAccess && props.writeAccess.indexOf(myData.role) > -1,
    iCanMark =
      iCanWrite &&
      !(testMarkEditEndtime && currentDatetime > testMarkEditEndtime);

  
  let pageNotif = "",
    pageNotifClass = "info";

  const handleFieldChange = (e) => {
    let fieldID = e.target.name,
      fieldVal = e.target.value;

    if (fieldID == "score" && fieldVal > testState.max_score) {
      fieldVal = testState.max_score;
      pageNotif = translateCode("cannot_exceed_max_test_score");
      toast.error(pageNotif, { icon: "❌" });
    }

    setTestState({
      ...testState,
      [fieldID]: fieldVal,
    });
  };

  const handleTestMarking = async (event) => {
    event && event.preventDefault && event.preventDefault();

    if (testState.format != "assignment") {
      pageNotif = translateCode("wrong_test_type");
      pageNotifClass = "error";
    }

    if (!pageNotif) {
      const postData = {
        student_test_id: testState && testState.id,
        score: testState.score,
      };
      //console.log('>>>>>>>', postData)

      const response = await fetch(`${API_URL}/api/studenttest/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        credentials: "include",
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const result = await response.json();
        //console.log(result)

        if (result && result.pageNotif) {
          pageNotif = translateCode(result.pageNotif);
          pageNotifClass = "error";
        } else if (result && result.id) {
          pageNotif = translateCode("test_marked");
          pageNotifClass = "success";
        }
      }
    }

    if (pageNotif) toast(pageNotif);
  };

  return (
    <Layout
      pageTitle={`${testState.format.toUpperCase()}: ${testState.test_name}`}
      userData={myData}
      parentNavs={pageParentNavs}
    >
      <Card>
        <Card.Body>
          <Row>
            <Col xs={12}>
              <h4>
                <b>{testState.test_name}</b>
              </h4>
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <div>{testState.submitted_at ? "Submitted" : "Started"} by:</div>
              <div>
                <b>{`${testState.user.first_name} ${testState.user.last_name} (${testState.user.username})`}</b>
              </div>
              {testState.marked_by && testMarked ? (
                <>
                  <br />
                  <div>
                    Marked by:{" "}
                    <b>
                      {testMarker
                        ? `${testMarker.first_name} ${testMarker.last_name}`
                        : `UID ${testState.marked_by}`}
                    </b>
                  </div>
                  <div>
                    Marked on: <b>{testMarked.toLocaleString()}</b>
                  </div>
                </>
              ) : (
                ""
              )}
            </Col>
            <Col sm={6}>
              <Row>
                <Col xs={3}>
                  <b>Test Format:</b>
                </Col>
                <Col xs={9}>{ucfirst(testState.format)}</Col>
              </Row>
              <Row>
                <Col xs={3}>
                  <b>Duration:</b>
                </Col>
                <Col xs={9}>
                  {testState &&
                    `${testState.duration_mins} min${
                      testState.duration_mins > 1 ? "s" : ""
                    }`}
                </Col>
              </Row>
              <Row style={{ color: "orange" }}>
                <Col xs={3}>
                  <b>Started:</b>
                </Col>
                <Col xs={9}>
                  <b>{testStarted.toLocaleString()}</b>
                </Col>
              </Row>
              <Row style={{ color: "green" }}>
                <Col xs={3}>
                  <b>Submitted:</b>
                </Col>
                <Col xs={9}>
                  <b>{testSubmitted && testSubmitted.toLocaleString()}</b>
                </Col>
              </Row>
              <Row>
                <Col xs={3}>
                  <b>Score:</b>
                </Col>
                <Col xs={9}>
                  <b>
                    {
                      <>
                        {testState.format == "assignment" && iCanMark ? (
                          <Form>
                            <Form.Row>
                              <Col>
                                <Form.Control
                                  name="score"
                                  type="number"
                                  value={testState.score}
                                  required={true}
                                  size="sm"
                                  onChange={handleFieldChange}
                                  max={testState.max_score}
                                />
                              </Col>
                              <Col className="my-auto">
                                <span className="align-middle">
                                  /{testState.max_score}
                                </span>
                              </Col>
                              <Col>
                                <Button
                                  variant="primary"
                                  type="submit"
                                  onClick={handleTestMarking}
                                >
                                  Save
                                </Button>
                              </Col>
                            </Form.Row>
                            <p className="text-danger">
                              <sub>
                                {`* Test scores become uneditable ${TEST_MARKING_EDIT_MINS} minutes after saving.`}
                              </sub>
                            </p>
                          </Form>
                        ) : testState.format == "assignment" &&
                          !testState.marked_at ? (
                          "(Pending)"
                        ) : (
                          <>
                            {testState.score}/{testState.max_score}
                          </>
                        )}
                      </>
                    }
                  </b>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      {testState.questions_answers.length &&
        testState.questions_answers.map((question_answer, i) => {
          let question = {
            id: question_answer.questionId,
            order: question_answer.questionOrder,
            question: question_answer.questionText,
            marks: question_answer.questionMarks,
          };

          if (testState.format == "quiz")
            question.options = question_answer.selection;
          else if (testState.format == "assignment")
            question.textsubmits = question_answer.selection;
          //console.log(question)
          return (
            <CourseQuestion
              question={question}
              key={`question-${i}`}
              parentTest={testState}
              userData={props.userData}
              disabled={true}
            />
          );
        })}
      <style jsx global>{`
        .free-height {
          height: auto !important;
        }
      `}</style>
    </Layout>
  );
};

TestResult.getInitialProps = async ({ req, res, query, asPath }) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const writeAccess = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  const [studentTests] = await getTableData(
      "student_test",
      "id",
      query,
      [],
      false,
      req
    ),
    studentTest = studentTests.length && studentTests[0];
  if (role == "STUDENT" && studentTest.user_id == userId && !studentTest.user) {
    studentTest.user = userData;
  }
  //console.log(studentTest)
  return { studentTest, userData, writeAccess };
};

export default TestResult;
