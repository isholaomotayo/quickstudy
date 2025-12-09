const boom = require("boom");
const StudentTest = require("../models/StudentTest");
const CourseTest = require("../models/CourseTest");
const CourseQuestion = require("../models/CourseQuestion");
const User = require("../models/User");
const checkAccess = require("../helpers/utils").checkAccess;
const setPaginationHeaders = require("../helpers/utils").setPaginationHeaders;
const Bookshelf = require("../config/connection").Bookshelf;

// Get assignment submissions for grading
exports.getAssignmentSubmissions = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const { course_test_id } = req.query;

    if (!course_test_id) {
      throw boom.badRequest("course_test_id is required");
    }

    let query = StudentTest.forge()
      .where("course_test_id", course_test_id)
      .where("format", "assignment")
      .orderBy("submitted_at", "desc");

    // Apply role-based filtering
    if (validatedUser.role === "STAFF") {
      query.where("department_id", +validatedUser.staff.department_id);
    } else if (validatedUser.role === "HOD") {
      query.where("department_id", +validatedUser.staff.department_id);
    } else if (validatedUser.role === "ADMIN") {
      query.where("institution_id", +validatedUser.institution_id);
    }

    const { pgsize = 50, pg = 1 } = req.query;

    let submissions = await query.fetchPage({
      pageSize: pgsize,
      page: pg,
      withRelated: ["user"],
    });

    if (submissions.pagination) {
      setPaginationHeaders(reply, submissions.pagination);
    }

    if (submissions.models) {
      submissions = submissions.models;
    }

    return submissions;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Submit assignment with files
exports.submitAssignment = async (req, reply) => {
  const allowedRoles = ["STUDENT"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  try {
    const { course_test_id, questions_answers } = req.body;

    if (!course_test_id || !questions_answers) {
      throw boom.badRequest(
        "course_test_id and questions_answers are required"
      );
    }

    // Verify the assignment exists and is active
    const courseTest = await CourseTest.where("id", course_test_id).fetch();
    if (!courseTest) {
      throw boom.notFound("Assignment not found");
    }

    if (courseTest.get("format") !== "assignment") {
      throw boom.badRequest("invalid_assignment_format");
    }

    if (!courseTest.get("published")) {
      throw boom.forbidden("assignment_not_published");
    }

    // Check deadline
    const deadline = courseTest.get("deadline");
    if (deadline && new Date() > new Date(deadline)) {
      throw boom.forbidden("assignment_deadline_passed");
    }

    // Check if student has already submitted
    const existingSubmission = await StudentTest.where({
      user_id: validatedUser.id,
      course_test_id: course_test_id,
    }).fetch();

    if (existingSubmission) {
      throw boom.conflict("assignment_already_submitted");
    }

    // Process file uploads if any
    const processedAnswers = await Promise.all(
      questions_answers.map(async (answer) => {
        const processedAnswer = { ...answer };

        if (answer.files && answer.files.length > 0) {
          // Process file uploads to Cloudinary
          const uploadedFiles = await Promise.all(
            answer.files.map(async (file) => {
              // Here you would implement the actual file upload to Cloudinary
              // For now, we'll assume the file URLs are already provided
              return {
                name: file.name,
                url: file.url,
                size: file.size,
              };
            })
          );
          processedAnswer.files = uploadedFiles;
        }

        return processedAnswer;
      })
    );

    // Calculate total possible score
    const questions = await CourseQuestion.where(
      "course_test_id",
      course_test_id
    ).fetchAll();
    const maxScore = questions.reduce(
      (total, question) => total + question.get("marks"),
      0
    );

    // Create submission
    const submission = await StudentTest.forge({
      user_id: validatedUser.id,
      course_test_id: course_test_id,
      test_name: courseTest.get("name"),
      duration_mins: courseTest.get("duration_mins"),
      deadline: courseTest.get("deadline"),
      max_attempts: courseTest.get("max_attempts"),
      questions_answers: processedAnswers,
      score: 0, // Will be set by grader
      max_score: maxScore,
      format: "assignment",
      submitted_at: new Date(),
      institution_id: validatedUser.institution_id,
      department_id: validatedUser.student?.department_id,
    }).save();

    return submission;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Grade assignment submission
exports.gradeAssignment = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  try {
    const { submission_id } = req.params;
    const { score, feedback, marked_by } = req.body;

    if (!submission_id || score === undefined) {
      throw boom.badRequest("submission_id and score are required");
    }

    const submission = await StudentTest.where("id", submission_id).fetch();
    if (!submission) {
      throw boom.notFound("Submission not found");
    }

    if (submission.get("format") !== "assignment") {
      throw boom.badRequest("invalid_assignment_submission");
    }

    // Update submission with grade
    const updatedSubmission = await submission.save(
      {
        score: score,
        marked_by: marked_by || validatedUser.id,
        feedback: feedback,
        marked_at: new Date(),
      },
      { patch: true }
    );

    return updatedSubmission;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get assignment statistics
exports.getAssignmentStats = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  try {
    const { course_test_id } = req.query;

    if (!course_test_id) {
      throw boom.badRequest("course_test_id is required");
    }

    // Get total submissions
    const totalSubmissions = await StudentTest.where({
      course_test_id: course_test_id,
      format: "assignment",
    }).count();

    // Get graded submissions
    const gradedSubmissions = await StudentTest.where({
      course_test_id: course_test_id,
      format: "assignment",
    })
      .whereNotNull("marked_by")
      .count();

    // Get average score
    const avgScoreResult = await Bookshelf.knex("student_test")
      .where({
        course_test_id: course_test_id,
        format: "assignment",
      })
      .whereNotNull("marked_by")
      .avg("score as avg_score")
      .first();

    const avgScore = avgScoreResult ? parseFloat(avgScoreResult.avg_score) : 0;

    return {
      total_submissions: totalSubmissions,
      graded_submissions: gradedSubmissions,
      pending_submissions: totalSubmissions - gradedSubmissions,
      average_score: avgScore,
      completion_rate:
        totalSubmissions > 0 ? (gradedSubmissions / totalSubmissions) * 100 : 0,
    };
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Upload assignment files
exports.uploadAssignmentFiles = async (req, reply) => {
  const allowedRoles = ["STUDENT"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  try {
    const { files } = req.body;

    if (!files || !Array.isArray(files)) {
      throw boom.badRequest("Files array is required");
    }

    // Validate file types and sizes
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        throw boom.badRequest(`File type ${file.type} is not allowed`);
      }
      if (file.size > maxSize) {
        throw boom.badRequest(
          `File ${file.name} is too large. Maximum size is 10MB`
        );
      }
      return true;
    });

    // Here you would implement the actual file upload to Cloudinary
    // For now, we'll return the file information
    const uploadedFiles = validFiles.map((file) => ({
      name: file.name,
      url: file.url, // This would be the Cloudinary URL after upload
      size: file.size,
      type: file.type,
    }));

    return {
      success: true,
      files: uploadedFiles,
    };
  } catch (err) {
    throw boom.boomify(err);
  }
};
