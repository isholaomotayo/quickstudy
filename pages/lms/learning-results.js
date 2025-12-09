import Layout from "../../components/Layout";
// import Table from "../../components/Table";
import {
  protectPage,
  getTableData,
  groupObjectsByProperty
} from "../../helpers/utils";
import { Accordion, Card, Table } from "react-bootstrap";
import Pagination from "../../components/Pagination";
import LearningTestModal from "../../components/lms-component/LearningTestModal";

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

const StudentTestResults = props => {
  const pageParentNavs = [];
  // const pagingData = props.pagingData;

  if (props.isAuthor) {
    if (studentTestCols[0] != "username") {
      studentTestCols.unshift("username", "first_name", "last_name");
    }
  } else disabledFields.push("score");

  return (
    <Layout
      pageTitle="Learning Results"
      userData={props.userData}
      parentNavs={pageParentNavs}
    >
      <div className="my-5 border-bottom">
        <h4>Click the view button to see details of each test</h4>
      </div>
      <Table responsive="md" striped bordered hover>
        <thead>
          <tr>
            <th className="bold">#</th>
            <th className="bold">Course Name</th>
            <th className="bold">Test Name</th>
            <th className="bold">Action</th>
          </tr>
        </thead>
        <tbody>
          {props.studentCourseTestName.map((test, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td className="bold">{test.name}</td>
              <td className="bold">{test.test_name}</td>
              <td>
                <LearningTestModal
                  isAuthor={props.isAuthor}
                  courseTestId={test.course_test_id}
                  userData={props.userData}
                  title={`${test.test_name}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* <Accordion>
        {Object.entries(props.studentTestsByName).map(
          ([testName, submissions], i) => {
            return (
              <Card key={`course_test_${i}`}>
                <Accordion.Toggle as={Card.Header} eventKey={i}>
                  {testName}
                </Accordion.Toggle>
                <Accordion.Collapse eventKey={i}>
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
                </Accordion.Collapse>
              </Card>
            );
          }
        )}
      </Accordion> */}
      {/* {pagingData && pagingData.rowCount > props.numFetched && (
        <Pagination
          total={pagingData.rowCount}
          dataPerPage={pagingData.pageSize}
          href={`${props.pathname}?pgsize=${pagingData.pageSize}&pg=`}
          currentPage={pagingData.page}
        />
      )} */}
      <style jsx global>{`
        .accordion {
          border: none !important;
        }
        .card {
          margin-bottom: 0 !important;
          border-image: none 100% 1 0 stretch !important;
        }
        .card .card-header {
          cursor: pointer;
          background-color: #f5f5f5 !important;
        }
      `}</style>
    </Layout>
  );
};

StudentTestResults.getInitialProps = async ({ req, res, query, pathname }) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  const authors = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"],
    isAuthor = authors.indexOf(role) > -1;

  // let [studentTests, nothing, error, pagingData] = await getTableData(
  //   "student_test",
  //   "",
  //   query,
  //   [],
  //   false,
  //   req
  // );
  let studentCourseTestName;
  // const numFetched = studentTests.length;

  studentCourseTestName = await fetch(
    `${process.env.API_URL}/api/studenttest/new`,
    {
      method: "get",
      credentials: "include",
      headers: req
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
    }
  );

  studentCourseTestName =
    studentCourseTestName.status === 200
      ? await studentCourseTestName.json()
      : [];

  // if (studentTests && studentTests.length) {
  //   studentTests = getBestTests(studentTests);

  //   if (isAuthor) {
  //     studentTests = studentTests.map(studentTest => {
  //       studentTest.first_name = studentTest.user.first_name;
  //       studentTest.last_name = studentTest.user.last_name;
  //       studentTest.username = studentTest.user.username;

  //       return studentTest;
  //     });
  //   }

  //   // studentTestsByName = groupObjectsByProperty(studentTests, "test_name");
  // }
  //console.log(studentTests, studentTestsByName)
  return {
    // studentTestsByName,
    userData,
    // error,
    isAuthor,
    // pagingData,
    // pathname,
    // numFetched,
    studentCourseTestName
  };
};

// function getBestTests(tests) {
//   // Returns only only the highest score tests taken by each student

//   const bestByTestAndStudent = {};

//   tests.forEach(test => {
//     let testID = `${test.course_test_id}_${test.user_id}`;
//     if (testID in bestByTestAndStudent) {
//       if (
//         test.score &&
//         (!bestByTestAndStudent[testID].score ||
//           test.score > bestByTestAndStudent[testID].score)
//       ) {
//         bestByTestAndStudent[testID] = test;
//       }
//     } else bestByTestAndStudent[testID] = test;
//   });

//   return Object.values(bestByTestAndStudent);
// }

// function addQuizResultsHTMLField(test) {
//   const answers_html = test.questions_answers.map(question_answer => {
//     return (
//       <div>
//         <div>
//             <div className="font-weight-bold">
//             {question_answer.questionOrder+'. '}
//             {question_answer.questionText}
//             </div>
//             {
//               question_answer.marks
//               ? <div className="small-text">{`(${question_answer.marks} mark${question_answer.marks > 1 ? 's' : ''})`}</div>
//               : ""
//             }
//         </div>
//         <div className="answers">
//             {Object.entries(question_answer.selection).map(([key, option]) => {
//               let answerFieldID = `qa__${question_answer.questionId}__${key}`
//               return (
//               <Row key={answerFieldID}>
//                 <Col xs={1}>
//                   {key+': '}
//                 </Col>
//                 <Col xs={10}>
//                   {option.text}
//                 </Col>
//                 <Col xs={1}>
//                   <i className={option.is_answer ? "fa fa-plus-circle" : ""} />
//                 </Col>
//               </Row>
//               )
//             })
//             }
//         </div>
//       </div>
//     )
//   })

//   test.answers__prefab = <div>{answers_html}</div>
//   return test
// }

export default StudentTestResults;
