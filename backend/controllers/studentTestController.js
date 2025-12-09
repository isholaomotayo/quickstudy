const boom = require("boom");
const CourseTest = require("../models/CourseTest");
const CourseQuestion = require("../models/CourseQuestion");
const StudentTest = require("../models/StudentTest");
const Student = require("../models/Student");
const User = require("../models/User");
const { calculateTestScore } = require("../helpers/utils");
const { getInstitutionCourses } = require("./courseController");
const checkAccess = require("../helpers/utils").checkAccess;
const setPaginationHeaders = require("../helpers/utils").setPaginationHeaders;
const Bookshelf = require("../config/connection").Bookshelf;

const csv = require("csvtojson");

// Get all StudentTests
exports.list = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  let withRelated = ["user"];

  let query = StudentTest.forge().orderBy("id", "desc");

  if (validatedUser.role == "STUDENT") {
    query.where("user_id", +validatedUser.id);
    withRelated = [];
  } else if (validatedUser.role == "STAFF") {
    //query.where("institution_id", +validatedUser.institution_id)
    query.where("department_id", +validatedUser.staff.department_id);
    // Refine later so staff only sees assigned course tests
  } else if (validatedUser.role == "HOD") {
    //query.where("institution_id", +validatedUser.institution_id)
    query.where("department_id", +validatedUser.staff.department_id);
  } else if (validatedUser.role == "ADMIN") {
    query.where("institution_id", +validatedUser.institution_id);
  } else if (validatedUser.role == "SUPERADMIN") {
    // Do nothing
  } else {
    // Incase we add a new role and forget to filter :)
    throw boom.boomify("Improper access");
  }

  const { pgsize = 500, pg = 1, ...req_query } = req.query;
  if (filterKey && filterValue) query.where(filterKey, +filterValue);
  else if (req_query) query.where(req_query);

  try {
    let studentTests = await query.fetchPage({
      pageSize: pgsize,
      page: pg,
      withRelated
    });

    if (studentTests.pagination)
      setPaginationHeaders(reply, studentTests.pagination);
    if (studentTests.models) studentTests = studentTests.models;

    if (studentTests.length == 1 && studentTests[0].attributes.marked_by) {
      const marker = await User.where(
        "id",
        studentTests[0].attributes.marked_by
      ).fetch();
      studentTests[0].set({ marker });
    }

    if (studentTests.length > 10) {
      // Trim excesses to prevent list page overload
      studentTests = studentTests.map(studentTest => {
        let testUser =
          studentTest.relations &&
          studentTest.relations.user &&
          studentTest.relations.user.attributes;

        studentTest = studentTest.attributes;
        delete studentTest.questions_answers;

        if (testUser) {
          studentTest.user = {
            first_name: testUser.first_name,
            last_name: testUser.last_name,
            username: testUser.username
          };
        }

        return studentTest;
      });
    }
    //console.log(studentTests[5])
    return studentTests;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.get = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const withRelated = ["user"];

  // TODO: Filter by role

  try {
    //const StudentTest = await StudentTest.where('id', req.params.id).fetch({withRelated: ['Student_questions']});
    const studentTest = await StudentTest.where("id", req.params.id).fetch({
      withRelated
    });
    
    // Ensure feedback is properly included in the response
    const result = studentTest.toJSON();
    
    // Handle null values for arrays to prevent validation errors
    if (result.questions_answers === null) {
      result.questions_answers = [];
    }
    if (result.feedback === null) {
      result.feedback = [];
    }
    
    console.log("StudentTest get response:", {
      id: result.id,
      feedback: result.feedback,
      feedbackType: typeof result.feedback
    });
    
    return result;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// exports.add = async (req, reply) => {
//   // Deprecated, will be removed soon: use start & finish instead
//   const allowedRoles = ["STUDENT"];
//   const { validatedUser, filterKey, filterValue } = checkAccess(
//     req,
//     reply,
//     allowedRoles
//   );

//   const postBody = { ...req.body };
//   const priorAttempts = +(await StudentTest.where({
//     course_test_id: +postBody.course_test_id,
//     user_id: +validatedUser.id
//   }).count());
//   const courseTest = await CourseTest.where(
//     "id",
//     +postBody.course_test_id
//   ).fetch();
//   const courseTestProps = courseTest && courseTest.attributes;

//   let pageNotif = "";
//   //console.log('>>>>>>>>>', postBody, priorAttempts, courseTest)

//   // Do all validations here
//   if (!courseTestProps) pageNotif = "invalid_test_post_attempt";
//   if (priorAttempts && priorAttempts >= courseTestProps.max_attempts)
//     pageNotif = "test_max_attempts_exceeded";

//   if (pageNotif) return { pageNotif };

//   // getRelated won't work for this type of child object, so fetch children seperately
//   const testQuestions = await CourseQuestion.where(
//     "course_test_id",
//     courseTestProps.id
//   ).fetchAll();
//   const questionsByID = {};

//   if (!testQuestions.length) return { pageNotif: "test_no_questions" };

//   testQuestions.forEach(testQuestion => {
//     questionsByID[testQuestion.id] = testQuestion;
//   });

//   //console.log('>>>>>>>>>', postBody, priorAttempts, courseTest, questionsByID)
//   try {
//     const studentTestData = {
//       user_id: +validatedUser.id,
//       course_test_id: courseTestProps.id,
//       test_name: courseTestProps.name,
//       duration_mins: courseTestProps.duration_mins,
//       deadline: courseTestProps.deadline,
//       attempt_number: priorAttempts + 1,
//       max_attempts: courseTestProps.max_attempts,
//       questions_answers: postBody.questions_answers.map(question_answer => {
//         let testQuestionProps =
//           questionsByID[question_answer.questionId].attributes;

//         Object.entries(testQuestionProps.options).forEach(
//           ([optionKey, option]) => {
//             if (!question_answer.selection[optionKey]) return;
//             question_answer.selection[optionKey].text = option.text;
//           }
//         );

//         return {
//           questionId: question_answer.questionId,
//           questionOrder: testQuestionProps.order,
//           questionText: testQuestionProps.question,
//           selection: question_answer.selection
//         };
//       }),
//       score: calculateTestScore(postBody.questions_answers, questionsByID),
//       max_score: courseTestProps.max_score
//     };

//     studentTestData.questions_answers = JSON.stringify(
//       studentTestData.questions_answers
//     );
//     const newStudentTest = await StudentTest.forge(studentTestData).save();
//     return newStudentTest;
//   } catch (err) {
//     throw boom.boomify(err);
//   }
// };

exports.start = async (req, reply) => {
  const allowedRoles = ["STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  const postBody = { ...req.body };
  const courseTest = await CourseTest.where(
    "id",
    +postBody.course_test_id
  ).fetch({ withRelated: "course_module.course" });
  const courseTestProps = courseTest && courseTest.attributes;
  const priorAttempts = +(await StudentTest.where({
    course_test_id: +postBody.course_test_id,
    user_id: +validatedUser.id
  }).count());
  const currentDatetime = new Date();

  const course =
    courseTest &&
    courseTest.relations &&
    courseTest.relations.course_module &&
    courseTest.relations.course_module.relations &&
    courseTest.relations.course_module.relations.course;
  const courseProps = course && course.attributes;

  let pageNotif = "";
  //console.log('>>>>>>>>>>>', postBody, priorAttempts, courseTest, courseProps)

  // Do all validations here
  if (!courseTestProps) pageNotif = "invalid_test_post_attempt";
  else if (priorAttempts && priorAttempts >= courseTestProps.max_attempts)
    pageNotif = "test_max_attempts_exceeded";

  if (pageNotif) return { pageNotif };

  const numQuestions = await CourseQuestion.where(
    "course_test_id",
    courseTestProps.id
  ).count();
  if (numQuestions < 1) return { pageNotif: "test_no_questions" };

  const testEndtime = courseTestProps.duration_mins
    ? new Date(
        currentDatetime.getTime() + courseTestProps.duration_mins * 60000
      )
    : null;

  try {
    const studentTestData = {
      user_id: +validatedUser.id,
      course_test_id: courseTestProps.id,
      test_name: courseTestProps.name,
      questions_answers: [],
      duration_mins: courseTestProps.duration_mins,
      deadline: courseTestProps.deadline,
      endtime: testEndtime,
      attempt_number: priorAttempts + 1,
      max_attempts: courseTestProps.max_attempts,
      max_score: courseTestProps.max_score,
      format: courseTestProps.format,
      institution_id: validatedUser.institution_id,
      department_id: courseProps.department_id
    };

    //console.log(studentTestData)
    const newStudentTest = await StudentTest.forge(studentTestData).save();
    return newStudentTest;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.finish = async (req, reply) => {
  const allowedRoles = ["STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  const postBody = { ...req.body };
  const studentTest = await StudentTest.where({
    id: +postBody.student_test_id,
    submitted_at: null
  }).fetch();
  const studentTestProps = (studentTest && studentTest.attributes) || {};
  const currentDatetime = new Date();
  const maxEndTime = new Date(studentTestProps.endtime.getTime() + 60000); // add 1 minute grace

  let pageNotif = "";
  // console.log(typeof studentTest.get('user_id'), typeof validatedUser.id, studentTest.user_id == validatedUser.id)

  // Do all validations here
  if (!studentTest) pageNotif = "invalid_test_submit_attempt";
  if (studentTestProps.submitted_at) pageNotif = "test_already_submitted";
  else if (studentTestProps.user_id != +validatedUser.id)
    pageNotif = "test_wronguser_submit_attempt";
  else if (studentTestProps.endtime && currentDatetime > maxEndTime)
    pageNotif = "test_endtime_exeeded";
  else if (
    studentTestProps.deadline &&
    currentDatetime > studentTestProps.deadline
  )
    pageNotif = "test_late_submit_attempt";

  if (pageNotif) return { pageNotif };

  // getRelated won't work for this type of child object, so fetch children seperately
  const testQuestions = await CourseQuestion.where(
    "course_test_id",
    studentTestProps.course_test_id
  ).fetchAll();
  const questionsByID = {};

  if (!testQuestions.length) return { pageNotif: "test_no_questions" };

  testQuestions.forEach(testQuestion => {
    questionsByID[testQuestion.id] = testQuestion;
  });

  try {
    const studentTestData = {
      questions_answers: postBody.questions_answers.map(question_answer => {
        let testQuestionProps =
          questionsByID[question_answer.questionId].attributes;

        question_answer.selection &&
          Object.entries(testQuestionProps.options).forEach(
            ([optionKey, option]) => {
              if (!question_answer.selection[optionKey]) return;
              question_answer.selection[optionKey].text = option.text;
            }
          );

        return {
          questionId: question_answer.questionId,
          questionOrder: testQuestionProps.order,
          questionMarks: testQuestionProps.marks,
          questionText: testQuestionProps.question,
          selection:
            question_answer.selection ||
            ((question_answer.text_answer || question_answer.file_answer) && {
              text_answer: question_answer.text_answer,
              file_answer: question_answer.file_answer
            }) ||
            ""
        };
      }),
      score:
        postBody.questions_answers.length &&
        postBody.questions_answers[0].selection
          ? calculateTestScore(postBody.questions_answers, questionsByID)
          : 0
    };

    // questions_answers will be automatically stringified by the model
    studentTestData.submitted_at = currentDatetime;
    //console.log(studentTestData)

    studentTest.set(studentTestData);
    await studentTest.save();

    return studentTest;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.mark = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  const postBody = { ...req.body };
  const studentTest = await StudentTest.where({
    id: +postBody.student_test_id,
  }).fetch({ require: false });
  const studentTestProps = (studentTest && studentTest.attributes) || {};
  const currentDatetime = new Date();
  const maxEditTime =
    studentTestProps.marked_at &&
    new Date(studentTestProps.marked_at.getTime() + 30 * 60000);

  let pageNotif = "";
  // console.log(typeof studentTest.get('user_id'), typeof validatedUser.id, studentTest.user_id == validatedUser.id)

  // Do all validations here
  if (!studentTest) pageNotif = "invalid_test_marking_attempt";
  if (!studentTestProps.submitted_at) pageNotif = "test_not_submitted";
  else if (studentTestProps.marked_at && currentDatetime > maxEditTime)
    pageNotif = "test_edit_time_exeeded";
  
  // Additional validation for assignment submissions
  if (studentTestProps.format === "assignment" && !postBody.score) {
    pageNotif = "assignment_score_required";
  }

  if (pageNotif) return { pageNotif };
  //console.log(1111, studentTest.attributes.questions_answers)
  try {
    const studentTestData = {
      score: postBody.score,
      marked_by: validatedUser.id,
      marked_at: currentDatetime
    };

    // Add feedback if provided - store as structured array
    if (postBody.feedback) {
      // If feedback is an array of objects with questionId and feedback
      if (Array.isArray(postBody.feedback)) {
        const feedbackArray = postBody.feedback
          .map((feedbackItem) => {
            if (feedbackItem && feedbackItem.feedback && feedbackItem.feedback.trim()) {
              return {
                questionId: feedbackItem.questionId,
                feedback: feedbackItem.feedback.trim()
              };
            }
            return null;
          })
          .filter(Boolean);
        studentTestData.feedback = feedbackArray;
      } else {
        // If it's a single feedback object
        if (postBody.feedback.feedback && postBody.feedback.feedback.trim()) {
          studentTestData.feedback = [{
            questionId: postBody.feedback.questionId,
            feedback: postBody.feedback.feedback.trim()
          }];
        }
      }
    }

    // Feedback will be automatically handled as JSON by the database

    //console.log(2222, postBody, studentTest, studentTest.questions_answers)
    console.log(studentTestData)
    studentTest.set(studentTestData);
    await studentTest.save();

    return studentTest;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.newStudentTestController = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  let withRelated = ["user"];

  // let query = StudentTest.forge().orderBy('id', 'desc')
  let query;

  if (validatedUser.role == "STUDENT") {
    // query.where("user_id", +validatedUser.id)
    query = `SELECT DISTINCT student_test.id, course_test_id, test_name, course."name" FROM student_test JOIN course_test on student_test.course_test_id = course_test.id JOIN course on course_test.course_id = course.id WHERE student_test.user_id = ${validatedUser.id} ORDER BY student_test.id DESC;`;
    withRelated = [];
  } else {
    // Incase we add a new role and forget to filter :)
    query = `SELECT DISTINCT student_test.id, course_test_id, test_name, course."name" FROM student_test JOIN course_test on student_test.course_test_id = course_test.id JOIN course on course_test.course_id = course.id ORDER BY student_test.id DESC`;
  }

  try {
    const studentCourseTestName = await Bookshelf.knex.raw(query).then(data => {
      //console.log(data);
      return data.rows;
    });

    return studentCourseTestName;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.uploadTestResults = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  ),
  postBody = { ...req.body };

  // let resultsFileData = "";

  // if (postBody.results_file) {
  //   let buff = Buffer.from(postBody.results_file, "base64");
  //   resultsFileData = buff.toString("utf8");
  // }

  if (!postBody.results_file) return "error_no_file_received";

  //console.log(postBody.results_file);
  // return

  const testID = +postBody.test_id,
    studentsByMatricNo = {},
    studentTests = []
  
  let courseTest = null,
    courseProps = null;
  
  const output = {
    rows_received: 0,
    rows_confirmed: 0,
    rows_saved: 0,
    errors: {}
  }
  
  if (!testID) output.errors["error-1"] = "no_test_selected";

  //Ensure testID is valid and for my institution
  // TODO: improve this so staff can only upload for own course
  const {availableTests, testCourseData} = await getAvailableTestsWithCourses(validatedUser.institution_id);
  
  for (let test of availableTests) {
    if(test.get("id") == testID && test.get("format") == "offline") {
      courseTest = test;
      courseProps = testCourseData[courseTest.get("id")];
      break;
    }
  }

  if (!(courseTest && courseTest.get("id"))) output.errors["error-2"] = "invalid_test_selected";
  
  if (Object.keys(output.errors).length) return output;
  
  let courseTestProps = courseTest.attributes,
    rowNum = 0;

  let testSubmissions = await StudentTest.where({
    course_test_id: +courseTestProps.id
  }).fetchAll({
    columns: ["user_id"]
  });
  if (testSubmissions.models) testSubmissions = testSubmissions.models;

  const testSubmitterUserIDS = testSubmissions.map(submission => +submission.get("user_id"));

  //console.log(testID, courseProps, courseTestProps, testSubmitterUserIDS);

  await csv()
  .fromString(postBody.results_file)
  .then(async (rowObjects) => {
    for (let [i, row] of rowObjects.entries()) {
      output.rows_received++;
      //console.log (i, row, output); 
      let user = null,
        student = null;

      if (i == 0 && !("matric_no" in row && "score" in row)) {
        throw "Invalid CSV column headers. First row should be matric_no and score";
      }
      
      if (row.matric_no) {
        let matric_no = row.matric_no

        if (!(matric_no in studentsByMatricNo)) {
          // To ensure we db fetch student object only once per student
          try {
            student = await Student.where(
              "reg_no", matric_no).fetch({
              withRelated: ["user"]
            });

            if (student && student.get("id")) {
              studentsByMatricNo[matric_no] = student;
            }
          } catch (err) {
            console.log(err);
          }
        }

        student = studentsByMatricNo[matric_no] || null // handles both student fetched from db, or array

        user = student 
            && student.relations.user 
            && student.relations.user.attributes;
      }
      //console.log(i, user, testSubmitterUserIDS);

      if (!(user && user.id)) {
        output.errors[`file-row-${i+2}`] = `Invalid matric number - ${row.matric_no} - check spelling`;
        //console.log(i, "bad matric upload attempt");
      }
      else if(testSubmitterUserIDS.indexOf(+user.id) > -1) continue; // Already submitted
      else {
        let studentTestData = {
          user_id: +user.id,
          course_test_id: +courseTestProps.id,
          test_name: courseTestProps.name,
          duration_mins: +courseTestProps.duration_mins,
          deadline: courseTestProps.deadline,
          max_attempts: courseTestProps.max_attempts,
          score:+(row.score || 0),
          max_score: courseTestProps.max_score,
          format: "offline",
          institution_id: validatedUser.institution_id,
          department_id: courseProps && courseProps.department_id
        };

        studentTests.push(studentTestData);
        output.rows_confirmed++;
      }
    
    };

    if (studentTests.length) {
      const StudentTests = Bookshelf.Collection.extend({
        model: StudentTest
      });
      
      //console.log(...studentTests.slice(0, 6))
      const studentTestsq = StudentTests.forge(studentTests)  
      await studentTestsq.invokeThen('save').then(function() {
        output.rows_saved = studentTests.length;
      });
      //console.log(studentTests)
    }
    
    //console.log(output);
    reply.send(output);
  });
};

async function getAvailableTestsWithCourses(institution_id) {
  const availableTests = []
  const testCourseData = {}
  
  let availableCourses = await getInstitutionCourses(institution_id, "course_tests")
  if (availableCourses.models) availableCourses = availableCourses.models;
  
  if (availableCourses && availableCourses.length) {
    for (let course of availableCourses) {
      if (
        course &&
        course.relations &&
        course.relations.course_tests &&
        course.relations.course_tests.models.length
      ) {
        for (let test of course.relations.course_tests.models) {
          testCourseData[test.get("id")] = course.attributes
          availableTests.push(test);
        }
      }
    }
  }

  return {availableTests, testCourseData};
}
