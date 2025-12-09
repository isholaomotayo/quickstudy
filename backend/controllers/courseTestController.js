const boom = require("boom");
const CourseTest = require("../models/CourseTest");
const CourseQuestion = require("../models/CourseQuestion");
const {
  checkAccess,
  checkPaymentCurrent,
  setUnpublishedError,
} = require("../helpers/utils");

// Get all CourseTests
exports.list = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    let query = CourseTest.forge().orderBy("id", "desc");

    if (filterKey && filterValue) query.where(filterKey, +filterValue);
    else if (req.query) query.where(req.query);

    let courseTests = await query.fetchAll();

    if (courseTests && courseTests.models) courseTests = courseTests.models;

    if (req.query && req.query.taken) {
      // Filter to show only tests that have student submissions
    }

    return courseTests;
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
  const currentDatetime = new Date();

  try {
    const courseTest = await CourseTest.where("id", req.params.id).fetch();

    // Fetch questions separately
    const questions = await CourseQuestion.where(
      "course_test_id",
      req.params.id
    ).fetchAll();

    const result = courseTest.toJSON();
    result.course_questions = questions.models.map((q) => q.toJSON());

    // Check my payment status only for active tests (i.e: with deadlines in future)
    if (result && !(result.deadline && result.deadline < currentDatetime)) {
      await checkPaymentCurrent(reply, validatedUser);
    }

    if (validatedUser.role == "STUDENT" && result && !result.published) {
      setUnpublishedError(reply);
      return;
    }

    return result;
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

  try {
    const newCourseTest = await CourseTest.forge(req.body).save();

    return newCourseTest;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.createBulkAssignment = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const { questions, ...courseTestData } = req.body;

    // Create the course test first
    const newCourseTest = await CourseTest.forge(courseTestData).save();

    // Create all questions for this test using the course_test_id
    const createdQuestions = [];
    if (questions && Array.isArray(questions)) {
      for (const questionData of questions) {
        const questionPayload = {
          ...questionData,
          course_test_id: newCourseTest.id,
        };

        const newQuestion = await CourseQuestion.forge(questionPayload).save();
        createdQuestions.push(newQuestion);
      }
    }

    // Update the test's max_score based on all questions
    let totalMaxScore = 0;
    createdQuestions.forEach((question) => {
      totalMaxScore += question.get("marks") || 0;
    });

    await newCourseTest.set({ max_score: totalMaxScore }).save();

    // Return the created test with its questions
    const result = {
      ...newCourseTest.toJSON(),
      course_questions: createdQuestions.map((q) => q.toJSON()),
    };

    return result;
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
    // Filter out questions from the request body - only update course test fields
    const {
      course_questions,
      questions: questionsData,
      ...courseTestData
    } = req.body;

    const courseTest = await CourseTest.where("id", req.params.id).fetch();
    if (courseTest) {
      courseTest.set(courseTestData);
      await courseTest.save();
    }

    // Fetch questions separately and include them in the response
    const questions = await CourseQuestion.where(
      "course_test_id",
      req.params.id
    ).fetchAll();

    const result = courseTest.toJSON();
    result.course_questions = questions.models.map((q) => q.toJSON());

    return result;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.delete = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    // Check if any students have taken this test
    const StudentTest = require("../models/StudentTest");
    const studentTestCount = await StudentTest.where(
      "course_test_id",
      req.params.id
    ).count();

    if (studentTestCount > 0) {
      return reply.code(400).send({
        error: "Cannot delete assignment",
        message: `This assignment cannot be deleted because ${studentTestCount} student(s) have already taken it. To delete this assignment, you must first remove all student submissions.`,
        studentTestCount: studentTestCount,
      });
    }

    // First, check if there are any questions and delete them if they exist
    const questions = await CourseQuestion.where(
      "course_test_id",
      req.params.id
    ).fetchAll();
    if (questions && questions.length > 0) {
      await CourseQuestion.where("course_test_id", req.params.id).destroy();
    }

    // Then delete the test itself
    const info = await CourseTest.where("id", req.params.id).destroy();
    return info;
  } catch (err) {
    throw boom.boomify(err);
  }
};
