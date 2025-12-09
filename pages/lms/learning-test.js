import { useState, useEffect } from "react";
import { translateCode } from "../../helpers/language/translate";
import { Form, Card, Row, Col, Button, Table } from "react-bootstrap";
import toast from "react-hot-toast";
import Layout from "../../components/Layout";
import CourseQuestion from "../../components/CourseQuestion";
import Modal from "../../components/Modal";
import CountdownClock from "../../components/CountdownClock";
import QuizModeToggle from "../../components/QuizModeToggle";
import DBForm from "../../helpers/DBForm";
import {
  bounceToPage,
  protectPage,
  getTableSchema,
  getTableData,
  deleteTableRow,
  setTableRow,
  quizOptionsFormat,
  ucfirst,
  readFileObject,
} from "../../helpers/utils";

const API_URL = process.env.API_URL;

const CourseTest = (props) => {
  const pageParentNavs = [
    { route: "/lms/courses", title: "Learning Courses" },
    {
      route: `/lms/course?course_id=${props.courseTest.course_id}`,
      title: "Course",
    },
    {
      route: `/lms/course-module?course_module_id=${props.courseTest.course_module_id}`,
      title: "Course Module",
    },
  ];

  const [testState, setTestState] = useState({ ...props.courseTest });
  const [offlineTestState, setOfflineTestState] = useState({});
  const [validated, setValidated] = useState(false);
  const [questionRowsState, setQuestionRowsState] = useState([
    ...(props.courseQuestions || []),
  ]);
  const [answersByFieldState, setAnswersByFieldState] = useState({});
  const [testFormSchema, setTestFormSchema] = useState({});
  const [infoRows, setInfoRows] = useState([]);
  const [questionFormSchema, setQuestionFormSchema] = useState({});
  const deadline = (testState && new Date(testState.deadline)) || "";
  const pastAttempts = props.pastAttempts || [];
  const currentDatetime = new Date();
  const testType =
    (testState.course_lesson_id && "Lesson") ||
    (testState.course_module_id && "Module") ||
    (testState.course_id && "Course");

  useEffect(() => {
    if (props.error && props.error.message)
      toast.error(props.error.message, { icon: "❌" });

    if (iCanWrite) {
      getTableSchema("course_test", setTestFormSchema);
      getTableSchema("course_question", setQuestionFormSchema);
    }
  }, []);

  const setTest = (testData, isNewForm = false) => {
    setTestState({ ...testState, ...testData });
  };

  const myData = props.userData,
    writeAccess = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"],
    deleteAccess = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"],
    iCanWrite = writeAccess.indexOf(myData.role) > -1,
    iCanDelete = deleteAccess.indexOf(myData.role) > -1,
    iCanTakeTest = myData.role == "STUDENT",
    isOffline = testState.format == "offline",
    testFormFields = [
      "name",
      "format",
      "instructions",
      "duration_mins",
      "deadline",
      "max_attempts",
    ],
    testSelectFields = {
      format: ["quiz", "assignment", "offline"],
    },
    questionFormFields = ["order", "question", "details", "marks"];

  if (testState.format == "quiz") questionFormFields.push("options");
  if (isOffline) testFormFields.push("max_score");
  if (iCanWrite) testFormFields.push("published");

  let pageNotif = "",
    pageNotifClass = "info",
    bestAttempt = null,
    unfinishedTest = null,
    numFinishes = 0;

  if (pastAttempts && pastAttempts.length) {
    pastAttempts.forEach((pastAttempt) => {
      let pastAttemptEndtime = new Date(pastAttempt.endtime);

      if (!bestAttempt || pastAttempt.score > bestAttempt.score)
        bestAttempt = pastAttempt;
      if (!pastAttempt.submitted_at && currentDatetime < pastAttemptEndtime) {
        unfinishedTest = pastAttempt;
        unfinishedTest.secsLeft = Math.floor(
          (new Date(unfinishedTest.endtime).getTime() -
            currentDatetime.getTime()) /
            1000
        );
      } else numFinishes += 1;
    });
  }

  const iStarted =
    (unfinishedTest && new Date(unfinishedTest.created_at)) ||
    (bestAttempt && new Date(bestAttempt.created_at));

  //console.log('>>>>>>>>>>>', unfinishedTest)

  const handleAnswerChange = (e) => {
    let fieldID = e.target.name,
      fieldVal = e.target.value;

    if (e.target.type && e.target.type === "checkbox") {
      fieldVal = e.target.checked;
    } else if ("targetElm" in e.target) {
      fieldID = e.target.targetElm.name;
      fieldVal = {
        text: e.target.getContent(),
        file:
          (answersByFieldState[fieldID] && answersByFieldState[fieldID].file) ||
          "",
      };
    }

    setAnswersByFieldState({
      ...answersByFieldState,
      [fieldID]: fieldVal,
    });
  };
  //console.log(answersByFieldState)

  const handleTestStart = async (event) => {
    event.preventDefault();

    const postData = {
      course_test_id: testState && testState.id,
    };

    const response = await fetch(`${API_URL}/api/studenttest/start`, {
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
        // reload page
        bounceToPage(props.currentURL);
      }
    }

    if (pageNotif) toast(pageNotif);
  };

  const handleTestFinish = async (event) => {
    event && event.preventDefault && event.preventDefault();
    const questions_answers = [];

    //if (event && Array.isArray(event)) questionRowsState = event // For autosubmit case
    // console.log(questionRowsState)

    questionRowsState.forEach((questionRow) => {
      let selection = {};

      if (testState.format == "quiz" && questionRow.options) {
        Object.entries(questionRow.options).forEach(([optionKey, option]) => {
          if (!option.text) return;

          let fieldKey = `question_answer__${questionRow.id}__${optionKey}`;
          selection[optionKey] = {
            is_answer: answersByFieldState[fieldKey] || false,
          };
        });

        questions_answers.push({
          questionId: questionRow.id,
          selection: selection,
        });
      } else if (testState.format == "assignment") {
        let fieldKey = `question_answer__${questionRow.id}`;
        questions_answers.push({
          questionId: questionRow.id,
          text_answer:
            (answersByFieldState[fieldKey] &&
              answersByFieldState[fieldKey].text) ||
            "",
          file_answer:
            (answersByFieldState[fieldKey] &&
              answersByFieldState[fieldKey].file) ||
            "",
        });
      }
    });

    const postData = {
      student_test_id: unfinishedTest && unfinishedTest.id,
      questions_answers,
    };
    //console.log('>>>>>>>', questionRowsState, answersByFieldState, questions_answers, postData)

    const response = await fetch(`${API_URL}/api/studenttest/finish`, {
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
        // Reset fields
        setAnswersByFieldState({});

        // reload page
        bounceToPage(props.currentURL);
      }
    }

    if (pageNotif) toast(pageNotif);
  };

  const handleDelete = async (e) => {
    if (confirm(translateCode("confirm_delete_item"))) {
      const delItems = e.target.id.split("__").slice(-2);
      let [delTable, itemID] = delItems;
      const delData = await deleteTableRow(delTable, itemID);

      if (delData && delData.error && delData.message) {
        pageNotif = delData.message;
        pageNotifClass = "error";
      } else {
        if (delTable == "course_test") setTestState({});
        // Delete Test from UI
        else if (delTable == "course_question") {
          const delQuestion = questionRowsState.filter(
            (q) => q.id == itemID
          )[0];
          setTableRow(
            questionRowsState,
            setQuestionRowsState,
            true,
            itemID
          )(null, false);
          setTestState({
            ...testState,
            max_score: testState.max_score - delQuestion.marks,
          });
        }
        pageNotif = translateCode("deleted");
        pageNotifClass = "success";
      }

      toast(pageNotif);
    }
  };

  const handleOfflineTestChange = (e) => {
    let fieldID = e.target.name,
      fieldVal = e.target.value;

    // Reduced to handling file field for now, since that's what's needed here
    if (e.target.type && e.target.type === "file") {
      fieldVal = e.target.files && e.target.files[0];
      //console.log(11111111111, fieldVal)
    }

    setOfflineTestState({
      ...offlineTestState,
      [fieldID]: fieldVal,
    });
  };

  const handleResultsUpload = async (event) => {
    const form = event.currentTarget;
    let pageNotif = "";

    event.preventDefault();

    const resultsFile = offlineTestState.results_file;
    if (!resultsFile) pageNotif = "No file selected";
    else if (!(resultsFile.type == "text/csv"))
      pageNotif = "Invalid file type: File must be csv";
    else if (resultsFile.size > 209715200)
      pageNotif = "File too large: Must be less than 200MB";

    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else if (pageNotif) {
      event.stopPropagation();
      toast.error(pageNotif, { icon: "❌" });
    } else {
      const endpoint = API_URL + `/api/studenttest/uploadresults`;

      //console.log(111111111111, offlineTestState);

      const fileData = await readFileObject(resultsFile).catch((e) => Error(e));
      //console.log(fileData)

      if (fileData instanceof Error) {
        pageNotif = fileData.message;
        console.log("Error: ", pageNotif);
        toast.error(pageNotif, { icon: "❌" });
      }

      if (fileData.indexOf("matric_no,score") < 0) {
        event.stopPropagation();
        pageNotif =
          "Invalid CSV column headers. First row should be matric_no and score";
        toast.error(pageNotif, { icon: "❌" });
      }

      //console.log(222222222222, resultsFile, fileData);

      if (!pageNotif) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          credentials: "include",
          body: JSON.stringify({
            test_id: props.courseTest.id,
            results_file: fileData,
          }),
        });
        //console.log(response)

        if (response.ok) {
          const result = await response.json();
          //console.log(result)

          if (result.errors && Object.keys(result.errors).length) {
            for (let rowName in result.errors) {
              toast.success(
                `${rowName.replace(/-/g, " ")}: ${result.errors[rowName]}`,
                "error"
              );
            }
          }

          toast(`Valid Rows: ${result.rows_confirmed}/${result.rows_received}`);
          toast.success(
            `Saved Rows: ${result.rows_saved}/${result.rows_received}`,
            { icon: "✅" }
          );
        }
      }
    }

    setValidated(true);
  };

  return (
    <Layout
      pageTitle={`${testType} Test: ${testState.name}`}
      userData={myData}
      parentNavs={pageParentNavs}
    >
      <QuizModeToggle courseTestId={testState.id} currentMode="legacy" />
      <Card>
        <Card.Body>
          <Row>
            <Col xs={11}>
              <h4>
                <b>{testState && testState.name}</b>
              </h4>
            </Col>
            <Col xs={1} className="text-right">
              {iCanWrite ? (
                <Modal
                  openBtnIconClass="fa fa-pencil"
                  preModalTitle={`Edit Test:`}
                  modalTitle={testState && testState.name}
                  modalSize="lg"
                >
                  {(closeModal) => (
                    <DBForm
                      tableName="course_test"
                      formSchema={testFormSchema}
                      formFields={testFormFields}
                      noUpdateFields={["format"]}
                      rowData={testState}
                      //setTableRow={setTableRow(lessonRows, setLessonRows)}
                      afterSuccess={closeModal}
                      setTableRow={setTest}
                      disabledFields={isOffline ? [] : ["max_score"]}
                      selectFields={testSelectFields}
                      preloads={{
                        course_id: testState.course_id,
                        course_module_id: testState.course_module_id,
                        course_lesson_id: testState.course_lesson_id,
                      }}
                    />
                  )}
                </Modal>
              ) : (
                ""
              )}
            </Col>
          </Row>
          <Row>
            <Col sm={unfinishedTest ? 5 : 6}>
              {testState && testState.instructions}
            </Col>
            <Col sm={unfinishedTest ? 5 : 6}>
              <Row>
                <Col xs={3}>
                  <b>Test Format:</b>
                </Col>
                <Col xs={9}>{testState && ucfirst(testState.format)}</Col>
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
              <Row>
                <Col xs={3}>
                  <b>Deadline:</b>
                </Col>
                <Col xs={9}>{deadline.toLocaleString()}</Col>
              </Row>
              <Row>
                <Col xs={3}>
                  <b>Marks:</b>
                </Col>
                <Col xs={9}>{testState.max_score}</Col>
              </Row>
              {!isOffline && iStarted ? (
                <Row style={{ color: "orange" }}>
                  <Col xs={3}>
                    <b>You Started:</b>
                  </Col>
                  <Col xs={9}>
                    <b>{iStarted.toLocaleString()}</b>
                  </Col>
                </Row>
              ) : (
                ""
              )}
              {iCanWrite ? (
                <Row>
                  <Col xs={3}>
                    <b>Published:</b>
                  </Col>
                  <Col
                    xs={9}
                    style={{ color: testState.published ? "green" : "red" }}
                  >
                    <b>{testState.published.toString()}</b>
                  </Col>
                </Row>
              ) : (
                ""
              )}
              {iCanDelete ? (
                <Row className="">
                  <a
                    id={`del0__course_test__{testState.id}`}
                    className="del-button text-danger d-block w-100 text-right"
                    title="Delete"
                    onClick={handleDelete}
                  >
                    <i
                      id={`del__course_test__${testState.id}`}
                      className="fa fa-times-circle-o fa-lg mr-3"
                    />
                  </a>
                </Row>
              ) : (
                ""
              )}
            </Col>
            {unfinishedTest ? (
              <Col sm={2} className="text-center">
                <CountdownClock
                  initSecs={unfinishedTest.secsLeft}
                  fullSecs={unfinishedTest.duration_mins * 60}
                  timeoutFunction={handleTestFinish}
                  externalState={answersByFieldState}
                />
              </Col>
            ) : (
              ""
            )}
          </Row>
        </Card.Body>
      </Card>
      <div className="text-right">
        {iCanWrite && !isOffline ? (
          <Modal
            openBtnTitle="+ Add Question"
            openBtnVariant="default"
            modalTitle="Add New Question"
            modalSize="lg"
            enforceFocus={false}
          >
            {(closeModal) => (
              <DBForm
                tableName="course_question"
                formSchema={questionFormSchema}
                formFields={questionFormFields}
                setTableRow={setTableRow(
                  questionRowsState,
                  setQuestionRowsState
                )}
                afterSuccess={closeModal}
                editorField="details"
                editorHeight={240}
                jsonFields={{ options: quizOptionsFormat }}
                setRelatedManagers={["courseTest", setTest]}
                numTableRows={questionRowsState.length}
              />
            )}
          </Modal>
        ) : (
          ""
        )}
      </div>
      {testState && testState.attempt_number}
      {isOffline ? (
        <Card>
          <Card.Body className="text-center">
            {iCanTakeTest && (
              <>
                <p className="font-weight-bold">
                  {bestAttempt && bestAttempt.created_at
                    ? "You submitted this test!"
                    : "Your records for this test have not been uploaded."}
                </p>
                <p>
                  Your {testState.max_attempts > 1 ? "best" : ""} score:
                  <b>
                    <>
                      {(bestAttempt && bestAttempt.score) || 0}/
                      {testState.max_score}
                    </>
                  </b>
                </p>
              </>
            )}
            {infoRows.length > 0 && (
              <Table>
                <tbody>
                  {infoRows.map((row) => {
                    <tr>
                      <td>{row.rowName}</td>
                      <td>{row.rowMessage}</td>
                    </tr>;
                  })}
                </tbody>
              </Table>
            )}

            {iCanWrite && (
              <Form
                noValidate
                validated={validated}
                onSubmit={handleResultsUpload}
              >
                <Form.Group>
                  <Form.Label>Upload Results (CSV format)</Form.Label>
                  <Form.Control
                    name="results_file"
                    type="file"
                    onChange={handleOfflineTestChange}
                  />
                </Form.Group>
                <Button
                  variant="success"
                  type="submit"
                  //onClick={handleTestStart}
                >
                  Upload
                </Button>
              </Form>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Form>
          {bestAttempt && !unfinishedTest ? (
            <Card>
              <Card.Body className="text-center">
                <p className="font-weight-bold text-success">
                  {bestAttempt.submitted_at
                    ? "You submitted this test!"
                    : "You didn't submit this test on time."}
                </p>
                {bestAttempt.submitted_at ? (
                  <p>
                    On: {new Date(bestAttempt.submitted_at).toLocaleString()}
                  </p>
                ) : (
                  ""
                )}
                <p>
                  Your {testState.max_attempts > 1 ? "best" : ""} score:
                  <b>
                    {testState.format == "assignment" && !bestAttempt.score ? (
                      bestAttempt.submitted_at ? (
                        " Pending"
                      ) : (
                        0
                      )
                    ) : (
                      <>
                        {bestAttempt.score}/{testState.max_score}
                      </>
                    )}
                  </b>
                </p>
                {numFinishes < testState.max_attempts &&
                bestAttempt.score < testState.max_score ? (
                  <>
                    <p>
                      If you think you could improve your score, you can try
                      again.
                    </p>
                    <Button
                      variant="success"
                      type="submit"
                      onClick={handleTestStart}
                    >
                      Try Again
                    </Button>
                  </>
                ) : (
                  ""
                )}
              </Card.Body>
            </Card>
          ) : iCanTakeTest && !unfinishedTest ? (
            <Card>
              <Card.Body className="text-center">
                <Button
                  variant="success"
                  type="submit"
                  onClick={handleTestStart}
                >
                  Start Test
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <>
              {questionRowsState.map((question, i) => (
                <CourseQuestion
                  question={question}
                  key={`question-${i}`}
                  formSchema={questionFormSchema}
                  formFields={questionFormFields}
                  parentTest={testState}
                  // tableManagers={[questionRowsState, setQuestionRowsState]}
                  writeAccess={writeAccess}
                  deleteAccess={deleteAccess}
                  userData={props.userData}
                  changeManagers={[answersByFieldState, handleAnswerChange]}
                  setParentManagers={["courseTest", setTest]}
                  setTableRow={setTableRow(
                    questionRowsState,
                    setQuestionRowsState
                  )}
                  handleDelete={handleDelete}
                />
              ))}
              <Button
                variant="success"
                type="submit"
                disabled={!iCanTakeTest}
                onClick={iCanTakeTest ? handleTestFinish : null}
              >
                Submit
              </Button>
              {iCanTakeTest ? (
                ""
              ) : (
                <p className="text-danger">
                  <sub>Only Students can submit tests</sub>
                </p>
              )}
            </>
          )}
        </Form>
      )}
      <style jsx>{`
        .free-height {
          height: auto !important;
        }

        a.del-button:hover {
          cursor: pointer !important;
        }

        .text-danger {
          color: pink !important;
        }
      `}</style>
    </Layout>
  );
};

CourseTest.getInitialProps = async ({ req, res, query, asPath }) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);
  const pastCheckQuery = {
    course_test_id: query.course_test_id,
    user_id: userData.id,
  };
  const [pastAttempts] =
    userData.role == "STUDENT"
      ? await getTableData("student_test", "", pastCheckQuery, [], false, req)
      : [];

  let [courseQuestions, courseTest, error] = await getTableData(
    "course_question",
    `course_test_id`,
    query,
    [],
    true,
    req
  );

  if (!courseQuestions) {
    // Bookshelf has an unresolved bug that prevents children fetching if the child has a json property
    // while this bug is unresolved, this block will run

    [courseQuestions] = await getTableData(
      "course_question",
      `course_test_id`,
      query,
      [],
      false,
      req
    );
    //console.log(courseQuestions)
  }

  return {
    courseQuestions,
    courseTest,
    pastAttempts,
    userData,
    error,
    currentURL: asPath,
  };
};

export default CourseTest;
