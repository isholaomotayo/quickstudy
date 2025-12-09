// External Dependancies
const boom = require("boom");

// Get Data Models
const StudentResult = require("../models/StudentResult");
const StudentCourse = require("../models/StudentCourse");
const Course = require("../models/Course");
const calculateAndUpdateGPA =
  require("./studentGpaController").calculateAndUpdateGPA;
const checkAccess = require("../helpers/utils").checkAccess;
// Get all studentResults
exports.getStudentResults = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    let query = StudentResult.forge();

    if (req.query) {
      for (var key in req.query) {
        if (typeof req.query[key] == "object") {
          query.where(key, "IN", req.query[key]);
        } else {
          query.where(key, req.query[key]);
        }
      }
    }

    const studentResults = await query.fetchAll({
      withRelated: [
        "grade",
        "studentcourse.student",
        "studentcourse.course",
        "studentcourse.level",
        "studentcourse.semester",
      ],
    });

    return studentResults;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get studentResults by Student ID with published set as true
exports.getStudentResultByStudentId = async (req, reply) => {
  try {
    const studentId = req.params.student_id;

    const studentResults = await StudentResult.where({
      publish: true,
    })
      .query((qb) => {
        qb.innerJoin(
          "student_course",
          "student_result.student_course_id",
          "student_course.id"
        );
        qb.where("student_course.student_id", "=", studentId);
      })
      .fetchAll({
        withRelated: [
          "grade",
          "studentcourse.student",
          "studentcourse.course",
          "studentcourse.level",
          "studentcourse.semester",
        ],
      });

    return studentResults;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new studentResult (supports both single and batch)
exports.addStudentResult = async (req, reply) => {
  try {
    const params = req.body;

    // Check if this is a batch request by looking for 'results' array
    if (params.results && Array.isArray(params.results)) {
      return await exports.addStudentResultsBatch(req, reply);
    }

    // Single result upload validation - only run if NOT a batch request

    // Manual validation for single uploads
    if (!params.student_course_id) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "student_course_id is required for single result upload",
      });
    }
    if (!params.grade_id) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "grade_id is required",
      });
    }
    if (params.score === undefined || params.score === null) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "score is required",
      });
    }

    // Set results as approved and published for GPA calculation
    const resultData = {
      ...params,
      approved: true,
      publish: true,
    };

    const studentResult = await StudentResult.forge(resultData).save();

    const result = await studentResult.fetch({
      withRelated: [
        "grade",
        "studentcourse.student",
        "studentcourse.course",
        "studentcourse.level",
        "studentcourse.semester",
      ],
    });

    // Calculate GPA for the student after successful upload
    const studentCourse = await StudentCourse.where({
      id: params.student_course_id,
    }).fetch({
      withRelated: ["student"],
    });

    if (studentCourse) {
      const studentId = studentCourse.related("student").get("id");
      await calculateAndUpdateGPA(studentId);
    }

    return result;
  } catch (err) {
    console.error("Error in addStudentResult:", err);
    throw boom.boomify(err);
  }
};

// Update an existing studentResult
exports.updateStudentResult = async (req, reply) => {
  try {
    const id = req.params.id;
    const studentResult = req.body;
    const { ...updateData } = studentResult;
    const update = await StudentResult.forge({ id: id }).save(updateData, {
      patch: true,
    });

    const result = await update.fetch({
      withRelated: [
        "grade",
        "studentcourse.student",
        "studentcourse.course",
        "studentcourse.level",
        "studentcourse.semester",
      ],
    });
    return result;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an studentResult by id
exports.deleteStudentResult = async (req, reply) => {
  try {
    const id = req.params.id;
    const studentResult = await new StudentResult({ id: id }).destroy();
    return studentResult;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Generate CSV template for result upload
exports.generateResultTemplate = async (req, reply) => {
  try {
    const courseId = req.params.course_id;
    const semesterId = req.query.semester_id;

    // Get course with related department and faculty data
    const course = await Course.where({ id: courseId }).fetch({
      withRelated: ["department.faculty"],
    });

    if (!course) {
      throw new Error("Course not found");
    }

    // Build query for student course registrations - DO NOT filter by semester here
    // Get all students for the course, just like the frontend does
    let query = StudentCourse.where({ course_id: courseId });

    // DON'T filter by semester in SQL - let the shared filter do it
    // This ensures both frontend and backend start with the same raw data

    // Get student course registrations with all related data
    const studentCourses = await query.fetchAll({
      withRelated: ["student.user", "level", "semester"],
    });

    // Use shared filtering utility (same as frontend) to create filtered student list
    const {
      filterStudentsForSemester,
    } = require("../../helpers/studentFilterUtils");
    const filterResult = filterStudentsForSemester(
      studentCourses.models,
      semesterId,
      true
    );

    // Transform filtered results for CSV generation
    const students = filterResult.students.map((sc) => {
      const student = sc.related("student");
      const user = student.related("user");
      const level = sc.related("level");
      const semester = sc.related("semester");

      return {
        student_course_id: sc.get("id"),
        surname: user.get("last_name") || "",
        firstname: user.get("first_name") || "",
        othername: user.get("other_name") || "",
        reg_no: student.get("reg_no"),
        level_name: level.get("name") || "",
        semester_name: semester.get("name") || "",
      };
    });

    if (students.length === 0) {
      throw new Error(
        "No valid students found for this course" +
          (semesterId ? " and semester" : "") +
          ". Students must have registration numbers to be included."
      );
    }

    // Get course data
    const courseData = {
      course_name: course.get("name"),
      course_code: course.get("code"),
      units: course.get("units"),
      department_name: course.related("department").get("name") || "",
      faculty_name:
        course.related("department").related("faculty").get("name") || "",
    };

    // Generate CSV content
    let csvContent = "";

    // Header information - show ACTUAL filtered count that matches frontend
    csvContent += `UNIVERSITY OF NIGERIA NSUKKA\n`;
    csvContent += `Centre for Distance & e-Learning (CDeL)\n`;
    csvContent += `OFFICIAL GRADE REPORT \n`;
    csvContent += `${students.length} student registrations found for ${
      courseData.course_code
    } in ${students[0]?.semester_name || ""}.\n\n`;

    csvContent += `Title of Course:,${courseData.course_name},,Course No:,${courseData.course_code}\n`;
    csvContent += `Examination Date:,,,Unit:,${courseData.units}\n`;
    csvContent += `Department:,${courseData.department_name},,Semester:,${
      students[0]?.semester_name || ""
    }\n`;
    csvContent += `Faculty:,${courseData.faculty_name},,Session:,2024/2025\n`;
    csvContent += `Name of Lecturer:,\n\n`;

    // Add separator before table header
    csvContent += `---DATA---\n`;

    // Table headers
    csvContent += `S/N,Name of Student (Surname First),Reg. No,CA Mark,Exam Score,Total,Letter Grade\n`;

    // Student rows (sorted by reg_no for consistency)
    students
      .sort((a, b) => a.reg_no.localeCompare(b.reg_no))
      .forEach((student, index) => {
        const fullName = `${student.surname}, ${student.firstname} ${
          student.othername || ""
        }`.trim();
        // Properly quote the name field to handle commas
        csvContent += `${index + 1},"${fullName}",${student.reg_no},,,,,""\n`;
      });

    // Add separator after table data
    csvContent += `---DATA---\n`;

    csvContent += `\n`;
    csvContent += `Score,Letter Grade\n`;
    csvContent += `70-100,A = Excellent\n`;
    csvContent += `60-69,B = Very Good\n`;
    csvContent += `50-59,C = Good\n`;
    csvContent += `45-49,D = Fair\n`;
    csvContent += `44-40,E = Pass\n`;
    csvContent += `39-0,F = Fail\n\n`;

    csvContent += `SUMMARY OF GRADES:\n`;
    csvContent += `A's,B's,C's,D's,E's,F's\n`;
    csvContent += `,,,,,,\n\n`;

    csvContent += `Lecturer's Signature:,,Date:\n`;
    csvContent += `Prog. Coord. Signature:,,Date:\n`;
    csvContent += `Director's Signature:,,Date:\n`;

    // Set response headers for CSV download
    reply.header("Content-Type", "text/csv");
    reply.header(
      "Content-Disposition",
      `attachment; filename="${courseData.course_code}_result_template.csv"`
    );

    return csvContent;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add multiple studentResults in a batch
exports.addStudentResultsBatch = async (req, reply) => {
  try {
    const { results } = req.body; // Expecting an array of result objects

    if (!Array.isArray(results) || results.length === 0) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message:
          "Results array is required and cannot be empty for batch upload",
      });
    }

    const uploadedResults = [];
    const errors = [];
    const affectedStudents = new Set(); // Track students for GPA calculation

    // Use a transaction to ensure data integrity for valid results
    const knex = require("../config/connection").knex;

    try {
      await knex.transaction(async (trx) => {
        for (let i = 0; i < results.length; i++) {
          const resultData = results[i];

          try {
            // Validate required fields before processing each result
            if (!resultData.student_course_id) {
              errors.push({
                index: i + 1,
                regNo: resultData._metadata?.regNo || "N/A",
                error: "Missing student_course_id",
              });
              continue; // Skip this record but continue with others
            }

            if (!resultData.grade_id) {
              errors.push({
                index: i + 1,
                regNo: resultData._metadata?.regNo || "N/A",
                error: "Missing grade_id",
              });
              continue; // Skip this record but continue with others
            }

            if (!resultData.score && resultData.score !== 0) {
              errors.push({
                index: i + 1,
                regNo: resultData._metadata?.regNo || "N/A",
                error: "Missing score",
              });
              continue; // Skip this record but continue with others
            }

            // Check if result already exists for this student_course
            const existingResult = await StudentResult.where({
              student_course_id: resultData.student_course_id,
            }).fetch({ transacting: trx, require: false });

            let studentId;

            if (existingResult) {
              // Update existing result with approved and published status
              const updated = await existingResult.save(
                {
                  score: resultData.score,
                  grade_id: resultData.grade_id,
                  ca_mark: resultData.ca_mark || null,
                  exam_score: resultData.exam_score || null,
                  approved: true,
                  publish: true,
                },
                { patch: true, transacting: trx }
              );

              const result = await updated.fetch({
                withRelated: [
                  "grade",
                  "studentcourse.student.user",
                  "studentcourse.course",
                  "studentcourse.level",
                  "studentcourse.semester",
                ],
                transacting: trx,
              });

              // Get student ID for GPA calculation
              studentId = result
                .related("studentcourse")
                .related("student")
                .get("id");

              uploadedResults.push({
                id: result.get("id"),
                student_course_id: resultData.student_course_id,
                score: result.get("score"),
                grade: result.related("grade").get("name"),
                status: "Updated",
                regNo: resultData._metadata?.regNo || "N/A",
                studentId: studentId, // Add for debugging
              });
            } else {
              // Create new result with approved and published status
              const studentResult = await StudentResult.forge({
                student_course_id: resultData.student_course_id,
                score: resultData.score,
                grade_id: resultData.grade_id,
                ca_mark: resultData.ca_mark || null,
                exam_score: resultData.exam_score || null,
                approved: true,
                publish: true,
              }).save(null, {
                transacting: trx,
              });

              const result = await studentResult.fetch({
                withRelated: [
                  "grade",
                  "studentcourse.student.user",
                  "studentcourse.course",
                  "studentcourse.level",
                  "studentcourse.semester",
                ],
                transacting: trx,
              });

              // Get student ID for GPA calculation
              studentId = result
                .related("studentcourse")
                .related("student")
                .get("id");

              uploadedResults.push({
                id: result.get("id"),
                student_course_id: resultData.student_course_id,
                score: result.get("score"),
                grade: result.related("grade").get("name"),
                status: "Created",
                regNo: resultData._metadata?.regNo || "N/A",
                studentId: studentId, // Add for debugging
              });
            }

            // Track student for GPA calculation (ensure we have a valid studentId)
            if (studentId) {
              affectedStudents.add(studentId);
            }
          } catch (error) {
            console.error(`Error processing result ${i + 1}:`, error);
            errors.push({
              index: i + 1,
              regNo: resultData._metadata?.regNo || "N/A",
              error: error.message,
            });
            // Continue processing other records even if this one fails
            continue;
          }
        }
      });
    } catch (transactionError) {
      console.error("Transaction failed:", transactionError);
      throw transactionError;
    }

    // Calculate GPA for all affected students after successful batch upload
    console.log(
      `Starting GPA calculation for ${
        affectedStudents.size
      } affected students: ${Array.from(affectedStudents)}`
    );
    const gpaResults = [];

    if (affectedStudents.size > 0) {
      for (const studentId of affectedStudents) {
        try {
          console.log(`Calculating GPA for student ${studentId}...`);
          const gpaResult = await calculateAndUpdateGPA(studentId);
          gpaResults.push(gpaResult);
          console.log(
            `GPA calculation completed for student ${studentId}: CGPA = ${gpaResult.cgpa}`
          );
        } catch (gpaError) {
          console.error(
            `Error calculating GPA for student ${studentId}:`,
            gpaError
          );
          // Add error to results but don't fail the entire operation
          gpaResults.push({
            studentId,
            error: gpaError.message,
            success: false,
          });
        }
      }
    } else {
      console.warn("No affected students found for GPA calculation");
    }

    console.log(
      `Batch upload completed: ${uploadedResults.length} successful, ${errors.length} errors, ${gpaResults.length} GPA calculations`
    );

    return {
      success: true,
      uploaded: uploadedResults.length,
      errors: errors.length,
      results: uploadedResults,
      errorDetails: errors,
      gpaCalculations: gpaResults,
      affectedStudentsCount: affectedStudents.size,
      affectedStudents: Array.from(affectedStudents), // For debugging
    };
  } catch (err) {
    console.error("Batch upload error:", err);
    throw boom.boomify(err);
  }
};

// Get student results with calculated GPA
exports.getStudentResultsWithGPA = async (req, reply) => {
  try {
    const studentId = req.params.student_id;

    // Get published results
    const studentResults = await StudentResult.where({
      publish: true,
    })
      .query((qb) => {
        qb.innerJoin(
          "student_course",
          "student_result.student_course_id",
          "student_course.id"
        );
        qb.where("student_course.student_id", "=", studentId);
      })
      .fetchAll({
        withRelated: [
          "grade",
          "studentcourse.student",
          "studentcourse.course",
          "studentcourse.level",
          "studentcourse.semester",
        ],
      });

    // Calculate GPA
    const gpaData = await calculateAndUpdateGPA(studentId);

    return {
      results: studentResults,
      gpaData: gpaData,
    };
  } catch (err) {
    throw boom.boomify(err);
  }
};
