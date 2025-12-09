const boom = require("boom");
const CourseQuestion = require("../models/CourseQuestion");
const CourseTest = require("../models/CourseTest");
const makeAnswerString = require("../helpers/utils").stringAnswerFromSelection;
const checkAccess = require("../helpers/utils").checkAccess;

// Get all CourseQuestions
exports.list = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    let query = CourseQuestion.forge().orderBy("order", "asc");
    if (filterKey && filterValue) query.where(filterKey, +filterValue);

    let courseQuestions = await query.fetchAll();
    if (courseQuestions.models) courseQuestions = courseQuestions.models;

    if (!canSeeAnswers(validatedUser))
      courseQuestions.forEach((question, i) => {
        if (!question.get("options")) return;

        // Calculate and add question type before removing answer data
        const options = question.get("options");
        const correctAnswersCount = Object.values(options).filter(
          (option) => option.is_answer === true
        ).length;
        const questionType =
          correctAnswersCount > 1 || correctAnswersCount === 0
            ? "multiple"
            : "single";
        courseQuestions[i].set("question_type", questionType);

        Object.keys(question.get("options")).forEach((key) => {
          courseQuestions[i].get("options")[key].is_answer = null;
        });
        delete courseQuestions[i].attributes.answer;
      });

    // console.log(">>>>vvv>>>>>", courseQuestions);
    return courseQuestions;
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

  try {
    const courseQuestion = await CourseQuestion.where(
      "id",
      req.params.id
    ).fetch();
    const isQuiz = courseQuestion.get("options");

    if (isQuiz && !canSeeAnswers(validatedUser)) {
      // Calculate and add question type before removing answer data
      const options = courseQuestion.get("options");
      const correctAnswersCount = Object.values(options).filter(
        (option) => option.is_answer === true
      ).length;
      const questionType =
        correctAnswersCount > 1 || correctAnswersCount === 0
          ? "multiple"
          : "single";
      courseQuestion.set("question_type", questionType);

      Object.keys(courseQuestion.get("options")).forEach((key) => {
        courseQuestion.get("options")[key].is_answer = null;
      });
      delete courseQuestion.attributes.answer;
    }

    return courseQuestion;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.add = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  let postBody = { ...req.body },
    answerString = postBody.options ? makeAnswerString(postBody.options) : "";

  postBody["answer"] = answerString;

  try {
    const newCourseQuestion = await CourseQuestion.forge(postBody).save();
    const updatedCourseTest = await updateTestMaxScore(postBody.course_test_id);
    newCourseQuestion.set({ courseTest: updatedCourseTest });

    return newCourseQuestion;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.update = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const courseQuestion = await CourseQuestion.where(
      "id",
      req.params.id
    ).fetch();

    if (courseQuestion) {
      let postBody = { ...req.body },
        answerString = postBody.options
          ? makeAnswerString(postBody.options)
          : "";

      if (!(postBody.answer && postBody.answer == answerString)) {
        postBody["answer"] = answerString;
      }

      courseQuestion.set(postBody);
      await courseQuestion.save();

      const updatedCourseTest = await updateTestMaxScore(
        postBody.course_test_id
      );
      courseQuestion.set({ courseTest: updatedCourseTest });
    }

    return courseQuestion;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.delete = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const question = await CourseQuestion.where("id", req.params.id).fetch();
    const info = await CourseQuestion.where("id", req.params.id).destroy();

    if (!(info && info.error))
      updateTestMaxScore(question.attributes.course_test_id);

    return info;
  } catch (err) {
    throw boom.boomify(err);
  }
};

async function updateTestMaxScore(test_id) {
  const courseTest = await CourseTest.where("id", test_id).fetch();

  if (!(courseTest && courseTest.id)) return;
  let maxScore = 0;

  let courseQuestions = await CourseQuestion.where(
    "course_test_id",
    test_id
  ).fetchAll();
  if (courseQuestions.models) {
    courseQuestions = courseQuestions.models;
  }

  courseQuestions.forEach((courseQuestion) => {
    maxScore += courseQuestion.attributes.marks;
  });

  if (courseTest.max_score !== maxScore) {
    await courseTest.set({ max_score: maxScore });
    courseTest.save();
    return courseTest;
  }

  return false;
}

function canSeeAnswers(user, test) {
  // TODO: Return false if not SUPERADMIN and not my course's test

  return ["SUPERADMIN", "HOD", "STAFF"].indexOf(user.role) > -1;
}
